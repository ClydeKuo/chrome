const fs = require('fs')
var moment=require("moment")
// let date=moment().format('MM-DD')
let date="08-25"

let arr=[]
let files = fs.readdirSync(`E:\\machines/${date}/`)
console.log(files)
files.forEach(function (item, index) {
    let stat = fs.lstatSync(`E:\\machines/${date}/${item}`)
    if (stat.isDirectory() === true) { 
        let key=item.split("-").pop()-0
        arr.push(key)
    }
})
console.log(Math.max(...arr))