const puppeteer = require("puppeteer");
const sleep = require("ko-sleep");
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
(async () => {
  const browser = await puppeteer.launch({
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://peter.sh/experiments/chromium-command-line-switches/
    args: ["--proxy-server=127.0.0.1:10005",
  "--user-agent='Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3964.2 Safari/537.36'"]
  });
  const newPagePromise = () => {
    return new Promise(resolve => {
      browser.once("targetcreated", async target => {
        try {
          console.log(target.url());
          let newPage = await browser.newPage();
          await newPage.setViewport({ width: 1920, height: 1048 });
          await newPage.goto(target.url(), { waitUntil: "networkidle0" });
          resolve(newPage);
        } catch (e) {
          console.log(e);
        }
      });
    });
  };
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1048 });
  try {
    await page.goto("http://sh-fuyang.com/", { waitUntil: "networkidle2" });
    await page.screenshot({ path: "home.png", fullPage: true });
    console.log("点击页面广告");
    await page.click("#_3di13bpetea", { delay: 100 });
    console.log("跳转到百度");
    const baidu = await newPagePromise();
    await baidu.screenshot({ path: "baidu1.png", fullPage: true });
    console.log("点击input框");
    await baidu.mouse.click(300, 30, { delay: 100 });

    console.log("全选");
    await baidu.keyboard.down("ControlLeft");
    await baidu.keyboard.press("KeyA");
    await baidu.keyboard.up("ControlLeft");

    console.log("删除现有的文字");
    await baidu.keyboard.press("Backspace");
    console.log("输入热词");
    await baidu.keyboard.type("收益", { delay: 100 });
    await baidu.click('input[value="百度一下"][type=submit]', { delay: 100 });
    await sleep("3s");
    await baidu.screenshot({ path: "baidu2.png", fullPage: true });
    console.log("点击百度广告");
    let adList = await baidu.$$(
      '[data-click][style="display:block !important;visibility:visible !important"]'
    );
    let adIdList = adList.map(item => {
      return item._remoteObject.description.match(/#(\w*?)\./)[1];
    });
    console.log(adIdList);
    for (let i = 0; i < adIdList.length; i++) {
      await baidu.click('[id="' + adIdList[i] + '"] a', { delay: 100 });
      console.log("进入广告页面");
      let custom = await newPagePromise();
      let old = new Date();
      for (let i = 0; i < 200; i++) {
        await custom.mouse.move(randomNum(0, 1920), randomNum(0, 1000));
      }
      console.log(new Date() - old);
      await custom.screenshot({ path: `custom${i}.png`, fullPage: true });
    }
  } catch (e) {
    console.log(e);
  }
  await browser.close();
})();
