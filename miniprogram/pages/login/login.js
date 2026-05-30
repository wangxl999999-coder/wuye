const app = getApp()

Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async handleLogin() {
    const { username, password } = this.data
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
      return
    }
    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '登录中...' })
      const res = await app.login(username, password)
      wx.hideLoading()
      
      wx.setStorageSync('token', res.token)
      wx.setStorageSync('userInfo', res.user)
      app.globalData.token = res.token
      app.globalData.userInfo = res.user

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } catch (err) {
      wx.hideLoading()
      console.error('登录失败', err)
    }
  }
})
