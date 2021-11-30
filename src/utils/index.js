import { TRANSACTION_TYPE } from '@/api/transaction';
import moment from 'moment'
import { etherscanAPIKeyToken, etherscanAPIBaseUrl } from '@/utils/global';

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

export const getStatusTxt = (record) => {
  let statusTxt = 'pending';
  switch(record.status) {
    case 0:
      statusTxt = 'fail'
      break;
    case 1:
      if (record.type === TRANSACTION_TYPE['L2ToL1']) {
        statusTxt = 'pending'
      } else {
        statusTxt = 'success'
      }
      break;
    case 2:
      statusTxt = 'success'
      break;
    default:
      statusTxt = 'pending';
  }
  return statusTxt;
}

export const subStrAddress = (str) => {
  return str && str.length > 12 ? `${str.substr(0,12)}...` : str
}

export const generateTransactionList = (list=[]) => {
  return list.map(item => ({
    status: getStatusTxt(item),
    hash: item['txid'],
    from: item['from'],
    to: item['to'],
    blockNumber: item['block_num'] === -1 ? 'N/A' : item['block_num']||'N/A',
    time: moment(item['createdAt']).format('DD/MM/YYYY HH:mm:ss'),
  }))
}

export const ajaxGetRequestByEtherscan = (params) => new Promise((resolve, reject) => {
  const ajaxObj = new XMLHttpRequest();
  let paramStr = ''
  for(let k in params.data) {
    paramStr += `&${k}=${params.data[k]}`
  }
  const url = `${etherscanAPIBaseUrl}/api?${paramStr}&apikey=${etherscanAPIKeyToken}`
  ajaxObj.open(params.method || 'get', url);
  ajaxObj.send();
  ajaxObj.onreadystatechange = async () => {
    if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
      const response = ajaxObj.response && window.JSON.parse(ajaxObj.response)
      resolve({ hasError: false, data: response['result']||'' })
    }
  }
})
export const getRouteNameAndQuery = (record, type) => {
  let routeName = 'home';
  let query;
  switch(type) {
    case 'hash':
      routeName = 'tx';
      query = {tstr: encodeURIComponent(record.hash)};
      break;
    case 'block':
      routeName = 'block';
      if (/^[1-9]+\d*$/.test(record.blockNumber)) {
        query = {n: encodeURIComponent(record.blockNumber)};
      } else {
        query = {tx: encodeURIComponent(record.hash)};
      }
      break;
    case 'from':
      routeName = 'address';
      query = {type: '1', adr: encodeURIComponent(record.from)}
      break;
    case 'to':
      routeName = 'address';
      query = {type: '2', adr: encodeURIComponent(record.to)}
      break;
    default:
      routeName = 'home';
      break;
  }
  return { routeName, query }
}
