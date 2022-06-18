
import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import * as elliptic from "elliptic"
// import * as cls from "circomlibjs"
import  * as BN  from "bn.js"
import { PublickeyToAddress } from '@/utils/dashBoardTools';

const EC = elliptic.ec;
const ec = new EC("secp256k1");

//called by sender Generate one-time address
const PublicKey = function (receiverPublicKeyHex, message, nonce, senderPrivateKeyHex) {
  if (receiverPublicKeyHex.slice(0,2) == "0x") {
    receiverPublicKeyHex = receiverPublicKeyHex.slice(2)
  }
  if (senderPrivateKeyHex.slice(0,2) == "0x") {
    senderPrivateKeyHex = senderPrivateKeyHex.slice(2)
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
  if (receiverPrivateKeyHex.slice(0,2) == "0x") {
    receiverPrivateKeyHex = receiverPrivateKeyHex.slice(2)
  }
  if (senderPublicKeyHex.slice(0,2) == "0x") {
    senderPublicKeyHex = senderPublicKeyHex.slice(2)
  }
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
  if (senderPublicKeyHex.slice(0,2) == "0x") {
    senderPublicKeyHex = senderPublicKeyHex.slice(2)
  }
  if (receiverPrivateKeyHex.slice(0,2) == "0x") {
    receiverPrivateKeyHex = receiverPrivateKeyHex.slice(2)
  }
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

const Message =  function(nonce, senderPublicKeyHex, receiverPublicKeyHex, amount) {
  const messageObj = {
    nonce: nonce,
    pubA: senderPublicKeyHex,
    pubB: receiverPublicKeyHex,
    amount: amount,
  };
  const message = crypto
    .createHash("sha256")
    .update(JSON.stringify(messageObj))
    .digest("hex");
  return message
}

const getAccount = function() {
  var keyA = ec.genKeyPair();
  var pubAPoint = keyA.getPublic();
  var pubA = pubAPoint.encode("hex");

  var keyB = ec.genKeyPair();
  var pubBPoint = keyB.getPublic();
  var pubB = pubBPoint.encode("hex");
  const nonce = 12;
  const amount = 10;
  console.log(keyB.getPrivate())
  console.log(pubA)
  console.log(pubB)

  pubA = '04c653f4f110ea8429290dad6e4478da647eedf08c8150415d98afa99da78d7356f09d282312d7d770a836d10e97f9b5f083783541f1856b28855a98dcbc9f2d32'
  pubB = '04c653f4f110ea8429290dad6e4478da647eedf08c8150415d98afa99da78d7356f09d282312d7d770a836d10e97f9b5f083783541f1856b28855a98dcbc9f2d32'
  const message = Message(nonce, pubA, pubB, amount)
  console.log(message)
  let pubkey = PublicKey(
    pubB,
    Buffer.from(message),
    nonce,
    'be4d5c448c9f0dda137ea10e78475fe9febcde93c4e75ab4fda41b1fee94de29'
  )

  console.log(keyB.getPrivate().toString("hex"))
  const isVerify = Verify(pubkey, 'be4d5c448c9f0dda137ea10e78475fe9febcde93c4e75ab4fda41b1fee94de29', Buffer.from(message), nonce, pubA)
  console.log(isVerify)
  let newSK = PrivateKey(
    'be4d5c448c9f0dda137ea10e78475fe9febcde93c4e75ab4fda41b1fee94de29',
    Buffer.from(message),
    nonce,
    pubA
  )
  console.log(newSK)
  console.log(newSK.getPrivate().toString("hex"));

  
  let address = PublickeyToAddress(pubkey)
  console.log(address)
}

export { PublicKey, PrivateKey, Verify, Message}
