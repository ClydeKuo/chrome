const puppeteer = require("puppeteer");
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
  console.time("surfing") 
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      `--proxy-server=${ip}`,
      `--user-agent=${agent()}`,
      '--no-sandbox',
      '--disable-setuid-sandbox' 
    ],
    // headless: false,
  });
  const homePage = await browser.newPage();
  await homePage.setViewport({ width: 1920, height: 1048 });
  try {
    await homePage.goto(url, { waitUntil: "domcontentloaded" });
    await (await browser.pages())[0].close()  //关闭第一个空页面
    await scroll(homePage)
    await sleep("3s");
    /* await homePage.screenshot({
      path: `${__dirname}/images/homePage-${ip.split(":")[0]}.${new Date().getTime()}.png`,
      fullPage: true
    }); */
    console.log(`${chalk.green(formatDateTime())}:drawn homePage`)
    for(let i=0;i<10;i++){
      await sleep("1s");
      await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 1000), { delay: 100 });
      if((await browser.pages()).length>3){
        break;
      }
    }
    let pages=await browser.pages()
    if(pages.length<2){
      throw "没有点击事件"
    }else{
      await sleep("20s");
      /* if (!fs.existsSync(`${__dirname}/images/`)) {
        fs.mkdirSync(`${__dirname}/images/`);
      } */
      for(let i=0;i<pages.length;i++){
        await scroll(pages[i])
        if([1,3].includes(i)){
          for(let j=0;j<5;j++){
            await pages[i].mouse.click(randomNum(500, 1500), randomNum(200, 1000), { delay: 100 });
          }
        }
        console.log(`${chalk.green(formatDateTime())}:png:${i}`)
        /* await pages[i].screenshot({
          path: `${__dirname}/images/page-${ip.split(":")[0]}.${new Date().getTime()}.png`,
          fullPage: true
        }); */
        console.log(`${chalk.green(formatDateTime())}:after png:${i}`)
        await pages[i].close()
        console.log(`${chalk.green(formatDateTime())}:close png:${i}`)
      }
      await sleep("20s");
    }
  } catch (e) {
    console.log(`${chalk.green(formatDateTime())}:${chalk.red(ip)}`)
    console.log(chalk.red(e));
  } finally {
    console.timeEnd('surfing') ;
    await browser.close();
  }
};
const init = async () => {
  try{

    let urls=["http://hao.7654.com/?chno=7654dh_160648"]
    for(let i=0,len=urls.length;i<len;i++){
      let ip=await getIp()
      await surfing(ip,urls[i])
    }
    
  }catch(e){
    console.log(chalk.green(formatDateTime()))
    console.log(chalk.red(e))
  }finally{
    console.log(chalk.green(`${formatDateTime()}:finish`))
    await init()
  }
};
init();
