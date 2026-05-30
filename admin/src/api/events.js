import request from '@/utils/request'

export const getEvents = (params) => {
  return request({
    url: '/events',
    method: 'get',
    params
  })
}

export const getEventStats = () => {
  return request({
    url: '/events/stats',
    method: 'get'
  })
}

export const getEventDetail = (id) => {
  return request({
    url: `/events/${id}`,
    method: 'get'
  })
}

export const createEvent = (data) => {
  return request({
    url: '/events',
    method: 'post',
    data
  })
}

export const updateEvent = (id, data) => {
  return request({
    url: `/events/${id}`,
    method: 'put',
    data
  })
}

export const deleteEvent = (id) => {
  return request({
    url: `/events/${id}`,
    method: 'delete'
  })
}
