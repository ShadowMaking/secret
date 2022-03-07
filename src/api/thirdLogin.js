
import request from '@/utils/request';

 export const googleLogin = (data) => {
  return request({
    url: `/api/auth/google/url`,
    method: 'get',
  })
}

// get user publicKey after third login
export const getUserBindingInfoForThirdLogin = (data) => {
  return request({
    url: `/api/auth/google/url`,
    method: 'get',
  })
}

export const metamaskLogin = (data) => {
  const _data = {
    address: data['address'],
  }
  return request({
    url: `/api/auth/metamask`,
    method: 'get',
    params: _data
  })
}

export const metamaskVerify = (data) => {//{signature、email}
  return request({
    url: `/api/auth/metamask`,
    method: 'post',
    data: data,
  })
}

export const metamaskGoogleBind = (data) => {//{fake_email、email}
  const _data = {
    fake_email: data.fake_email,
    email: data.email,
  }
  const userId = data['userId']
  return request({
    url: `/api/user/${userId}/association`,
    method: 'post',
    data: _data,
  })
}