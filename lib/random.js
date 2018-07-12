//生成随机数据
module.exports=(minNum, maxNum) =>{
  if(!isNaN(minNum)&&!isNaN(maxNum)){
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
  }else if(!isNaN(minNum)){
    return parseInt(Math.random() * minNum + 1, 10);
  }else{
      return 0
  }
}