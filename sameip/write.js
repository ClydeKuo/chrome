// 将域名导出到txt

const fs=require("fs")
const DB=require("./db")
const chalk = require("chalk");
let db = new DB();
const platform=require('os').platform();
const splitStr=platform==="win32"?"\r\n":"\n"
const init=async ()=>{
    try {
        await db.connect();
        let domainList=[]
        let date="2018-11-06"
        let data=await db.select({dnumber:{$gt:0},date:date})
        console.log(data.length)
        data.forEach(item=>{
            item.domains.unshift(item.addr)
            domainList=domainList.concat(item.domains)
        })
        console.log(domainList.length)
        fs.writeFileSync(`${__dirname}/data/domain-${date}.txt`,domainList.join(splitStr))
    } catch (e) {
        console.log(chalk.red(e));
    }finally{
        db.close()
    }
}
const rdp=async()=>{
    try {
        await db.connect();
        let date="2018-11-06"
        let data=await db.select({dnumber:{$gt:10},rdp:true})
        console.log(data.length)
        let res=data.map(item=>item.addr)
        fs.writeFileSync(`${__dirname}/data/rdp-${date}.txt`,res.join(splitStr))
    } catch (e) {
        console.log(chalk.red(e));
    }finally{
        db.close()
    }
}
const getShell=(start,end)=>{
    let str=""
    for(let i=start;i<=end;i++){
        str+=`nohup nmap -iL ${i}.txt -p 21,22,23,80,1433,3306,3389,27017  -oX xml/${i}.xml & \r\n`
    }
    console.log(str)
    return str
}
// rdp()
// init()
getShell(373,388)