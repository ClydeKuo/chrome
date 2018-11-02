/* 格式xml,获取url信息，数据写在了data文件夹下面 */
const xml2js = require("xml2js");
const moment = require("moment");
const chalk = require("chalk");
const sleep = require("ko-sleep");
const fs = require("fs");
const DB = require("./db");

let db = new DB();

const parseString = file => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(file, function(err, res) {
      err ? reject(err) : resolve(res);
    });
  });
};

// 获取所有源数据文件
const format = async () => {
  try {
    let fileArr = fs.readdirSync(`${__dirname}/source/`);
    let arr = ["ftp", "ssh", "telnet", "http", "mssql", "mysql", "rdp", "mongo"];
    let arr3 = [];
    for (let i = 0, len = fileArr.length; i < len; i++) {
      let file = fileArr[i];
      console.log(file);
      if (file.split(".").pop() === "xml") {
        let xml = fs.readFileSync(`${__dirname}/source/${file}`).toString();
        let res = await parseString(xml);
        console.log("解析完成");
        let arr2 = [];
        for (let j = 0, len2 = res.nmaprun.host.length; j < len2; j++) {
          let item = res.nmaprun.host[j];
          let temp = {
            date: moment().format("YYYY-MM-DD"),
            addr: item.address[0].$.addr
          };
          item.ports[0].port.forEach((port, index) => {
            let key = arr[index];
            if (port.state[0].$.state === "open") {
              temp[key] = true;
            }
          });
          let tempkeys = Object.keys(temp);
          if (tempkeys.length > 3 && tempkeys.includes("http")) {
            delete temp.http;
            arr2.push(temp);
          }
        }
        //过滤重复的ip
        let ipList=arr2.map(item=>{
          let res={ addr: item.addr }
          return res
        })
        let repeatArr = (await db.select({$or: ipList})).map(item=>item.addr);
        let insertArr=arr2.filter(item=>{
          if(!repeatArr.includes(item.addr)){
            return item
          }
        })
        console.log(chalk.green(`总共有${arr2.length}条数据,${repeatArr.length}重复,插入${insertArr.length}条数据`));
        if (insertArr.length) await db.insert(insertArr);
      }
    }
  } catch (e) {
    throw e;
  }
};

const init = async () => {
  try {
    await db.connect();
    await format();
    db.close();
  } catch (e) {
    console.log(chalk.red(e));
    db.close();
  }
};
init();
