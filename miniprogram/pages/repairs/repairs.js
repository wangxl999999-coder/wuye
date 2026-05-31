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
    selectedTypeName: '水电维修',
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
        type: 'electrical'
      },
      selectedTypeName: '水电维修'
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onTypeChange(e) {
    const selectedType = this.data.repairTypes[e.detail.value]
    this.setData({
      'formData.type': selectedType.value,
      selectedTypeName: selectedType.label
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

  _getTypeLabel(typeValue) {
    const found = this.data.repairTypes.find(function(item) {
      return item.value === typeValue
    })
    return found ? found.label : ''
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
