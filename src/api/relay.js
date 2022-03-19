import request from '@/utils/request';


/***************************** KMS Encrypt Decrypt ***************************/
// Simple local public key cache service on sqlite, with ecies inside.


// #query all
// curl -XGET -H "Content-Type:application/json"  --url "localhost:3000/stores"
export const getAllPublicKey = (data) => {
  return request({
    url: `/api/stores`,
    method: 'get',
  })
}


// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/kms/7/enc" -d '{"c1": "xxxx", "cc1": "xxxx" }'
// c1: encrypted private key by relay public key
// cc1: encrypted password by relay public key
export const encryptPrivateKeyByEcies = (data) => {
  const { userId, c1, cc1, hash } = data
  return request({
    url: `/api/kms/${userId}/enc`,
    method: 'post',
    data: { c1, cc1, hash },
  })
}

// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/kms/7/dec" -d '{"cr1": "xxxx", "c1": "xxxx", "cc2": "xxxx", }'
// cr1: encrypted aes secret by relay public key
// c1: encrypted password by relay public key
// cc2: encrypted private key by kms
export const decryptPrivateKeyByEcies = (data) => {
  const { userId, cr1, c1, cc2 } = data;
  return request({
    url: `/api/kms/${userId}/dec`,
    method: 'post',
    data: { cr1, c1, cc2 },
  })
}


// generate type for params  https://github.com/ieigen/relay_sdk/blob/main/test/sdk.test.ts#L67

