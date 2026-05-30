import request from '@/utils/request'

export const getActivities = (params) => {
  return request({
    url: '/activities',
    method: 'get',
    params
  })
}

export const getActivityDetail = (id) => {
  return request({
    url: `/activities/${id}`,
    method: 'get'
  })
}

export const createActivity = (data) => {
  return request({
    url: '/activities',
    method: 'post',
    data
  })
}

export const updateActivity = (id, data) => {
  return request({
    url: `/activities/${id}`,
    method: 'put',
    data
  })
}

export const deleteActivity = (id) => {
  return request({
    url: `/activities/${id}`,
    method: 'delete'
  })
}
