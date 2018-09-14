const puppeteer = require("puppeteer");
const fs = require("fs");
const chalk = require("chalk");
const agent = require("secure-random-user-agent");
const sleep = require("ko-sleep");
const queryString = require("query-string");
const URI = require("uri-parse");
const request = require('request')
const _ = require("lodash");

let browser = "";

const getTargetUrl=url=>new Promise((resolve, reject) => {
        console.log(url)
        request.get(url,{followRedirect:false})
        .on('response', function(res) {
            if(res.statusCode===302) {
                let newUrl=res.headers.location
                resolve(newUrl);
            }else{
                resolve("https://www.baidu.com/");
            }
        })
        .on('error', function(err) {
            console.log(chalk.red(error));
            resolve("https://www.baidu.com/");
        })
    });


const surfing = async ip => {
  const baidu = (await browser.pages())[0];
  await baidu.setViewport({ width: 1920, height: 1048 });
  try {
    await baidu.goto("https://www.baidu.com/");
    await baidu.waitForSelector('input[value="百度一下"][type=submit]')
    await baidu.keyboard.type("爬虫", { delay: 1000 });
    await baidu.click('input[value="百度一下"][type=submit]');
    let url = new URI(await baidu.url());
    if(url.query["rn"]!=50){
        console.log("no 50")
        url.query["rn"] = 50;
        let newUrl = url.toURI();
        console.log(newUrl);
        await baidu.goto(newUrl);
        await baidu.waitForSelector('input[value="百度一下"][type=submit]')
    }
    //获取页面内其他连接的url
    // let list=await baidu.$$(".result.c-container .t a")
    let urls = await baidu.evaluate(() => {
      return $(".result.c-container .t a")
        .toArray()
        .map(item => item.href);
    });
    let arr = await Promise.all(urls.map(item => getTargetUrl(item))); //获取连接地址
    let arr1=_.uniqBy(arr, item=>(new URI(item)).host)  //去重
    console.log(arr1)
    console.log(arr1.length)
  } catch (e) {
    console.log(chalk.red(e));
  } finally {
    await browser.close();
  }
};
const init = async () => {
  /* for(var i=0;i<50;i++){
        await surfing();
    } */
  browser = await puppeteer.launch({
    args: [
      `--user-agent=${agent()}`,
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
    // headless: false,
  });
  await surfing();
};
init();
