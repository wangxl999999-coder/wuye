const app = getApp()

Page({
  data: {
    complaints: [],
    showForm: false,
    formData: {
      title: '',
      description: '',
      type: 'service'
    },
    selectedTypeName: '服务态度',
    complaintTypes: [
      { value: 'service', label: '服务态度' },
      { value: 'environment', label: '环境卫生' },
      { value: 'security', label: '安保问题' },
      { value: 'facility', label: '设施问题' },
      { value: 'noise', label: '噪音扰民' },
      { value: 'other', label: '其他' }
    ]
  },

  onLoad() {
    this.loadComplaints()
  },

  async loadComplaints() {
    try {
      const res = await app.request('/complaints')
      this.setData({ complaints: res.complaints || [] })
    } catch (err) {
      console.error('加载投诉记录失败', err)
    }
  },

  showFormDialog() {
    this.setData({ 
      showForm: true,
      selectedTypeName: this._getTypeLabel(this.data.formData.type)
    })
  },

  closeForm() {
    this.setData({ 
      showForm: false,
      formData: {
        title: '',
        description: '',
        type: 'service'
      },
      selectedTypeName: '服务态度'
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onTypeChange(e) {
    const selectedType = this.data.complaintTypes[e.detail.value]
    this.setData({
      'formData.type': selectedType.value,
      selectedTypeName: selectedType.label
    })
  },

  async submitComplaint() {
    const { title, description } = this.data.formData
    if (!title.trim()) {
      wx.showToast({
        title: '请输入投诉标题',
        icon: 'none'
      })
      return
    }

    try {
      await app.request('/complaints', 'POST', this.data.formData)
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      this.closeForm()
      this.loadComplaints()
    } catch (err) {
      console.error('提交失败', err)
    }
  },

  getStatusText(status) {
    const texts = {
      pending: '待处理',
      processing: '处理中',
      replied: '已回复',
      closed: '已关闭'
    }
    return texts[status] || status
  },

  _getTypeLabel(typeValue) {
    const found = this.data.complaintTypes.find(function(item) {
      return item.value === typeValue
    })
    return found ? found.label : ''
  },

  getStatusClass(status) {
    const classes = {
      pending: 'tag-warning',
      processing: 'tag-primary',
      replied: 'tag-success',
      closed: 'tag-info'
    }
    return classes[status] || 'tag-info'
  },

  onPullDownRefresh() {
    this.loadComplaints().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
