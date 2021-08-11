
export const wait = (ms) => {
  return new Promise(res => setTimeout(res, ms || 1000))
}
export const prettyLog = (text) => {
  console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
  console.log()
}

