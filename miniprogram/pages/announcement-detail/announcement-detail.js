const app = getApp()

Page({
  data: {
    announcement: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadDetail(id)
    }
  },

  async loadDetail(id) {
    try {
      const res = await app.request(`/announcements/${id}`)
      this.setData({ announcement: res.announcement })
    } catch (err) {
      console.error('加载公告详情失败', err)
    }
  }
})
