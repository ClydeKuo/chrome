const _ = require('lodash');
const fs = require("fs");

let data=fs.readFileSync(`${__dirname}/res.txt`).toString();
let domainList=data.split("\r\n")
console.log(domainList.length)
let uniqList=_.uniq(domainList)
console.log(uniqList.length)
fs.writeFileSync(`${__dirname}/uniqres.txt`,uniqList.join("\r\n"))
