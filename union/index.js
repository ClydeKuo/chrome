const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-flash')())
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
const randomNum=require('../lib/random')
const getIp=require("../lib/getip")
const scroll =require("../lib/scroll.js")
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
const surfing = async (ip,url) => {
  console.log(`${chalk.green(formatDateTime())}:${chalk.yellow(`start:${url}`)}`)
  console.time("surfing") 
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // `--proxy-server=${ip}`,
      `--user-agent=${agent()}`,
      '--no-sandbox',
      '--disable-setuid-sandbox' 
    ],
    headless: false,
  });
  const homePage = await browser.newPage();
  await homePage.setViewport({ width: 1920, height: 1048 });
  try {
    await homePage.goto(url,{timeout:60000,waitUntil: "domcontentloaded"});
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
    await sleep("10s");
    let pages=await browser.pages()
    if(pages.length<3){
      await pages[0].close()
      throw "没有点击"
    }else{
      await scroll(pages[2])
      let numPage=1
      for(let i=0;i<20;i++){
        await pages[2].mouse.click(randomNum(0, 500), randomNum(0, 500), { delay: randomNum(0, 100) });
        await sleep("1s");
      let tempLen=(await browser.pages()).length
      if(tempLen>numPage){
        console.log(`${chalk.green(formatDateTime())}:产生了新页面`)
        await sleep("10s");
      }
      numPage=tempLen
      /* if(tempLen>3){
        break;
      } */
      }
      await sleep("80s");
    }
    
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

    let urls=["http://www.steel-star.com/","http://www.fkyz114.com/","http://www.591xiaoshuo.com/","http://www.gdchan.com/",""]
    for(let i=0,len=urls.length;i<len;i++){
      // let ip=await getIp()
      let ip=""
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
