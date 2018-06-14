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
    // Launch chromium using a proxy server on port 9876.
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    args: ["--proxy-server=127.0.0.1:10005"]
  });
  const newPagePromise = () => {
    return new Promise(resolve => {
      browser.once("targetcreated", target => {
        resolve(target.page());
      });
    });
  };
  const  screenshot= (page) => {
    return new Promise(resolve => {
      page.once("load", () => {
        resolve(page.screenshot({ path: "example.png", fullPage: true }))
      });
    });
  };
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36"
  );
  await page.setViewport({ width: 1920, height: 1048 });
  try {
    await page.goto(
      "http://sh-fuyang.com/",
      // "https://www.baidu.com/s?ie=utf-8&f=3&rsv_bp=1&rsv_idx=2&tn=baiduhome_pg&wd=dd电机&rsv_spt=1&oq=win10%2520host&rsv_pq=de14753500005011&rsv_t=d99cUKzMeh3HklMUGj1i%2B5YBUs3o4LqMNlYy3iBZLxgcMGDqnRQc4Yxb0SExwjM5mn2%2F&rqlang=cn&rsv_enter=1&inputT=1791&rsv_sug3=17&rsv_sug1=17&rsv_sug7=100&rsv_sug2=1&prefixsug=ddd&rsp=1&rsv_sug4=3009",
      { waitUntil: "networkidle2" }
    );
    // console.log(pages)
    /* browser.once("targetcreated", target => {
      console.log(1)
    }) */
    // await page.mouse.click(100, 1950, { delay: 0 });
    // await sleep("10s");
    await page.click("#iframe4341660_0", { delay: 100 });
    console.log("click");
    const newPage = await newPagePromise();
    // console.log("targetcreated")
    // await newPage.setViewport({ width: 1920, height: 1048 });
    await screenshot(newPage)
    // await sleep("3s");
  } catch (e) {
    console.log(e);
  }
  await browser.close();

  //   百度广告
  //   $('[data-click][style="display:block !important;visibility:visible !important"]')
  // Type into search box.
  //   await page.click("#kw", { delay: 100 });
  // page.mouse.click(300,30, { delay: 100 })
  //全选
  /* await page.keyboard.down("ControlLeft");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("ControlLeft");
  //删除现有的文字
  await page.keyboard.press("Backspace");
  //输入
  await page.keyboard.type("医院", { delay: 100 });
  await page.click('input[value="百度一下"][type=submit]', { delay: 100 });
  let old=new Date()
  for(let i=0;i<1;i++){
    await page.mouse.move(randomNum(0,1920),randomNum(0,2500))
  }
  console.log(new Date()-old)
  await sleep("3s");
  
  await page.screenshot({ path: "example.png" ,fullPage:true});
  await browser.close(); */
})();
