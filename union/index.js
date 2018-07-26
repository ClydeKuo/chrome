const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-flash')())
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
const randomNum=require('../lib/random')
const getIp=require("../lib/getip")

// https://www.flash.cn/
const formatDateTime = function () {  
  let date=new Date()
  var y = date.getFullYear();  
  var m = date.getMonth() + 1;  
  m = m < 10 ? ('0' + m) : m;  
  var d = date.getDate();  
  d = d < 10 ? ('0' + d) : d;  
  var h = date.getHours();  
  h=h < 10 ? ('0' + h) : h;  
  var minute = date.getMinutes();  
  minute = minute < 10 ? ('0' + minute) : minute;  
  var second=date.getSeconds();  
  second=second < 10 ? ('0' + second) : second;  
  return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;  
};  
const newPagePromise = (browser) => {
  return new Promise((resolve, reject) => {
    //捕获不了弹窗时报错
    let t = setTimeout(() => {
      browser.newPage();
    }, 3000);
    browser.once("targetcreated", async target => {
      try {
        clearTimeout(t);
        let url=target.url().substr(0, 200)
        console.log(`${chalk.green(formatDateTime())}:点击了${url}`)
        let newPage = await target.page()
        await newPage.setViewport({ width: 1920, height: 1048 });
        if(url==="about:blank"){
          newPage.timeout=true
          newPage.text="timeout"
        }
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
    headless: false,
  });
  const homePage = await browser.newPage();
  await homePage.setViewport({ width: 1920, height: 1048 });
  try {
    await homePage.goto(url,{timeout:60000});
    if (!fs.existsSync(`${__dirname}/images/`)) {
      fs.mkdirSync(`${__dirname}/images/`);
    }
    /* await homePage.screenshot({
      path: `${__dirname}/images/homePage-${ip.split(":")[0]}.${new Date().getTime()}.png`,
      fullPage: true
    }); */
    console.log(`${chalk.green(formatDateTime())}:drawn homePage`)
    await sleep("10s");
    await homePage.mouse.click(50, 300, { delay: 100 });
    await sleep("80s");
    /* await customs[i].screenshot({
      path: `${__dirname}/images/customs-${ip.split(":")[0]}.${new Date().getTime()}.png`,
      fullPage: true
    }); */
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

    let urls=["http://www.steel-star.com/"]
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
