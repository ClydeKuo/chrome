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
        let date="2018-11-02"
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
        let date="2018-10-31"
        let data=await db.select({dnumber:{$gt:10},date:date,rdp:true})
        console.log(data.length)
        let res=data.map(item=>item.addr)
        fs.writeFileSync(`${__dirname}/data/rdp-${date}.txt`,res.join(splitStr))
    } catch (e) {
        console.log(chalk.red(e));
    }finally{
        db.close()
    }
}
// rdp()
init()