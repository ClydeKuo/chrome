const _ = require("lodash");
const chalk = require("chalk");
const moment=require("moment")
const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = "mongodb://clyde:asdqwe123@list-shard-00-00-si9p2.mongodb.net:27017,list-shard-00-01-si9p2.mongodb.net:27017,list-shard-00-02-si9p2.mongodb.net:27017/sameip?ssl=true&replicaSet=list-shard-0&authSource=admin"

class DB{
  constructor(){
    this.db=""
    this.collection=""
  }
  connect(type){
    return new Promise((resolve,reject)=>{
      MongoClient.connect(DB_CONN_STR, { useNewUrlParser: true } ,(err, db)=> {
          if(err){
            console.log(chalk.red(err));
            reject(err)
          }else{
            console.log(chalk.green("连接成功！"));
            this.db=db
            this.collection=db.db('sameip').collection('list')
            resolve(db)
          }
      })
    })
  }
  select(params={}){
    return new Promise((resolve,reject)=>{
      this.collection.find(params).toArray((err, list)=>{
        err?reject(err):resolve(list)
      });
    }) 
  }
  insert(data){
    return new Promise((resolve,reject)=>{
      this.collection.insertMany(data, function(err, res) { 
        err?reject(err):resolve(res)     
      });
    })
  }
  close(){
    try {
      this.db.close()
      this.db=null
      console.log("断开数据库连接")
    } catch (e) {
      console.log(chalk.red(e));
    }
    
  }
}

module.exports = DB;