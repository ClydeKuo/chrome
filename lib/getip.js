const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
let oldList=[]
if(fs.existsSync(`${__dirname}/list.json`)){
  oldList = JSON.parse(fs.readFileSync(`${__dirname}/list.json`))
}
const getIp=async (time=5)=>{
  // console.log(oldList)
    try{
      let data=await rp({
        uri: 'http://api.ip.data5u.com/dynamic/get.html?order=3bc5244c8eff09599e9e1b955b4847d3&json=1&sep=5',
      })
      if(!JSON.parse(data).success){
        let e={
          type:3,
          msg:JSON.parse(data).msg
        }
        throw e
      }
      let ip= JSON.parse(data).data[0].ip+":"+JSON.parse(data).data[0].port
      if(oldList.includes(ip)){
        let e={
          msg:`${ip}:已经出现过了`,
          type:1
        }
        throw e
      }
      oldList.push(ip)
      fs.writeFileSync(`${__dirname}/list.json`, JSON.stringify(oldList))
       let res=await check(ip)
       if(res.valid) return ip
    }catch(e){
      if(e.type<3){
        console.log(chalk.red(e.msg));
        await getIp()
      }else if(e.type>=3){
        throw e.msg
      }else{
        throw e
      }
    }
  }
  const check=async (ip)=>{
    try{
      let opt = {
        proxy: "http://"+ip,
        method: 'GET',
        url: "https://www.baidu.com",
        timeout: 5000
      }
      let check=await rp(opt)
      if(check){
        console.log(ip+":"+"is find")
        return {valid:true}
      }else{
        throw 1
      }
    }catch(e){
      let err={
        msg:`${ip}:is bad`,
        type:2
      }
      throw err
    }
  }
module.exports=getIp