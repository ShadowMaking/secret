
export const wait = (ms) => {
  return new Promise(res => setTimeout(res, ms || 1000))
}
export const prettyLog = (text) => {
  console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
  console.log()
}

//用于生成uuid
const S4 = () => {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
export const guid = () => {
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

