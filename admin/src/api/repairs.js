import request from '@/utils/request'

export const getRepairs = (params) => {
  return request({
    url: '/repairs',
    method: 'get',
    params
  })
}

export const getRepairDetail = (id) => {
  return request({
    url: `/repairs/${id}`,
    method: 'get'
  })
}

export const createRepair = (data) => {
  return request({
    url: '/repairs',
    method: 'post',
    data
  })
}

export const updateRepair = (id, data) => {
  return request({
    url: `/repairs/${id}`,
    method: 'put',
    data
  })
}
