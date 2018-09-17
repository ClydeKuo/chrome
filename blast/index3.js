const baidu=require("./baidu");
const ftp=require("./ftp");
const list=require("./data.json");
(async ()=>{
// let data =await baidu("维护")
// console.log(data.length)
let data=await ftp(list)
console.log(data)
})()
