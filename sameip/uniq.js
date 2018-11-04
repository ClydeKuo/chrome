const _ = require('lodash');
const fs = require("fs");

let data=fs.readFileSync(`${__dirname}/data/userd.txt`).toString();
let domainList=data.split("\r\n")
console.log(domainList.length)
let uniqList=_.uniq(domainList)
console.log(uniqList.length)
fs.writeFileSync(`${__dirname}/data/user.txt`,uniqList.join("\r\n"))
