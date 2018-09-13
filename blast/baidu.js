const puppeteer = require("puppeteer");
const fs = require("fs");
const chalk = require("chalk");
const agent = require("secure-random-user-agent");
const sleep = require("ko-sleep");
const queryString = require('query-string');


const surfing = async ip => {
  const browser = await puppeteer.launch({
    args: [
      `--user-agent=${agent()}`,
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
    // headless: false,
  });
  const baidu = (await browser.pages())[0]
  await baidu.setViewport({ width: 1920, height: 1048 });
  try {
    await baidu.goto("https://www.baidu.com/", { waitUntil: ["networkidle0",'domcontentloaded','load'] });
    await baidu.keyboard.type("爬虫", { delay: 1000 });
    await baidu.click('input[value="百度一下"][type=submit]');
    let url=await baidu.url()
    let newQuery=queryString.stringify({
        ...queryString.parse(query=url.split('?')[1]),
        rn:50
    })
    let newUrl=`${url.split('?')[0]}?${newQuery}`
    console.log(newUrl)
    await baidu.goto(newUrl, { waitUntil: ["networkidle0",'domcontentloaded','load'] });
    // let list=await baidu.$$(".result.c-container .t a")
    let urls=await baidu.evaluate(() => {
        return $('.result.c-container .t a').toArray().map(item=>item.href)
    });
     console.log(urls.length)
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
    await surfing();
};
init();
