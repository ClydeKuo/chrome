/**
 * @author ck
 * @email clyde_guo@cloud-hr.com.cn
 * @create date 2018-08-24 10:07:34
 * @modify date 2018-08-24 10:07:34
 * @desc xp3系统，账号：Administrator 密码：1
 * 需要虚拟机自动登录
 * 牛B大师改名niub
 * 脚步做好编译放在桌面
*/
const exec = require("child_process").exec;
const moment=require("moment")
const fs = require('fs')
const sleep = require("ko-sleep");
const formatDateTime =require("../lib/formatDateTime")
const deleteall =require("../lib/delete")
const execsync =require("../lib/execsync")
const chalk = require("chalk");


//  检查已有的虚拟机，并且挑出最大的值
const getMax=dir=>{
  let arr=[]
  let files = fs.readdirSync(dir)
  if(files.length){
    files.forEach(function (item, index) {
      let stat = fs.lstatSync(`${dir}${item}`)
      if (stat.isDirectory() === true) { 
          let key=item.split("-").pop()-0
          arr.push(key)
      }
    })
    let max=Math.max(...arr)
    console.log(`最大的机器号码：${max}`)
    return max
  }else{
    return false
  }
}

const singleInstall = async item => {
    try{
        let dir=`E:\\machines\\${item}\\`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        let max=getMax(dir)
        for(let i=max+1;i<max+100;i++){
          let start=moment()
          let newVM=`${dir}${item}-${i}\\${item}-${i}.vmx`
          //克隆虚拟机的快照
          let cmdStr = `vmrun -T ws  clone  "E:\\machines\\xp3\\xp3.vmx" ${newVM} linked -snapshot=init8  -cloneName=${item}-${i}`;
          await execsync(cmdStr,item);
          // 启动虚拟机
          let cmdStr2 = `vmrun -T ws start "${newVM}" nogui`;
          await execsync(cmdStr2,item);
          await sleep("20s");
          // 牛B修改
          let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "${newVM}" "C:\\Documents and Settings\\Administrator\\桌面\\modify.exe" `
          await execsync(cmdStr3,item);
          await sleep("60s");
          // 静默安装软件
          let cmdStr4=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "${newVM}" "C:\\Documents and Settings\\Administrator\\桌面\\${item}\\7654静默包.exe" `
          await execsync(cmdStr4,item);
          await sleep("20s");
          // 关机
          let cmdStr5 = `vmrun -T ws stop "${newVM}" soft`;
          await execsync(cmdStr5,item);
          if (fs.existsSync(`${dir}${item}-${i-5}`)) {
            console.log(`delete ${dir}${item}-${i-5}`)
            deleteall(`${dir}${item}-${i-5}`)
          }
          console.log(`${chalk.yellow('total cost')}:${moment(start).fromNow(true)}`);
        }
          
          /* let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx" "C:\\Documents and Settings\\Administrator\\桌面\\modify.exe" `
          // let cmdStr3=`vmrun   -T ws  -gu Administrator -gp 1 start   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx"`
          console.log(cmdStr3)
          await execsync(cmdStr3); */
    }catch(e){
        console.log(`${chalk.red(formatDateTime(item))}:${e}`)
    }
  
};
(()=>{
  singleInstall('15135153038')
})()
