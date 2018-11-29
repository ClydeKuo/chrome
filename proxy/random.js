const chalk = require("chalk");
const DB = require("./db");
let db = new DB();
var moment = require('moment');
const _ = require('lodash');
function random() {
	return Math.floor(Math.random()*10)%2
}
let list = [
    { name: "智能云输入法", value: 120 },
    { name: "小黑记事本", value: 120 },
    { name: "快压静默安装包", value: 250 },
    { name: "小鱼便签", value: 130 },
];
let cash={ name: "兑现", value: "?" }
const fake=user=>{
    let dataList=[]
    let months=["01","02","03","04","05","06","07","08","09","10","11","12"]
    for(let j=0;j<12;j++){
        let month=months[j]
        let len=moment(`2018-${month}`).endOf("month").date()
        for(let i=2;i<=len;i++){
            list.forEach(item=>{
            let num=Math.floor(Math.random()*2+5)
            let isOne=random()
            dataList.push({
                dateTime:`${moment(`2018-${month}-${i<10?"0"+i:i} ${isOne?'17:01':'17:02'}`).format("YYYY/MM/DD HH:mm")}`,
                userProperty:"技术员",
                income:item.name,
                consume:`${num}`,
                consumeIntegrate:`+${num*item.value}`,
                consumeIntegrateNum:num*item.value,
                rule:"安装",
                month:2018+month,
                ymd:`${moment(`2018-${month}-${(i-1)<10?"0"+(i-1):(i-1)}`).format("YYYY/MM/DD")}`,
                type:"in",
                user:user
            })
        })
        }
        let date=Math.floor(Math.random()*18)+10
        let tempconsumeIntegrate=Math.floor(Math.random()*100+100)*1000
        dataList.push({
            dateTime:`${moment(`2018-${month}-${date} 14:${Math.floor(Math.random()*50+10)}`).format("YYYY/MM/DD HH:mm")}`,
            userProperty:"技术员",
            income:"兑现",
            consume:`---`,
            consumeIntegrate:`-${tempconsumeIntegrate}`,
            consumeIntegrateNum:-tempconsumeIntegrate,
            rule:"安装",
            ymd:`${moment(`2018-${month}-${date}`).format("YYYY/MM/DD")}`,
            month:2018+month,
            type:"out",
            user:user
        })
    }
    // console.log(dataList.filter(item=>item.type==="out"))
    return dataList
}


const init = async () => {
    try {
      await db.connect();
      await db.remove({user:"15135459599"})
      data=fake("15135459599")
      console.log(data.length)
      /* let chunk=_.chunk(data, 10);
      for(let i=0,len=chunk.length;i<len;i++){
        await db.insert(chunk[i])
      } */
      await db.insert(data)
      db.close();
    } catch (e) {
      console.log(chalk.red(e));
      db.close();
    }
  };
  init();