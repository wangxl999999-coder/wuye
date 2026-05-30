import request from '@/utils/request'

export const getFees = (params) => {
  return request({
    url: '/fees',
    method: 'get',
    params
  })
}

export const getMyFees = () => {
  return request({
    url: '/fees/my-fees',
    method: 'get'
  })
}

export const getFeeDetail = (id) => {
  return request({
    url: `/fees/${id}`,
    method: 'get'
  })
}

export const createFee = (data) => {
  return request({
    url: '/fees',
    method: 'post',
    data
  })
}

export const payFee = (id) => {
  return request({
    url: `/fees/${id}/pay`,
    method: 'put'
  })
}
