/* 根据ip获取域名 */
const rp = require("request-promise-native");
const fs = require("fs");
const cheerio = require('cheerio')
const sleep = require("ko-sleep");
const chalk = require("chalk");
const _ = require('lodash');
const DB=require("./db")

let db = new DB();
const os=require('os')

const getUrl=async (domain,page=1,getNum=false)=>{
    try{
        let basicsUrl="https://dns.aizhan.com/"
        let opt = {
            // proxy: "https://127.0.0.1:10005",
            method: "GET",
            url: `https://dns.aizhan.com/${domain}/${page}/`,
          };
        let html=await rp(opt)
        const $ = cheerio.load(html)
        if(getNum){
            return Math.ceil($(".last .red").text()/20) 
        }
        let list=[];
        for(let i =0,len= $(".domain").length;i<len;i++){
            let temp=$($(".domain")[i]).children().text();
            list.push(temp)
        };
        list.shift()
        return list
    }catch(e){
        throw e
    }
}

const singleDomain=async (domain)=>{
    try {
        let list=[]
        console.log(`开始扫${domain}`)
        let num=await getUrl(domain,1,true)
        console.log(`共${num}页`)
        if(!num) return list
        for(let i=0;i<num;i++){
            await sleep("1s");
            let data=await getUrl(domain,i+1)
            list=list.concat(data)
        }
        console.log(`共${list.length}条数据`)
        return list
    } catch (e) {
        console.log(chalk.red(e));
    }
}
const init=async ()=>{
    try {
        let date="2018-11-06"
        let hostname=os.hostname();
        const hostList=["ftp","DESKTOP-19SQRJQ","chrome","rdp"]
        let index=hostList.indexOf(hostname)
        await db.connect();
        let len=10
        do{
            let uriList=(await db.selectPaging({ftp:true,dnumber:{$exists:false},date:date},index)).map(item=>item.addr)
            len=uriList.length
            console.log(len)
            for(let i=0;i<len;i++){
                let data=await singleDomain(uriList[i])
                if(data){
                    if(data.length){
                        await db.update({addr:uriList[i]},{$set: { domains: data,dnumber:data.length }})
                    }else{
                        await db.update({addr:uriList[i]},{$set: {dnumber:data.length }})
                    }
                }
                await sleep("1s");
            }
        }while(len>=10){
            console.log("完成")
            db.close()
        }
    } catch (e) {
        console.log(chalk.red(e));
        db.close()
    }
}
// singleDomain("www.junyongshipin2012.com")
init()