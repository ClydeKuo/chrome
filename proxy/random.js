const chalk = require("chalk");
const DB = require("./db");
let db = new DB();
var moment = require('moment');

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
    for(let month=1;month<=12;month++){
        let len=moment(`2018-${month}`).endOf("month").date()
        for(let i=2;i<=len;i++){
            list.forEach(item=>{
            let num=Math.floor(Math.random()*4+1)
            let isOne=random()
            dataList.push({
                dateTime:`${moment(`2018-${month}-${i} ${isOne?'17:01':'17:02'}`).format("YYYY/MM/DD HH:mm")}`,
                userProperty:"技术员",
                income:item.name,
                consume:`${num}`,
                consumeIntegrate:`+${num*item.value}`,
                rule:"安装",
                month:moment(`2018-${month}`).format("YYYYMM"),
                ymd:`${moment(`2018-${month}-${i-1}`).format("YYYY/MM/DD")}`,
                type:"in",
                user:user
            })
            if(!(Math.floor(Math.random()*10+1)%6)){
                dataList.push({
                    dateTime:`${moment(`2018-${month}-${i<10?"0"+i:i} 14:${Math.floor(Math.random()*50+10)}`).format("YYYY/MM/DD HH:mm")}`,
                    userProperty:"技术员",
                    income:"兑现",
                    consume:`---`,
                    consumeIntegrate:`-${Math.floor(Math.random()*1000)*1000}`,
                    rule:"安装",
                    ymd:`${moment(`2018-${month}-${i<10?"0"+i:i}`).format("YYYY/MM/DD")}`,
                    month:moment(`2018-${month}`).format("YYYYMM"),
                    type:"out",
                    user:user
                })
            }
        })
        }
    }
    // console.log(dataList.filter(item=>item.type==="out"))
    return dataList
}


const init = async () => {
    try {
      await db.connect();
    //   await db.remove({user:"15135459599"})
      data=fake("15135459599")
    //   console.log(data)
      await db.insert(data)
    // let dd=await db.select({user:"15135459599",type:"out"})
    // console.log(dd)
      db.close();
    } catch (e) {
      console.log(chalk.red(e));
      db.close();
    }
  };
  init();