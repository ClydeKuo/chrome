const puppeteer = require('puppeteer');
const sleep = require("ko-sleep");
const agent = require('secure-random-user-agent')
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
let urls=[
    "http://www.dbug.ga/the-costs-of-programming-language-fragmentation/118.html",
    "http://www.dbug.ga/what-makes-webassembly-fast/97.html","http://www.dbug.ga/webassembly-cut-figmas-heap-time-by-3x/95.html","http://www.dbug.ga/make-an-old-undertaking-to-utilize-nuget-bundle-chief-and-make-package-config-document/84.html","http://www.dbug.ga/begin-your-machine-learning-motors-amazons-deepracer-is-relatively-here/76.html","http://www.dbug.ga/what-git-is-and-what-it-isnt-variant-control/82.html","http://www.dbug.ga/webassembly-smart-contracts/74.html","http://www.dbug.ga/course-document-not-being-stacked-on-one-pc-but-rather-works-fine-on-another/79.html","http://www.dbug.ga/what-machine-learning-can-learn-from-devops/69.html","http://www.dbug.ga/our-point-of-view-on-the-node-js-and-javascript-foundations-combine-dialogs/66.html","http://www.dbug.ga/make-a-cloud-local-mean-or-mern-application-from-a-starter-unit/49.html","http://www.dbug.ga/addressing-the-package-management-problem-in-node-js/35.html","http://www.dbug.ga/ibm-and-node-js-a-look-at-the-past-present-and-future/33.html","http://www.dbug.ga/fighting-foit-and-fout-together/15.html"];


const init=async ()=>{
    const browser = await puppeteer.launch(
        {args: [
            `--proxy-server=SOCKS5://127.0.0.1:9050`,
            `--user-agent=${agent()}`,
            '--no-sandbox',
            '--disable-setuid-sandbox' 
          ],
          timeout:60000,
        //   headless: false,
        }
      );
    try {
          const page = await browser.newPage();
          for(let i=0,len=urls.length;i<len;i++){
            await page.goto(urls[i],{
                timeout:600000
            });
            console.log(page.url()); 
            await sleep(`${randomNum(5,60)}s`);
          }
    } catch (e) {
        console.log(e)
    }finally{
        browser.close();
    }
}
(async() => {
  do {
      await init()
  } while (true);
})();