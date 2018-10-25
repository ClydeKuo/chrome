const puppeteer = require('puppeteer')
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
const randomNum=require('../lib/random')
const getIp=require("../lib/getip")
const formatDateTime =require("../lib/formatDateTime")
const scroll =require("../lib/scroll.js")

const surfing = async (ip,url) => {
  console.log(`${chalk.green(formatDateTime())}:${chalk.yellow(`start:${url}`)}`)
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // `--proxy-server=${ip}`,
      `--user-agent=${agent()}`,
      // '--no-sandbox',
      // '--disable-setuid-sandbox' 
    ],
    // headless: false,
  });
  const homePage = await browser.newPage();
  // await homePage.setViewport({ width: 1920, height: 1048 });
  try {
    await homePage.goto(url,{timeout:60000,waitUntil: "domcontentloaded"});
    await sleep("30s")
  } catch (e) {
    console.log(`${chalk.green(formatDateTime())}:${chalk.red(ip)}`)
    console.log(chalk.red(e));
  } finally {
    await browser.close();
  }
};
const init = async () => {
  try{
      for(let i=0;i>=0;i++){
        // let ip=await getIp()
        let ip=""
        await surfing(ip,"http://www.eia-china.com/")
        await sleep("5s")
      }
  }catch(e){
    console.log(chalk.red(e))
  }
};
init();
