/* 根据ip获取域名 */
const rp = require("request-promise-native");
const fs = require("fs");
const cheerio = require('cheerio')
const sleep = require("ko-sleep");
const chalk = require("chalk");
const URI = require("uri-parse");
const _ = require('lodash');
const ipList=require("./ip.json")
const parseString = require('xml2js').parseString;

// nmap -iL 0.txt -p 21,22,23,1433,3306,3389,27017  -oX a.xml

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
        console.log(`开始扫${domain}`)
        let num=await getUrl(domain,1,true)
        console.log(`共${num}页`)
        let list=[]
        for(let i=0;i<num;i++){
            await sleep("1s");
            let data=await getUrl(domain,i+1)
            list=list.concat(data)
        }
        console.log(`共${list.length}条数据`)
        // console.log(list.join("\r\n"))
        return list
    } catch (e) {
        console.log(chalk.red(e));
    }
}

const init=async ()=>{
    try {
        let list=[]
        let much=[] //超过40个域名的ip
        let uriList=fs.readFileSync(`${__dirname}/data/ftp.txt`,{encoding :"utf-8"}).split("\r\n");
        for(let i=0,len=uriList.length;i<len;i++){
            await sleep("5s");
            let data=await singleDomain(uriList[i])
            if(data){
                if(data.length>40) much=much.concat(data)
                list=list.concat(data)
            }
        }
        list=_.uniq(list)
        fs.writeFileSync(`${__dirname}/data/much.txt`,list.join("\r\n"))
        fs.writeFileSync(`${__dirname}/data/domain.txt`,list.join("\r\n"))
        console.log(`总共${list.length}条数据`)
    } catch (e) {
        console.log(chalk.red(e));
    }
}
// singleDomain("www.junyongshipin2012.com")
init()

// console.log(ipList)

// 分数组
/* 
let uriList=[]
for(let key in ipList){
    ipList[key].forEach(item => {
        for(let i=item.min.split(".")[0];i<=item.max.split(".")[0];i++){
            for(let j=item.min.split(".")[1];j<=item.max.split(".")[1];j++){
                for(let n=item.min.split(".")[2];n<=item.max.split(".")[2];n++){
                    uriList.push(`${i}.${j}.${n}.0/24`)
                }
            }
        }
    });
}
let arr4=_.chunk(uriList, 1000);
arr4.forEach((item,index)=>{
    fs.writeFileSync(`${__dirname}/ip/${index}.txt`,item.join("\r\n"))
}) */

