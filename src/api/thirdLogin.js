
import request from '@/utils/request';

 export const googleLogin = (data) => {
  return request({
    url: `/api/auth/google/url`,
    method: 'get',
  })
}
