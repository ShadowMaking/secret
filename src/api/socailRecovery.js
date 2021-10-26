import request from '@/utils/request';

export const getMyFriendsList = (data) => {
  const userId = data['userId'];
  return request({
    // url: `/api/user?action=friends&user_id=${userId}`,
    url: `/api/user?action=strangers&user_id=${userId}`,
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
  data['from'] && (data['from'] = data['from'].toLocaleLowerCase());
  const _data = {
    requester_id: data.fromUserID,
    responder_id: data.toUserID
  }
  return request({
    url: '/api/user?action=friend_request',
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
    requester_id: data.fromUserID,
    responder_id: data.toUserID
  }
  return request({
    url: '/api/user?action=friend_confirm',
    method: 'post',
    data: _data,
  })
}

export const rejectForAddFrined = (data) => {
  const _data = {
    requester_id: data.fromUserID,
    responder_id: data.toUserID
  }
  return request({
    url: '/api/user?action=friend_reject',
    method: 'post',
    data: _data,
  })
}
