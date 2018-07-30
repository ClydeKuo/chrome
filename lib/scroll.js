const randomNum=require('./random')
const sleep = require("ko-sleep");
  module.exports=async page=>{
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