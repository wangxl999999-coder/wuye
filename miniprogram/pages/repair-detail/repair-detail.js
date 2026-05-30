const app = getApp()

Page({
  data: {
    repair: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadDetail(id)
    }
  },

  async loadDetail(id) {
    try {
      const res = await app.request(`/repairs/${id}`)
      this.setData({ repair: res.repair })
    } catch (err) {
      console.error('加载报修详情失败', err)
    }
  },

  getStatusText(status) {
    const texts = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      closed: '已关闭'
    }
    return texts[status] || status
  },

  getStatusClass(status) {
    const classes = {
      pending: 'tag-warning',
      processing: 'tag-primary',
      completed: 'tag-success',
      closed: 'tag-info'
    }
    return classes[status] || 'tag-info'
  }
})
