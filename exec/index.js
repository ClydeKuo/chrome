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
        for(let i=0;i<3;i++){
          let cmdStr = `vmrun -T ws  clone  "E:\\machines\\xp3\\xp3.vmx" E:\\machines\\${date}\\${date}-${i}\\${date}-${i}.vmx linked -snapshot=init  -cloneName=${date}-${i}`;
          await execsync(cmdStr);
          /* let cmdStr2 = `vmrun -T ws start "E:\\machines\\${date}\\${date}-${i}\\${date}-${i}.vmx"`;
          await execsync(cmdStr2); */
        }
        
        /* let cmdStr3=`vmrun -T ws runProgramInGuest  "E:\\machines\\${name}\\${name}.vmx" "C:\\windows\\system32\\calc.exe"`
        console.log(cmdStr3)
        await execsync(cmdStr3); */
    }catch(e){
        console.log(e)
    }
  
};
init()
