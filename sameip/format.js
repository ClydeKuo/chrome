/* 格式xml,获取url信息，数据写在了data文件夹下面 */
const parseString = require('xml2js').parseString;
const fs = require("fs");

// 获取所有源数据文件
let fileArr=fs.readdirSync(`${__dirname}/source/`)

let arr=['ftp','ssh','telent','mssql','mysql','rdp','mongo']
let res=arr.map(key=>{
    return {type:key,data:[]}
})
fileArr.forEach(file=>{
    let xml = fs.readFileSync(`${__dirname}/source/${file}`).toString();
    parseString(xml, function (err, result) {
        // console.dir(result.nmaprun.host[0].ports[0].port[0].state[0].$.state); 
        result.nmaprun.host.forEach(item=>{
            res.forEach((key,index)=>{
                if (item.ports[0].port[index].state[0].$.state==="open"){
                    key.data.push(item)
                } 
            })
        })
        res.forEach(item=>{
            let str=item.data.map(key=>`${key.address[0].$.addr}`).join("\r\n")
            fs.writeFileSync(`${__dirname}/data/${item.type}.txt`,str)
        })
    });
})
