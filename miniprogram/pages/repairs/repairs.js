const app = getApp()

Page({
  data: {
    repairs: [],
    showForm: false,
    formData: {
      title: '',
      description: '',
      type: 'electrical'
    },
    repairTypes: [
      { value: 'electrical', label: '水电维修' },
      { value: 'structure', label: '土建维修' },
      { value: 'equipment', label: '设备维修' },
      { value: 'other', label: '其他' }
    ]
  },

  onLoad() {
    this.loadRepairs()
  },

  async loadRepairs() {
    try {
      const res = await app.request('/repairs')
      this.setData({ repairs: res.repairs || [] })
    } catch (err) {
      console.error('加载报修记录失败', err)
    }
  },

  showFormDialog() {
    this.setData({ showForm: true })
  },

  closeForm() {
    this.setData({ 
      showForm: false,
      formData: {
        title: '',
        description: '',
        type: 'electrical'
      }
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onTypeChange(e) {
    this.setData({
      'formData.type': this.data.repairTypes[e.detail.value].value
    })
  },

  async submitRepair() {
    const { title, description } = this.data.formData
    if (!title.trim()) {
      wx.showToast({
        title: '请输入报修标题',
        icon: 'none'
      })
      return
    }

    try {
      await app.request('/repairs', 'POST', this.data.formData)
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      this.closeForm()
      this.loadRepairs()
    } catch (err) {
      console.error('提交失败', err)
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/repair-detail/repair-detail?id=${id}`
    })
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
      closed: 'tag-danger'
    }
    return classes[status] || 'tag-info'
  },

  onPullDownRefresh() {
    this.loadRepairs().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
