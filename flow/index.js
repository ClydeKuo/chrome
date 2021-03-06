const puppeteer = require("puppeteer");
const rp = require("request-promise-native");
const fs = require('fs')
const chalk = require("chalk");
const sleep = require("ko-sleep");
const ptimeout = require("promise.timeout");
const ipList = require("./list.json");
//生成随机数据
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
const newPagePromise = (browser) => {
  return new Promise((resolve, reject) => {
    //捕获不了弹窗时报错
    let t = setTimeout(() => {
      reject("Timeout");
    }, 20000);
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
const surfing = async ip => {
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      `--proxy-server=${ip}`,
      "--user-agent='Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3964.2 Safari/537.36'"
    ]
  });
  const baidu = await browser.newPage();
  await baidu.setViewport({ width: 1920, height: 1048 });
  try {
    await baidu.goto("https://www.baidu.com/", { waitUntil: "networkidle2" });
    await baidu.keyboard.type("site:qq-sg.com", { delay: 100 });
    await baidu.click('input[value="百度一下"][type=submit]', { delay: 100 });
    await sleep("5s");
    if (!fs.existsSync(`${__dirname}/images/`)) {
      fs.mkdirSync(`${__dirname}/images/`);
    }
    await baidu.screenshot({
      path: `${__dirname}/images/baidu-${ip.split(":")[0]}.png`,
      fullPage: true
    });
    console.log("drawn baidu");
    await baidu.mouse.click(300, 230, { delay: 100 });
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
    console.log(chalk.green(ip));
  } catch (e) {
    console.log(chalk.red(ip));
    console.log(chalk.red(e));
  } finally {
    await browser.close();
  }
};

/* const getIp=async ()=>{
  try{
    let data=await rp({
      uri: 'http://187246357627916521.s.y2000.com.cn/?num=5&areat=1&scheme=1',
    })
    let arr=data.split("\r\n")
    console.log(data.split("\r\n"))
    return arr
  }catch(e){
    throw e
  }
} */
const init = async () => {
  // let ipList=await getIp()
  ipList;
  for (let i = 0; i < ipList.length; i++) {
    await surfing(ipList[i]);
  }
};
init();
