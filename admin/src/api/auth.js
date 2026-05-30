import request from '@/utils/request'

export const login = (username, password) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { username, password }
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}
