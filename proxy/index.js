var PORT = 3000;

var http = require("http");
var url = require("url");
var fs = require("fs");
const cheerio = require('cheerio')
var path = require("path");
const _ = require('lodash');
var httpProxy = require("http-proxy");
var moment = require('moment');
const DB = require("./db");
let db = new DB();
var proxy = httpProxy.createProxyServer({
  target: "http://u.7654.com/" //接口地址
});
let infoList=[]
let currentUser=""
proxy.on("error", function(err, req, res) {
  res.writeHead(500, {
    "content-type": "text/plain"
  });
  console.log(err);
  res.end("Something went wrong. And we are reporting a custom error message.");
});
//返回必要的字段
const filterWord=data=>{
  const template=["dateTime","userProperty","income","consume","consumeIntegrate","rule","ymd"]
  let res=data.map(item=>{
    let temp={}
    template.forEach(key=>{
      temp[key]=item[key]
    })
    return temp
  })
  return res
}
proxy.on("proxyRes", async function(proxyRes, req, res, options) {
  var pathname = url.parse(req.url).pathname;
  // console.log(req)
  if (req.headers["x-requested-with"] ) {
        res.writeHead(200, proxyRes.headers);
        let month=pathname.split("/")[4]
        let out = {
          success: true,
          total: 100,
          root: []
        };
      if(pathname.includes("all")){
        out.root=infoList[currentUser].all[month]
        res.end(JSON.stringify(out));
      }else if(pathname.includes("incomeCtg/in")){
        out.root=infoList[currentUser].in[month]
        res.end(JSON.stringify(out));
      }else if(pathname.includes("incomeCtg/out")){
        out.root=infoList[currentUser].out[month]
        res.end(JSON.stringify(out));
      }
  }else if(pathname.includes("incomeAgain.action")){
    var body = new Buffer('');
    proxyRes.on('data', function (data) {
        body = Buffer.concat([body, data]);
    });
    proxyRes.on('end', function () {
        body = body.toString();
        const $ = cheerio.load(body)
        // console.log($('a[href|="/income/expense.action"]').text())
        $('a[href|="/income/expense.action"]').text(Math.floor(Math.random()*10000)*1000)
        $('a[href|="/shop/index.action"]').eq(1).text(Math.floor(Math.random()*100)*1000)
        res.write($.html())
        res.end("123");
    });
  }
  
});
// 将数据格式化
const getFulldata=async ()=>{
  let users=['15135459599']
  let tempInfo={}
  let filter={ymd:{$lt:moment().subtract(1, "days").format("YYYY/MM/DD")}}
  let data=await db.selectList(filter)
  for(let i =0,len=users.length;i<len;i++){
    tempInfo[users[i]]={}
    tempInfo[users[i]].all={}
    tempInfo[users[i]].in={}
    tempInfo[users[i]].out={}
    let months=["201801","201802","201803","201804","201805","201806","201807","201808","201809","201810","201811","201812"]
    for(let j=0;j<12;j++){
      let fmonth=months[j]
      tempInfo[users[i]].all[fmonth]=[]
      tempInfo[users[i]].in[fmonth]=[]
      tempInfo[users[i]].out[fmonth]=[]
      data.forEach(item=>{
        if(item.month===fmonth){
          tempInfo[users[i]].all[fmonth].push(item)
          if(item.type==="in"){
            tempInfo[users[i]].in[fmonth].push(item)
          }else if(item.type==="out"){
            tempInfo[users[i]].out[fmonth].push(item)
          }
        }
      })
    }
    //总数目
    tempInfo[users[i]].total=_.sumBy(data.filter(item=>(item.type==="in"&&item.user===users[i])),o=>o.consumeIntegrateNum) 
    let oo=_.sumBy(tempInfo[users[i]].in["201807"],o=>o.consumeIntegrateNum) 
    //剩余
    tempInfo[users[i]].residue=_.sumBy(data.filter(item=>(item.user===users[i])),o=>o.consumeIntegrateNum)
    console.log(tempInfo[users[i]].total)
    console.log(tempInfo[users[i]].residue)
    console.log(oo)
  }
  infoList=tempInfo
}
const init=async ()=>{
  await db.connect();
  await getFulldata()
  var server = http.createServer(async (request, response)=>{
    if(request.headers&&request.headers.cookie){
      let cookieList=request.headers.cookie.split(";")
      let name=cookieList.filter(item=>item.includes("_name"))[0]
      if(name){
        let user=name.split("=")[1]
        currentUser=user
      }
    }
    var pathname = url.parse(request.url).pathname;
    if(pathname.includes("incomeAgain.action")||pathname.includes("all")||pathname.includes("incomeCtg/out")||pathname.includes("incomeCtg/in")){
        proxy.web(request, response,{selfHandleResponse : true});
    }else{
        proxy.web(request, response);
    }
    return;
  });
  server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
}
init()
