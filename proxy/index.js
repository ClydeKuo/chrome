var PORT = 3000;

var http = require("http");
var url = require("url");
var fs = require("fs");
const cheerio = require('cheerio')
var path = require("path");
var httpProxy = require("http-proxy");
var moment = require('moment');
var proxy = httpProxy.createProxyServer({
  target: "http://u.7654.com/" //接口地址
});


function random() {
	return Math.floor(Math.random()*10)%2
}
proxy.on("error", function(err, req, res) {
  res.writeHead(500, {
    "content-type": "text/plain"
  });
  console.log(err);
  res.end("Something went wrong. And we are reporting a custom error message.");
});

proxy.on("proxyRes", function(proxyRes, req, res, options) {
  var pathname = url.parse(req.url).pathname;
  // console.log(req)
  if (req.headers["x-requested-with"] && pathname.includes("all")) {
    res.writeHead(200, proxyRes.headers);
    let month=pathname.split("/")[4].slice(-2)-0
    let len=0
    if((moment().month()+1)==month){  //当月
        len=moment().date()-1
    }else{
        len=moment(`2018-${month}`).endOf("month").date()
    }
    let out = {
      success: true,
      total: len*4,
      root: []
    };
    let cash={ name: "兑现", value: "?" }
    let list = [
      { name: "智能云输入法", value: 120 },
      { name: "小黑记事本", value: 120 },
      { name: "快压静默安装包", value: 250 },
      { name: "小鱼便签", value: 130 },
    ];
    for(let i=len-1;i>1;i--){
        list.forEach(item=>{
            // console.log(`${moment(`2018-${month}-${i}`).format("YYYY/MM/DD")}`)
            let num=Math.floor(Math.random()*4+1)
            let isOne=random()
            out.root.push({
                dateTime:`${moment(`2018-${month}-${i<10?"0"+i:i} ${isOne?'17:01':'17:02'}`).format("YYYY/MM/DD HH:mm")}`,
                userProperty:"技术员",
                income:item.name,
                consume:`${num}`,
                consumeIntegrate:`+${num*item.value}`,
                rule:"安装",
                ymd:`${moment(`2018-${month}-${i-1<10?'0'+(i-1):i-1}`).format("YYYY/MM/DD")}`
            })
            if(!(Math.floor(Math.random()*10+1)%6)){
                out.root.push({
                    dateTime:`${moment(`2018-${month}-${i<10?"0"+i:i} ${isOne?'14:59':'14:58'}`).format("YYYY/MM/DD HH:mm")}`,
                    userProperty:"技术员",
                    income:"兑现",
                    consume:`---`,
                    consumeIntegrate:`-${Math.floor(Math.random()*1000)*1000}`,
                    rule:"安装",
                    ymd:`${moment(`2018-${month}-${i<10?"0"+i:i}`).format("YYYY/MM/DD")}`
                })
            }
        })
        }
    res.end(JSON.stringify(out));
    // res.end()
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
    if(pathname.includes("incomeAgain.action")||pathname.includes("all")){
        proxy.web(request, response,{selfHandleResponse : true});
    }else{
        proxy.web(request, response);
    }
  
  return;
});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
