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
    await homePage.goto(url);
    await scroll(homePage)
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
      await sleep("1s");
      await homePage.mouse.click(randomNum(500, 1500), randomNum(200, 1000));
      customs[i]=await newPagePromise(browser);
      if(!customs[i].timeout){
        console.log(i)
        await scroll(customs[i])
        await customs[i].screenshot({
          path: `${__dirname}/images/customs-${i}-${ip.split(":")[0]}.png`,
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
    console.log((new Date() - time1) / 1000 + "s");
    await browser.close();
    init()
  }
};
const getIp=async ()=>{
  let time=5
  try{
    let data=await rp({
      uri: 'http://api.ip.data5u.com/dynamic/get.html?order=3bc5244c8eff09599e9e1b955b4847d3&json=1&sep=5',
    })
    let ip= JSON.parse(data).data[0].ip+":"+JSON.parse(data).data[0].port
    let opt = {
      proxy: "http://"+ip,
      method: 'GET',
      url: "https://www.baidu.com",
      timeout: 5000
    }
    let check=await rp(opt)
    if(check){
      console.log(ip+":"+"is find")
      return ip
    }else{
      console.log(ip+":"+"is bad")
    }
  }catch(e){
    console.log(e)
    console.log(--time)
    if(time){
      getIp()
    }
  }
}
const init = async () => {
  let ip=await getIp()
  surfing(ip,"http://hao.7654.com/?chno=7654dh_160648");
};
init();
