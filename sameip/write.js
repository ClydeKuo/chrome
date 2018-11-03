// 将域名导出到txt

const fs=require("fs")
const DB=require("./db")
const chalk = require("chalk");
let db = new DB();

const init=async ()=>{
    try {
        await db.connect();
        let domainList=[]
        let date="2018-10-31"
        let data=await db.select({dnumber:{$gt:0},date:date})
        console.log(data.length)
        data.forEach(item=>{
            item.domains.unshift(item.addr)
            domainList=domainList.concat(item.domains)
        })
        console.log(domainList.length)
        fs.writeFileSync(`${__dirname}/data/domain-${date}.txt`,domainList.join("\r\n"))
    } catch (e) {
        console.log(chalk.red(e));
    }finally{
        db.close()
    }
}
init()