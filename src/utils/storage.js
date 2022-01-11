function getStorage(storageType = 'local') {
  if (storageType === 'local') {
    return window.localStorage
  } else if (storageType === 'session') {
    return window.sessionStorage
  }
  return undefined
}

export const saveToStorage = (obj, storageType = 'local') => {
  const storage = getStorage(storageType)
  if (storage) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] == 'object'){
        storage.setItem(key, window.JSON.stringify(obj[key]));
      } else {
        storage.setItem(key, obj[key])
      }
    })
  }
}

export const getFromStorage = (key, storageType = 'local') => {
  const storage = getStorage(storageType)
  let value
  if (storage) {
    try {
      value = storage.getItem(key)
    } catch (e) {
      console.error(e)
      value = undefined
    }
  }
  return value
}

export const removeFromStorage = (keys, storageType = 'local') => {
  const storage = getStorage(storageType)
  if (storage && keys && keys.length > 0) {
    keys.forEach(key => storage.removeItem(key))
  }
}

export const getInfoFromStorageByKey = (key, storageType = 'local') => {
  const info = getFromStorage(key, storageType)
  if (info) {
    return window.JSON.parse(info)
  }
  return null
}

export const getStringInfoFromStorageByKey = (key, storageType = 'local') => {
  const info = getFromStorage(key, storageType)
  if (info) {
    return info
  }
  return null
}

// clear storage's wallet info
export const removeWallet = () => {
  if (getFromStorage('walletInfo')) {
    removeFromStorage(['walletInfo', 'walletAccounts', 'loginInfo', 'connectNet']);
  }
}
