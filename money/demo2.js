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
  // console.time("surfing") 
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
    let numPage=1
    for(let i=0;i<10;i++){
      await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 1000), { delay: randomNum(0, 100) });
      await sleep("1s");
      let tempLen=(await browser.pages()).length
      if(tempLen>numPage){
        console.log(`${chalk.green(formatDateTime())}:产生了新页面`)
        await sleep("10s");
      }
      numPage=tempLen
      if(tempLen>3){
        break;
      }
    }
    let pages=await browser.pages()
    if(pages.length<2){
      throw "没有点击事件"
    }else{
      let status=""
      let simulate = new Promise (async (resolve, reject) => {
        try {
          console.log(`${chalk.green(formatDateTime())}:开始模拟浏览`)
        await sleep("10s");
        console.log(`${chalk.green(formatDateTime())}:共${pages.length}页面`)
        for(let i=0;i<pages.length;i++){
          await scroll(pages[i])
          if([1,3].includes(i)){
            for(let j=0;j<5;j++){
              await pages[i].mouse.click(randomNum(500, 1500), randomNum(200, 1000), { delay: 100 });
            }
          }
          await pages[i].close()
          console.log(`${chalk.green(formatDateTime())}:第${i+1}页面浏览完毕，已关闭`)
        }
        await sleep("20s");
        console.log(`${chalk.green(formatDateTime())}:正常模拟了一次导航浏览`)
        status=1
        resolve()
        } catch (e) {
          console.log(`${chalk.red("应该是超时了")}:${e}`)
        }
    } )
    let timeout=new Promise (async (resolve, reject) => {
      console.log(`${chalk.green(formatDateTime())}:开始5分钟计时`)
      await sleep("400s");
      if(!status){
        console.log(chalk.red(`${chalk.green(formatDateTime())}:5分钟超时,母鸡什么原因停下来的`))
      }
      resolve()
    })
      await Promise.race([simulate,timeout])
    }
  } catch (e) {
    console.log(`${chalk.green(formatDateTime())}:${chalk.red(ip)}`)
    console.log(chalk.red(e));
  } finally {
    // console.timeEnd('surfing');
    await browser.close();
  }
};

const surf=(ip,url)=>{
  return new Promise (async (resolve, reject) => {
    try {
      await surfing(ip,url)
      resolve()
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

const init = async () => {
  try{
    let num=11
    let urls=["http://hao.7654.com/?chno=7654dh_160648","http://hao.7654.com/?chno=7654dh_161821","http://hao.7654.com/?chno=7654dh_161822","http://hao.7654.com/?chno=7654dh_161820","http://hao.7654.com/?chno=7654dh_161815","http://hao.7654.com/?chno=7654dh_161817","http://hao.7654.com/?chno=7654dh_161818","http://hao.7654.com/?chno=7654dh_161819","http://hao.7654.com/?chno=7654dh_161535","http://hao.7654.com/?chno=7654dh_161812","http://hao.7654.com/?chno=7654dh_161813"]
    for(let i=0,len=urls.length;i<len;i=i+num){
      let surfs=[]
      for(let j=0;j<num;j++){
        await sleep("5s"); 
        let ip=await getIp()
        surfs.push(surf(ip,urls[i+j]))
      }
      await Promise.all(surfs)
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


