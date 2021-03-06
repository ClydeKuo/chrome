const puppeteer = require("puppeteer");
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
const randomNum=require('../lib/random')
const getIp=require("../lib/getip")


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
const scroll=async page=>{
  try{
    //浏览网页
  console.time("scroll") 
   for (let j = 0; j < 200; j++) {
     await page.mouse.move(randomNum(0, 1920), randomNum(0, 600));
   }
   await sleep("1s");
   console.timeEnd('scroll') ;
  }catch(e){
    throw e
  }
}
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
    await homePage.goto(url, { waitUntil: "networkidle0" });
    await scroll(homePage)
    if (!fs.existsSync(`${__dirname}/images/`)) {
      fs.mkdirSync(`${__dirname}/images/`);
    }
    await homePage.screenshot({
      path: `${__dirname}/images/homePage-${ip.split(":")[0]}.${new Date().getTime()}.png`,
      fullPage: true
    });
    console.log(`${chalk.green(formatDateTime())}:drawn homePage`)
    let customs=[]
    for(let i=0;i<10;i++){
      await sleep("1s");
      await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 1000), { delay: 100 });
      customs[i]=await newPagePromise(browser);
      if(!customs[i].timeout){
        await sleep("2s");
        console.log(`${chalk.green(formatDateTime())}:下一个循环${i}`)
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
            console.log(`${chalk.green(formatDateTime())}:click custom page`)
            await sub[k].close()
            break; 
          }
          await sub[k].close()
        }
        let pageNum=[]  //已经打开的网页
        customs.forEach(function(item){
          if(!item.timeout){
            pageNum.push(item)
          }
        })
        await customs[i].close()
        if(pageNum.length>2||i===9){
          break; 
        }
      }else{
        console.log(i+":"+customs[i].text)
        await customs[i].close()
      }
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
    //删了两个地址
    let urls=["http://hao.7654.com/?chno=7654dh_161535","http://hao.7654.com/?chno=7654dh_161812","http://hao.7654.com/?chno=7654dh_161813",]
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
