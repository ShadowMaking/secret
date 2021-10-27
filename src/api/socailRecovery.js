import request from '@/utils/request';

export const getMyFriendsList = (data) => {
  const userId = data['userId'];
  let url = `/api/user?action=friends&user_id=${userId}`
  data['status']&& (url = `${url}&status=${data['status']}`)
  return request({
    url: url,
    method: 'get',
  })
}

export const getStrangerFriendsList = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/user?action=strangers&user_id=${userId}`,
    method: 'get',
  })
}

export const addFrined = (data) => {
  const _data = {
    action: 'friend_request',
    requester_id: ~~data.fromUserID,
    responder_email: data.toUserEmail
  }
  return request({
    url: '/api/user',
    method: 'post',
    data: _data,
  })
}

export const removeFriend = (data) => {
  const _data = {
    requester_id: data.fromUserID,
    responder_id: data.toUserID
  }
  return request({
    url: '/api/user?action=friend_remove',
    method: 'post',
    data: _data,
  })
}

export const confirmForAddFrined = (data) => {
  const _data = {
    action: 'friend_confirm',
    requester_id: ~~data.fromUserID,
    responder_id: ~~data.toUserID  // responder_email: data.toUserEmail
  }
  return request({
    url: '/api/user',
    method: 'post',
    data: _data,
  })
}

export const rejectForAddFrined = (data) => {
  const _data = {
    action: 'friend_reject',
    requester_id: ~~data.fromUserID,
    responder_id: ~~data.toUserID
  }
  return request({
    url: '/api/user',
    method: 'post',
    data: _data,
  })
}

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
    action: 'friend_reject',
    user_id: ~~data.fromUserID,
    total_shared_num: ~~data.recoveryNum,
    threshold: 1,
    friends: data.selectedFriendsList
  }
  return request({
    url: '/api/recovery',
    method: 'post',
    data: _data,
  })
}
