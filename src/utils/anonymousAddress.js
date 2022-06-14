
import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import * as elliptic from "elliptic"
import * as cls from "circomlibjs"
import  * as BN  from "bignumber.js"

const EC = elliptic.ec;
const ec = new EC("secp256k1");

//called by sender Generate one-time address
const PublicKey = function (receiverPublicKeyHex, message, nonce, senderPrivateKeyHex) {
  if (receiverPublicKeyHex.slice(0,2) == "0x") {
    receiverPublicKeyHex = receiverPublicKeyHex.slice(2)
  }
  var receiverPublicKey = ec.keyFromPublic(receiverPublicKeyHex, 'hex')//Import public key
  let senderPrivateKey = ec.keyFromPrivate(senderPrivateKeyHex, "hex")
  var shared1 = senderPrivateKey.derive(receiverPublicKey.getPublic())
  var shareHash = crypto.createHash('sha256').update(shared1.toString("hex")).digest('hex')
  var txHash = crypto.createHash('sha256').update(message.toString("hex")).digest('hex')
  let finalMessage = shareHash.concat(txHash).concat(nonce.toString())
  var finalHash = crypto.createHash('sha256').update(finalMessage).digest('hex')
  let tmpKey = ec.keyFromPrivate(finalHash, "hex")
  return receiverPublicKey.getPublic().add(tmpKey.getPublic()).encode("hex")
}

//call by receiver  get PrivateKey 
const  PrivateKey = function (receiverPrivateKeyHex, message, nonce, senderPublicKeyHex) {
  var senderPublicKey = ec.keyFromPublic(senderPublicKeyHex, 'hex');
  let receiverPrivateKey = ec.keyFromPrivate(receiverPrivateKeyHex, "hex")
  var shared1 = receiverPrivateKey.derive(senderPublicKey.getPublic());
  var shareHash = crypto.createHash('sha256').update(shared1.toString("hex")).digest('hex');
  var txHash = crypto.createHash('sha256').update(message.toString("hex")).digest('hex');
  let finalMessage = shareHash.concat(txHash).concat(nonce.toString());
  var finalHash = crypto.createHash('sha256').update(finalMessage).digest('hex');
  console.log(receiverPrivateKeyHex, "||", finalHash)
  let newSK = new BN(receiverPrivateKeyHex, 16).add(new BN(finalHash, 16))
  return ec.keyFromPrivate(newSK)
}

//call by receiver  Verify
const  Verify = function (pubkey, receiverPrivateKeyHex, message, nonce, senderPublicKeyHex) {
  var senderPublicKey = ec.keyFromPublic(senderPublicKeyHex, 'hex');
  let receiverPrivateKey = ec.keyFromPrivate(receiverPrivateKeyHex, "hex")
  var shared1 = receiverPrivateKey.derive(senderPublicKey.getPublic());
  var shareHash = crypto.createHash('sha256').update(shared1.toString("hex")).digest('hex');
  var txHash = crypto.createHash('sha256').update(message.toString("hex")).digest('hex');
  let finalMessage = shareHash.concat(txHash).concat(nonce.toString());
  var finalHash = crypto.createHash('sha256').update(finalMessage).digest('hex');
  let tmpKey = ec.keyFromPrivate(finalHash, "hex")
  let vPubkey = receiverPrivateKey.getPublic().add(tmpKey.getPublic()).encode("hex")
  return vPubkey == pubkey;
}

const Message = async function(nonce, senderPublicKeyHex, receiverPublicKeyHex, amount) {
  let mimcJS = await cls.buildMimc7()
  const message1 = mimcJS.hash(nonce, senderPublicKeyHex)
  const message2 = mimcJS.hash(mimcJS.F.toString(message1), receiverPublicKeyHex)
  const message3 = mimcJS.hash(mimcJS.F.toString(message2), amount)
  const message = mimcJS.F.toString(message3)
  return message
}

export { PublicKey, PrivateKey, Verify, Message }
