import axios from 'axios'
import { stringify } from 'qs';
import { getCookie } from '@/utils/auth'

const protocol = location.protocol;
export const WEBSITE_BASEURL = protocol + '//rpc.ieigen.com';

axios.defaults.withCredentials = true;

 // create an axios instance
 const service = axios.create({
   baseURL: WEBSITE_BASEURL,
   timeout: 500000000 // request timeout
 })

//  service.defaults.withCredentials = true;
 
 // request interceptor
 service.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (getCookie('login')) {
      config.headers['y-token'] = getCookie('login')
    }
    /* if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      config.data = stringify(config.data); //（key=val&key=val）
    } */
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
 )
 
 // response interceptor
 service.interceptors.response.use(
   // response => response,
   response => {
     const res = response.data
     /* if (res.errno&&res.errno !== 0) {
       switch (res.errno) {
         case 1:
           return Promise.reject('error')
         case 2:
           return response
         default:
           console.log('error', res.message);
           return Promise.reject('error')
       }
       // return Promise.reject('error')
     } else {
       return response
     } */
     return response
   },
   error => {
     console.log('err' + error) // for debug
     return Promise.reject(error)
   }
 )
 
 export default service
 
