const puppeteer = require("puppeteer");
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const randomNum=require('../random')
const agent = require('secure-random-user-agent')
const newPagePromise = (browser) => {
  return new Promise((resolve, reject) => {
    //捕获不了弹窗时报错
    let t = setTimeout(() => {
      reject({Timeout:true});
    }, 1000);
    browser.once("targetcreated", async target => {
      try {
        console.log(target.url().substr(0, 100));
        let newPage = await browser.newPage();
        await newPage.setViewport({ width: 1920, height: 1048 });
        await newPage.goto(target.url(), { waitUntil: "networkidle0" });
        resolve(newPage);
      } catch (e) {
        reject(e);
      } finally {
        clearTimeout(t);
      }
    });
  });
};
const surfing = async (ip,url) => {
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // `--proxy-server=${ip}`,
      `--user-agent=${agent()}`
    ]
  });
  const homePage = await browser.newPage();
  await homePage.setViewport({ width: 1920, height: 1048 });
  try {
    await homePage.goto(url, { waitUntil: "networkidle0" });
    if (!fs.existsSync(`${__dirname}/images/`)) {
      fs.mkdirSync(`${__dirname}/images/`);
    }
    await homePage.screenshot({
      path: `${__dirname}/images/homePage-${ip.split(":")[0]}.png`,
      fullPage: true
    });
    console.log("drawn homePage");
    let customs=[]
    for(let i=0;i<10;i++){
      customs[i]=await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 600), { delay: 100 });
      console.log(customs[i])
    }
   /*  await homePage.mouse.click(300, 230, { delay: 100 });
    let custom = await newPagePromise(browser);
    let old = new Date();
    for (let i = 0; i < 200; i++) {
      await custom.mouse.move(randomNum(0, 1920), randomNum(0, 1000));
    }
    console.log((new Date() - old) / 1000 + "s");
    await custom.screenshot({
      path: `${__dirname}/images/sg-qq-${ip.split(":")[0]}.png`,
    });
    console.log("drawn qq-sg");
    console.log(chalk.green(ip)); */
  } catch (e) {
    console.log(chalk.red(ip));
    console.log(chalk.red(e));
  } finally {
    await browser.close();
  }
};
const init = async () => {
  surfing("127.0.0.1:1080","http://hao.7654.com/?chno=7654dh_160648");
};
init();
