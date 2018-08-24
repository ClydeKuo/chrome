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
var exec = require("child_process").exec;
var moment=require("moment")
const fs = require('fs')
const sleep = require("ko-sleep");
const formatDateTime =require("../lib/formatDateTime")
const chalk = require("chalk");
// vmrun的命令
const execsync = cmdStr => {
  console.log(`${chalk.green(formatDateTime())}:${cmdStr}`)
  return new Promise((resolve, reject) => {
    exec(cmdStr, function(err, stdout, stderr) {
      if (err) {
          console.log(err)
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};
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

const init = async () => {
    try{
        let date=moment().format('MM-DD')
        let dir=`E:\\machines\\${date}\\`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        let max=getMax(dir)
        for(let i=max+1;i<max+100;i++){
          console.time("install")
          let newVM=`${dir}${date}-${i}\\${date}-${i}.vmx`
          //克隆虚拟机的快照
          let cmdStr = `vmrun -T ws  clone  "E:\\machines\\xp3\\xp3.vmx" ${newVM} linked -snapshot=init7  -cloneName=${date}-${i}`;
          await execsync(cmdStr);
          // 启动虚拟机
          let cmdStr2 = `vmrun -T ws start "${newVM}" nogui`;
          await execsync(cmdStr2);
          await sleep("20s");
          // 牛B修改
          let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "${newVM}" "C:\\Documents and Settings\\Administrator\\桌面\\modify.exe" `
          await execsync(cmdStr3);
          await sleep("100s");
          // 静默安装软件
          let cmdStr4=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "${newVM}" "C:\\Documents and Settings\\Administrator\\桌面\\7654静默包\\7654静默包.exe" `
          await execsync(cmdStr4);
          await sleep("20s");
          // 关机
          let cmdStr5 = `vmrun -T ws stop "${newVM}" soft`;
          await execsync(cmdStr5);
          console.timeEnd('install');
        }
          
          /* let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx" "C:\\Documents and Settings\\Administrator\\桌面\\modify.exe" `
          // let cmdStr3=`vmrun   -T ws  -gu Administrator -gp 1 start   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx"`
          console.log(cmdStr3)
          await execsync(cmdStr3); */

          
        /* let arr=['"C:\\Program Files\\KuGou\\KGMusic\\KuGou.exe"','"C:\\Program Files\\IQIYI Video\\LStyle\\5.5.33.3550\\QyClient.exe" desktoprun']
        let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest  "E:\\machines\\08-20\\08-20-0\\08-20-0.vmx" ${arr[5]}`
        console.log(cmdStr3)
        await execsync(cmdStr3); */
    }catch(e){
        console.log(e)
    }
  
};
init()
