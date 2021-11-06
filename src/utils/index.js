
export const wait = (ms) => {
  return new Promise(res => setTimeout(res, ms || 1000))
}
export const prettyLog = (text) => {
  console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
  console.log()
}
export const copyTxt = (txt) => {
  let oInput = document.createElement('input');
  oInput.value = txt;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand("Copy");
  oInput.remove()
  console.log(oInput.value);
  return true
}
export const  isPc = () => {
  const userAgentInfo = navigator.userAgent;
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let flag = true;
  agents.some(item => {
    if(userAgentInfo.indexOf(item) > 0) {
      flag = false
      return true
    }
  })
  return flag
}

export const getQueryString = (name, str) => {
  if (!str) { return null }
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = str.match(reg);
	if (r != null) return unescape(r[2]); return null;
}

export const getLocationParam = (key) => {
  var locationHref = window.location.href,
      rexp = new RegExp("[&?]{1}" + key + "=([^&?|^#?]*)", "ig");
  // return locationHref.match(rexp) ? decodeURI(locationHref.match(rexp)[0].substr(key.length + 2)) : (locationHref = document.referrer, locationHref.match(rexp) ? decodeURI(locationHref.match(rexp)[0].substr(key.length + 2)) : "");
  return locationHref.match(rexp) ? decodeURI(locationHref.match(rexp)[locationHref.match(rexp).length-1].substr(key.length + 2)) : (locationHref = document.referrer, locationHref.match(rexp) ? decodeURI(locationHref.match(rexp)[locationHref.match(rexp).length-1].substr(key.length + 2)) : "");
}