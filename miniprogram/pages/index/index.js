const app = getApp()

Page({
  data: {
    userInfo: null,
    banners: [
      { id: 1, title: '欢迎使用智慧物业' },
      { id: 2, title: '便捷生活，从这里开始' }
    ],
    quickActions: [
      { icon: 'icon-fee', name: '物业费', url: '/pages/fees/fees', color: '#409EFF' },
      { icon: 'icon-repair', name: '在线报修', url: '/pages/repairs/repairs', color: '#67C23A' },
      { icon: 'icon-complaint', name: '投诉建议', url: '/pages/complaints/complaints', color: '#E6A23C' },
      { icon: 'icon-notice', name: '物业公告', url: '/pages/announcements/announcements', color: '#F56C6C' },
      { icon: 'icon-activity', name: '小区活动', url: '/pages/activities/activities', color: '#909399' },
      { icon: 'icon-pass', name: '通行证', url: '/pages/passes/passes', color: '#67C23A' }
    ],
    announcements: [],
    events: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  loadData() {
    this.loadAnnouncements()
    this.loadEvents()
  },

  async loadAnnouncements() {
    try {
      const res = await app.request('/announcements?limit=3')
      this.setData({ announcements: res.announcements || [] })
    } catch (err) {
      console.error('加载公告失败', err)
    }
  },

  async loadEvents() {
    try {
      const res = await app.request('/events?limit=5')
      this.setData({ events: res.events || [] })
    } catch (err) {
      console.error('加载事件失败', err)
    }
  },

  goToAction(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    }
  },

  goToAnnouncementDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${id}`
    })
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
