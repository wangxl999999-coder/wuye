const app = getApp()

Page({
  data: {
    activities: []
  },

  onLoad() {
    this.loadActivities()
  },

  async loadActivities() {
    try {
      const res = await app.request('/activities')
      this.setData({ activities: res.activities || [] })
    } catch (err) {
      console.error('加载活动失败', err)
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({
      title: '活动详情功能开发中',
      icon: 'none'
    })
  },

  getStatusText(status) {
    const texts = {
      upcoming: '即将开始',
      ongoing: '进行中',
      ended: '已结束'
    }
    return texts[status] || status
  },

  getStatusClass(status) {
    const classes = {
      upcoming: 'tag-primary',
      ongoing: 'tag-success',
      ended: 'tag-info'
    }
    return classes[status] || 'tag-info'
  },

  onPullDownRefresh() {
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
