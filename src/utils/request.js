import axios from 'axios'
import { stringify } from 'qs';
import { getCookie, getCookieFromDocument, getAuthToken } from '@/utils/auth'
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey } from '@/utils/storage';

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

    // for test header
    /* if (getCookieFromDocument('auth_token')) {
      config.headers['Authorization'] = `Bearer ${getCookieFromDocument('auth_token')}`
    } */
    if (getAuthToken('gtoken')) {
      config.headers['Authorization'] = `Bearer ${getAuthToken('gtoken')}`
    }
    // config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExNDU1MDE2Njg5ODA0MTc1MTU3OSIsImVtYWlsIjoiaGliZHVhbkBnbWFpbC5jb20iLCJ2ZXJpZmllZF9lbWFpbCI6dHJ1ZSwibmFtZSI6IlN0ZXBoZW4iLCJnaXZlbl9uYW1lIjoiU3RlcGhlbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHajJxZ2poczV6Qk15VzJ6Y0dUeEpyMG9FSmhiTkVaRmdnWm1xUXhEUT1zOTYtYyIsImxvY2FsZSI6InpoLUNOIiwiaWF0IjoxNjM0NDg3MjQyfQ.dkuRxjKyQNtUb2sZFvJ4RXW59p0D-0dhhYzkOjY4pYE'
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
     if (res.errno&&res.errno !== 0) {
       switch (res.errno) {
         case -1: // need login
          const userId = getFromStorage('gUID')
          const token = getAuthToken('gtoken')q
          const url = `${window.location.origin}?id=${userId}&auth_token=${token}`
          window.location.href=url
          return Promise.reject('error')
         default:
          //  console.log('error', res.message);
          //  return Promise.reject('error')
           return response
       }
       // return Promise.reject('error')
     } else {
       return response
     }
    //  return response
   },
   error => {
     console.log('err' + error) // for debug
     return Promise.reject(error)
   }
 )
 
 export default service
 
