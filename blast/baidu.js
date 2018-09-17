const puppeteer = require("puppeteer");
const fs = require("fs");
const chalk = require("chalk");
const agent = require("secure-random-user-agent");
const sleep = require("ko-sleep");
const queryString = require("query-string");
const URI = require("uri-parse");
const request = require("request");
const _ = require("lodash");

const waitUntil = { aitUntil: ["networkidle0", "domcontentloaded", "load"] };
let browser = "";
let hostList=[]
//获取连接地址
const getTargetUrl = url =>new Promise((resolve, reject) => {
    request
      .get(url, { followRedirect: false })
      .on("response", function(res) {
        if (res.statusCode === 302) {
          let newUrl = res.headers.location;
          resolve(new URI(newUrl).host);
        } else {
          resolve("www.baidu.com");
        }
      })
      .on("error", function(err) {
        console.log(chalk.red(error));
        resolve("www.baidu.com");
      });
  });
//获取页面内链接的url
const getUrlList = async (page)=> {
  try {
    let urls = await page.evaluate(() => {
      return $(".result.c-container .t a").toArray().map(item => item.href);
    });
    let arr = await Promise.all(urls.map(item => getTargetUrl(item)));
    hostList=hostList.concat(arr)
     // 判断是否有下一页
    let buttonText = await page.evaluate(() => {
        return $($("#page a").toArray().pop()).text();
    });
    if (buttonText === "下一页>") {
        await page.evaluate(() => {
            $($("#page a").toArray().pop()).click();
        });
        await getUrlList(page)
    }
  } catch (e) {
    console.log(chalk.red(e));
  }
};


const surfing = async word => {
  try {
    browser = await puppeteer.launch({
        args: [
            `--user-agent=${agent()}`,
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ],
        // headless: false,
    });
    const baidu = (await browser.pages())[0];
    // await baidu.setViewport({ width: 1920, height: 1048 });
    await baidu.goto("https://www.baidu.com/", waitUntil);
    await baidu.waitForSelector('input[value="百度一下"][type=submit]');
    await baidu.keyboard.type(word, { delay: 1000 });
    await baidu.click('input[value="百度一下"][type=submit]');
    let url = new URI(await baidu.url());
    if (url.query["rn"] != 50) {
      console.log("no 50");
      url.query["rn"] = 50;
      let newUrl = url.toURI();
      console.log(newUrl);
      await baidu.goto(newUrl, waitUntil);
      await baidu.waitForSelector('input[value="百度一下"][type=submit]');
    }
    await getUrlList(baidu)
    hostList=_.uniq(hostList);
  } catch (e) {
    console.log(chalk.red(e));
  } finally {
    await browser.close();
    return hostList
  }
};
module.exports=surfing