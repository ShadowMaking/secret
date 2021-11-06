import request from '@/utils/request';

// get guardians list(we can filter the status, e.g,get only mutual staus guardian)
export const getMyFriendsList = (data) => {
  const userId = data['userId'];
  const _data = {
    action: 'guardians',
    status: data['status'],
  }
  return request({
    url: `/api/user/${userId}`,
    method: 'get',
    params: _data
  })
}

// get strangers list
export const getStrangerFriendsList = (data) => {
  const userId = data['userId'];
  const _data = {
    action: 'strangers',
  }
  return request({
    url: `/api/user/${userId}`,
    method: 'get',
    params: _data
  })
}

// send a guardian request(or user email instead)
export const addFrined = (data) => {
  const userId =  ~~data.fromUserID
  const _data = {
    guardian_email: data.toUserEmail,
    // guardian_id: 
  }
  return request({
    url: `/api/user/${userId}/guardian`,
    method: 'post',
    data: _data,
  })
}

// remove a guardian
export const removeFriend = (data) => {
  const userId =  ~~data.fromUserID
  const _data = {
    // guardian_email: data.toUserEmail,
    guardian_id: data.toUserID,
  }
  return request({
    url: `/api/user/${userId}/guardian`,
    method: 'delete',
    data: _data,
  })
}

// confirm a guardian request(or user email instead)
export const confirmForAddFrined = (data) => {
  const userId = ~~data.fromUserID
  const _data = {
    action: 'confirm',
    guardian_id: ~~data.toUserID,  // responder_email: data.toUserEmail
    // guardian_email: data.toUserEmail
  }
  return request({
    url: `/api/user/${userId}/guardian`,
    method: 'put',
    data: _data,
  })
}

// reject a guardian request(or user email instead)
export const rejectForAddFrined = (data) => {
  const userId = ~~data.fromUserID
  const _data = {
    action: 'reject',
    guardian_id: ~~data.toUserID,  // responder_email: data.toUserEmail
    // guardian_email: data.toUserEmail,
  }
  return request({
    url: `/api/user/${userId}/guardian`,
    method: 'put',
    data: _data,
  })
}

// 
export const getRecoveryData = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/recovery?user_id=${userId}`,
    method: 'get',
  })
}

// {"user_id": 2, "total_shared_num": 1, "threshold": 1, "friends": [{"user_id": 2, "email": "a@b.com"}, {"user_id": 3, "email": "c@d.com"}]}
export const saveRecoveryData = (data) => {
  const _data = {
    // action: 'friend_reject',
    user_id: ~~data.fromUserID,
    total_shared_num: ~~data.totalSharedNum,
    threshold: ~~data.threshold,
    friends: data.selectedFriendsList,
    name: data.name,
    desc: data.desc,
  }
  return request({
    url: '/api/recovery',
    method: 'post',
    data: _data,
  })
}

export const getOTPAuthUrl = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/otpauth?user_id=${userId}`,
    method: 'get',
  })
}

/* export const verifyCode = (data) => {
  const _data = {
    user_id: ~~data.userId,
    code: data.code,
  }
  return request({
    url: `/api/otpauth`,
    method: 'post',
    data: _data,
  })
} */

export const verifyCode = (data) => {
  const _data = {
    // user_id: ~~data.userId,
    code: data.code,
  }
  const userId = ~~data.userId
  return request({
    url: `/api/user/${userId}/otpauth`,
    method: 'post',
    data: _data,
  })
}

export const saveOTPSecret = (data) => {
  const userId = ~~data.userId
  const _data = {
    secret: data.secret
  }
  return request({
    url: `/api/user/${userId}/otpauth`,
    method: 'put',
    data: _data,
  })
}

export const getUserInfoById = (data) => {
  const userId = ~~data.userId
  return request({
    url: `/api/user/${userId}`,
    method: 'get',
  })
}
