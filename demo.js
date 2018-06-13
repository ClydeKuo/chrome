const puppeteer = require("puppeteer");
const sleep = require("ko-sleep");
//生成随机数据
function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
}
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({width: 1920, height: 1048});
  await page.goto(
    "https://www.baidu.com/s?wd=%E6%80%9D%E5%87%A1&rsv_spt=1&rsv_iqid=0xafd2b358000169d6&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=2&rsv_sug1=1&rsv_sug7=001",
    { waitUntil: "networkidle0" }
  );
//   百度广告
//   $('[data-click][style="display:block !important;visibility:visible !important"]')
  // Type into search box.
//   await page.click("#kw", { delay: 100 });
  page.mouse.click(300,30, { delay: 100 })
  //全选
  await page.keyboard.down("ControlLeft");
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
  await browser.close();
})();
