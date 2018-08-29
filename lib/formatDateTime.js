const moment=require("moment")
module.exports=item=> {  
    let time=`${moment().format('YYYY MM DD h:mm:ss')}${item?`(${item})`:"1"}`
    return time;  
  };