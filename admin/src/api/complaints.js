import request from '@/utils/request'

export const getComplaints = (params) => {
  return request({
    url: '/complaints',
    method: 'get',
    params
  })
}

export const getComplaintDetail = (id) => {
  return request({
    url: `/complaints/${id}`,
    method: 'get'
  })
}

export const createComplaint = (data) => {
  return request({
    url: '/complaints',
    method: 'post',
    data
  })
}

export const replyComplaint = (id, reply) => {
  return request({
    url: `/complaints/${id}/reply`,
    method: 'put',
    data: { reply }
  })
}
