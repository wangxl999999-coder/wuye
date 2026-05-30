const app = getApp()

Page({
  data: {
    userInfo: null,
    menuList: [
      { icon: 'icon-fee', name: '我的物业费', url: '/pages/fees/fees' },
      { icon: 'icon-repair', name: '我的报修', url: '/pages/repairs/repairs' },
      { icon: 'icon-complaint', name: '我的投诉', url: '/pages/complaints/complaints' },
      { icon: 'icon-notice', name: '物业公告', url: '/pages/announcements/announcements' },
      { icon: 'icon-activity', name: '小区活动', url: '/pages/activities/activities' }
    ]
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
  },

  goToPage(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          app.globalData.token = ''
          app.globalData.userInfo = null
          this.setData({ userInfo: null })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})
