const puppeteer = require("puppeteer");
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
const randomNum=require('../lib/random')
const getIp=require("../lib/getip")

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
        console.log(url)
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
const scroll=async page=>{
  try{
    //浏览网页
   let old = new Date();
   for (let j = 0; j < 100; j++) {
     await page.mouse.move(randomNum(0, 1920), randomNum(0, 600));
   }
   await sleep("1s");
   console.log((new Date() - old) / 1000 + "s");
  }catch(e){
    throw e
  }
}
const surfing = async (ip,url) => {
  let time1=new Date()
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
    await homePage.goto(url, { waitUntil: "networkidle0" });
    await scroll(homePage)
    if (!fs.existsSync(`${__dirname}/images/`)) {
      fs.mkdirSync(`${__dirname}/images/`);
    }
    await homePage.screenshot({
      path: `${__dirname}/images/homePage-${ip.split(":")[0]}.${new Date().getTime()}.png`,
      fullPage: true
    });
    console.log("drawn homePage");
    let customs=[]
    for(let i=0;i<10;i++){
      await sleep("2s");
      await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 1000));
      customs[i]=await newPagePromise(browser);
      if(!customs[i].timeout){
        console.log(i)
        await scroll(customs[i])
        await customs[i].screenshot({
          path: `${__dirname}/images/customs-${i}-${ip.split(":")[0]}.${new Date().getTime()}.png`,
          fullPage: true
        });

        //点击网页
        let sub=[]
        for(let k=0;k<5;k++){
          await customs[i].mouse.click(randomNum(500, 1500), randomNum(100, 800));
          sub[k]= await newPagePromise(browser);
          if(!sub[k].timeout){
            await scroll(sub[k])
            console.log("click custom page")
            await sub[k].close()
            break; 
          }
          await sub[k].close()
        }
        await customs[i].close()
        break; 
      }else{
        console.log(i+":"+customs[i].text)
        await customs[i].close()
      }
    }
  } catch (e) {
    console.log(chalk.red(ip));
    console.log(chalk.red(e));
  } finally {
    console.log(chalk.green((new Date() - time1) / 1000 + "s"));
    await browser.close();
  }
};
const init = async () => {
  try{
    let ip=await getIp()
    let urls=["http://hao.7654.com/?chno=7654dh_160648","http://dfttpc.7654.com/?chno=160648"]
    const promises = urls.map(function (item) {
      return surfing(ip,item)
    });
    await Promise.all(promises)
    // surfing(ip,"http://hao.7654.com/?chno=7654dh_160648")
  }catch(e){
    console.log(e)
  }finally{
    console.log("finish")
    await init()
  }
};
init();
