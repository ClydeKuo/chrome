var PORT = 3000;

var http = require("http");
var url = require("url");
var fs = require("fs");
const cheerio = require('cheerio')
var path = require("path");
var httpProxy = require("http-proxy");
var moment = require('moment');
const DB = require("./db");
let db = new DB();
db.connect();
var proxy = httpProxy.createProxyServer({
  target: "http://u.7654.com/" //接口地址
});


proxy.on("error", function(err, req, res) {
  res.writeHead(500, {
    "content-type": "text/plain"
  });
  console.log(err);
  res.end("Something went wrong. And we are reporting a custom error message.");
});

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
        let dataList=await db.selectList({user:"15135459599",month:month,ymd:{$lt:moment().subtract(1, "days").format("YYYY/MM/DD")}})
        out.root=dataList
        res.end(JSON.stringify(out));
      }else if(pathname.includes("incomeCtg/in")){
          let filter={user:"15135459599",type:"in",month:month,ymd:{$lt:moment().subtract(1, "days").format("YYYY/MM/DD")}}
        let dataList=await db.selectList(filter)
        out.root=dataList
        res.end(JSON.stringify(out));
      }else if(pathname.includes("incomeCtg/out")){
        let filter={user:"15135459599",type:"out",month:month,ymd:{$lt:moment().subtract(1, "days").format("YYYY/MM/DD")}}
        let dataList=await db.selectList(filter)
        out.root=dataList
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
        // console.log($.html())
        res.write($.html())
        res.end();
    });
  }
  
});
var server = http.createServer(function(request, response) {
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
