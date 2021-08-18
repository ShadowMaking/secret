/* 
数据全部存储在前端缓存
1、登录状态信息（object）
2、钱包信息（object）
  钱包有密码和助记词，与钱包默认的第一个账户相关联，可通过助记词恢复首个钱包账户，其他钱包账户不予助记词 相关联
3、账户信息（ObjectArray）
  账户对应地址（address）和私钥（privateKey）。



*/

// 登录状态信息
// {"login":true,"address":"0x289d74857DB6fEacae9A4119B19B9377aBFD561F"}
const loginInfo = {
  loginInfo: {
    login: true,
    address: "0x289d74857DB6fEacae9A4119B19B9377aBFD561F",
  }
}

// 钱包信息
// {"address":  "0xdC851Fe578e3F64283c090b1B179278FA1b2Fc06","privateKey": "0xb2e74cf1e191d5aec9ad12cec86b71b5b6e93477c4dbd86567e83c29d6102a7a","psw":  "1","isLock":false}
const walletInfo = {
  address:  "0xdC851Fe578e3F64283c090b1B179278FA1b2Fc06",
  privateKey: "0xb2e74cf1e191d5aec9ad12cec86b71b5b6e93477c4dbd86567e83c29d6102a7a",
  psw:  "1",
  isLock: false,
}

// 账户信息
// [{"index":1,"name":"Account1","psw":"1","address":"0x289d74857DB6fEacae9A4119B19B9377aBFD561F","privateKey":"0x3c1f544c626eb2c84cc605a33070ea11438b6de2e226de626a74fd47a7b80699"}]
const walletAccount = [
  {
    index:  1,
    name:"  Account1",
    psw:  "1", // 只有首个账户有这个值，属于默认账户的标记
    address:  "0x289d74857DB6fEacae9A4119B19B9377aBFD561F",
    privateKey: "0x3c1f544c626eb2c84cc605a33070ea11438b6de2e226de626a74fd47a7b80699"
  },
]

// 连接的网络信息
const connectNet = {
  
}



