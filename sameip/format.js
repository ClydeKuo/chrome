/* 格式xml,获取url信息，数据写在了data文件夹下面 */
const parseString = require('xml2js').parseString;
const moment=require("moment")
const chalk = require("chalk");
const sleep = require("ko-sleep");
const fs = require("fs");
const DB=require("./db")

let db=new DB()

// 获取所有源数据文件
const format=()=>{
    let fileArr=fs.readdirSync(`${__dirname}/source/`)
    let arr=['ftp','ssh','telnet',"http",'mssql','mysql','rdp','mongo']
    fileArr.forEach(file=>{
        if(file.split(".").pop()==="xml"){
            let xml = fs.readFileSync(`${__dirname}/source/${file}`).toString();
            parseString(xml, function (err, result) {
                result.nmaprun.host.forEach(async item=>{
                    try {
                        let temp={date:moment().format("YYYY-MM-DD"),addr:item.address[0].$.addr}
                        item.ports[0].port.forEach((port,index)=>{
                            let key=arr[index]
                            temp[key]=port.state[0].$.state
                        })
                        let data=await db.select({addr:temp.addr})
                        if(!data.length){
                            await db.insert([temp])
                            await sleep("1s")
                        }
                    } catch (e) {
                        console.log(chalk.red(e));
                        db.close()
                    }
                    
                })
            });
        }
    })
    db.close()
}

const init=async ()=>{
    try {
        await db.connect()
        format()
    } catch (e) {
        console.log(chalk.red(e));
        db.close()
    }
}
init()