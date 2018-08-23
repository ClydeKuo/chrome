var exec = require("child_process").exec;
var moment=require("moment")
const fs = require('fs')
const execsync = cmdStr => {
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

const init = async () => {
    try{
        let date=moment().format('MM-DD')
        if (!fs.existsSync(`E:\\machines/${date}/`)) {
          fs.mkdirSync(`E:\\machines/${date}/`);
        }
        for(let i=0;i<1;i++){
          let cmdStr = `vmrun -T ws  clone  "E:\\machines\\xp3\\xp3.vmx" E:\\machines\\${date}\\${date}-${i}\\${date}-${i}.vmx linked -snapshot=init4  -cloneName=${date}-${i}`;
          console.log(cmdStr)
          await execsync(cmdStr);
          let cmdStr2 = `vmrun -gu Administrator -gp 1 -T ws start "E:\\machines\\${date}\\${date}-${i}\\${date}-${i}.vmx"`;
          console.log(cmdStr2)
          await execsync(cmdStr2);
        }
        // let cmdStr2 = `vmrun -T ws stop "E:\\machines\\${date}\\${date}-0\\${date}-1.vmx" soft`;
        //   await execsync(cmdStr2);
          /* let cmdStr3 = `vmrun -T ws list`;
          let data=await execsync(cmdStr3);
          console.log(data.split("\n")) */
          
          /* let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx" "C:\\Documents and Settings\\Administrator\\桌面\\modify.exe" `
          // let cmdStr3=`vmrun   -T ws  -gu Administrator -gp 1 start   "E:\\machines\\08-23\\08-23-0\\08-23-0.vmx"`
          console.log(cmdStr3)
          await execsync(cmdStr3); */


        /* let arr=['"C:\\Program Files\\xiaoyu\\xiaoyu.exe"','"C:\\Program Files\\快压\\X86\\KuaiZip.exe"','"C:\\Program Files\\Heinote\\Heinote.exe"','"C:\\Documents and Settings\\Administrator\\Application Data\\PhotoViewer\\PhotoViewer.exe"','"C:\\Program Files\\KuGou\\KGMusic\\KuGou.exe"','"C:\\Program Files\\Tencent\\QQBrowser\\qqbrowser.exe" -sc=desktopshortcut -fixlaunch=0','"C:\\Program Files\\IQIYI Video\\LStyle\\5.5.33.3550\\QyClient.exe" desktoprun']
        let cmdStr3=`vmrun  -gu Administrator -gp 1  -T ws runProgramInGuest  "E:\\machines\\08-20\\08-20-0\\08-20-0.vmx" ${arr[5]}`
        console.log(cmdStr3)
        await execsync(cmdStr3); */
    }catch(e){
        console.log(e)
    }
  
};
init()
