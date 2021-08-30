import Big from 'big.js';

export const minus = (num1, num2) => {
  const _num1 = new Big(num1);
  const _num2 = new Big(num2);
  return _num1.minus(_num2);
}

export const lteZero = (num, containZero=true) => {
  const _num = new Big(num);
  return containZero ? _num.lte(new Big(0)) : _num.lt(new Big(0));
}

export const isZero = (num=0) => {
  if (!num) { return true };
  return new Big(num).eq(new Big(0))
}

export const createBigNumber = (num=0) => {
  return new Big(num);
}

// align positive || reverse
export const compareDate = (arrKey, align='positive') => (a,b) => {
  const v1 = a[arrKey];
  const v2 = b[arrKey];
  var x = new Big(new Date(v1).getTime())
  var y = new Big(new Date(v2).getTime())
  if (align ==='positive') {
    return  x.minus(y)
  } else {
    return  y.minus(x)
  }
}