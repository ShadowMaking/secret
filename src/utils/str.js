export const formatTrim = (value) => {
  return value.replace(/[^\w\/]/ig,'')
}

export const objHasOwnProperty = (obj, value) => {
  return Object.prototype.hasOwnProperty.call(obj, value)
}