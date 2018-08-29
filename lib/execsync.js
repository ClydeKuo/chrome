const exec = require("child_process").exec;
const chalk = require("chalk");
const formatDateTime =require("./formatDateTime")
// vmrun的命令
module.exports=(cmdStr,item) => {
    console.log(`${chalk.green(formatDateTime(item))}:${cmdStr}`)
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