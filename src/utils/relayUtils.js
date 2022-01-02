import * as ecies from "./ecies";

// for debug
const debug_pub = "04a52438a5c1bba393d167994974b6d299bbdb078263144c9d9429bb65bb151fa3718657caea7bb5adef04a8cf8d40ff20bbc3a9330f04c2acb5b209cd25a2d863";
const debug_priv = "404a7d7eb5f367ba756dfd1c4f3b14fad4b1000a7cbac2497edac02eb078aab9"
const PUBK = process.env.PUBK || debug_pub
const PRIK = process.env.PRIK || debug_priv
export { PUBK, PRIK }

// string to base64
const encode = (str) =>{
  const encode = encodeURI(str);
  const base64 = btoa(encode);
  return base64;
}

// base64Str to string
const decode = (base64Str) => {
  const decode = atob(base64Str);
  const str = decodeURI(decode);
  return str;
}

export const OPTIONS_ENCRYPT = {
  hashName: 'sha512',
  hashLength: 64,
  macName: 'sha256',
  macLength: 32,
  curveName: 'prime256v1',
  symmetricCypherName: 'aes-256-gcm',
  keyFormat: 'uncompressed',
  s1: null, // optional shared information1
  s2: null // optional shared information2
}

// cciyaJlfyWKUfznCoMLBpw==
export const generatePswRandom = (length=16) => ecies.crypto.randomBytes(length).toString("base64");

export const generatePublickKeyByRelayPublickKey = (relayPubKey) => {
  const keyPair = ecies.ec.keyFromPublic(relayPubKey, "hex");
  const publicKey = keyPair.getPublic();
  return publicKey
}

// publicKey and privateKey
export const generateEncryptPrivateKeyByPublicKey = (relayPubKey, privateKey) =>{
  const publicKey = generatePublickKeyByRelayPublickKey(relayPubKey);
  const c1 = ecies.encrypt(publicKey, privateKey, OPTIONS_ENCRYPT).toString("hex");
  return c1
}

// publicKey and password
export const generateEncryptPswByPublicKey = (relayPubKey, password) =>{
  const publicKey = generatePublickKeyByRelayPublickKey(relayPubKey);
  const psw = encode(password)
  const cc1 = ecies.encrypt(publicKey, psw, OPTIONS_ENCRYPT).toString("hex");
  return cc1
}

export const generateCR1ByPublicKey = (relayPubKey) => {
  const aesKey = ecies.crypto.randomBytes(32)
  const publicKey = generatePublickKeyByRelayPublickKey(relayPubKey);
  const cr1 = ecies.encrypt(publicKey, aesKey, OPTIONS_ENCRYPT).toString("hex")
  return cr1
}
