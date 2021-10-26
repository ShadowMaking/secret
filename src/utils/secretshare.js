// import ss from "secrets.js-grempe"
import ss from 'secrets.js-34r7h'
 
// why need: https://docs.ethers.io/v5/cookbook/react-native/#cookbook-reactnative-security
import "@ethersproject/shims"
import * as ethers from 'ethers'

import { defaultPath, HDNode, entropyToMnemonic, Mnemonic } from "@ethersproject/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { arrayify, Bytes, BytesLike, concat, hexDataSlice, isHexString, joinSignature, SignatureLike } from "@ethersproject/bytes";

export const SecLevelEnum =  {
  STRONG: 'STRONG',
  MEDIUM: 'MEDIUM',
  WEAK: 'WEAK',
  CUSTOM: 'CUSTOM',
}

let kSecWords = new Map();
kSecWords.set(SecLevelEnum.STRONG, 24);
kSecWords.set(SecLevelEnum.MEDIUM, 15);
kSecWords.set(SecLevelEnum.WEAK, 12);

let kShareSchema = new Map();
kShareSchema.set(SecLevelEnum.STRONG, [10, 7]) // 10-7
kShareSchema.set(SecLevelEnum.MEDIUM, [5, 3]) // 5-3
kShareSchema.set(SecLevelEnum.WEAK, [3, 2]) // 3-2
// kShareSchema.set(SecLevelEnum.CUSTOM, [3, 3]) // 3-3

export const setCustom = (range) => {
  kShareSchema.delete(SecLevelEnum.CUSTOM)
  kShareSchema.set(SecLevelEnum.CUSTOM, _.cloneDeep(range))
}

// returns hex string
export const generate_key = (options) => {
  let entropy = ethers.utils.randomBytes(16);
  if (!options) { options = { }; }
  if (options.extraEntropy) {
    entropy = arrayify(hexDataSlice(keccak256(concat([ entropy, options.extraEntropy ])), 0, 16));
  }
  return ethers.utils.hexValue(entropy)
}

// retrurn:
//  randomMnemonic: seperated by comma ','
export const generate_mnemonic = (typ) => {
  let words_level = (kSecWords.get(typ)- 12)/3;
  let bytes = ethers.utils.randomBytes(16 + 4*words_level);

  // Select the language:
  //   - en, es, fr, ja, ko, it, zh_ch, zh_tw
  let language = ethers.wordlists.en;
  let randomMnemonic = ethers.utils.entropyToMnemonic(bytes, language)
  return randomMnemonic
}

//param:
//  secret: hex
//  if secret is password, wrap it by str2hex:
//  // convert the text into a hex string
//  var pwHex = secrets.str2hex(pw); // => hex string
//  //split into 5 shares, with a threshold of 3
//  var shares = secrets.share(pwHex, 5, 3);
//  //combine 2 shares:
//  var comb = secrets.combine( shares.slice(1,3) );
//  convert back to UTF string:
//  comb = secrets.hex2str(comb);
//  console.log( comb === pw  ); // => false
export const split = (secret, level) => {
  const lvl = kShareSchema.get(level)
  const str2hex_secret = ss.str2hex(secret)
  const shares = ss.share(str2hex_secret, lvl[0], lvl[1])
  // const com = ss.combine(shares)
  // console.log('re', ss.hex2str(com))
  return shares
}

export const combine = (shares) => {
  const com = ss.combine(shares)
  // return ss.combine(shares)
  return ss.hex2str(com)
}
