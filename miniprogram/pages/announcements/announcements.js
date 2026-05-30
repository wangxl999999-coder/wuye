const app = getApp()

Page({
  data: {
    announcements: []
  },

  onLoad() {
    this.loadAnnouncements()
  },

  async loadAnnouncements() {
    try {
      const res = await app.request('/announcements')
      this.setData({ announcements: res.announcements || [] })
    } catch (err) {
      console.error('加载公告失败', err)
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${id}`
    })
  },

  getPriorityClass(priority) {
    const classes = {
      high: 'tag-danger',
      normal: 'tag-primary',
      low: 'tag-info'
    }
    return classes[priority] || 'tag-info'
  },

  getTypeText(type) {
    const texts = {
      notice: '通知',
      activity: '活动',
      emergency: '紧急'
    }
    return texts[type] || type
  },

  onPullDownRefresh() {
    this.loadAnnouncements().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
