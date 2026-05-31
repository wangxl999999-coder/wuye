const app = getApp()

Page({
  data: {
    fees: [],
    loading: false,
    unpaidAmount: 0,
    unpaidAmountStr: '0.00',
    unpaidCount: 0
  },

  onLoad() {
    this.loadFees()
  },

  async loadFees() {
    this.setData({ loading: true })
    try {
      const res = await app.request('/fees/my-fees')
      const fees = res.fees || []
      const unpaidFees = fees.filter(function(f) {
        return f.status === 'unpaid'
      })
      const unpaidAmount = unpaidFees.reduce(function(sum, f) {
        return sum + f.amount
      }, 0)
      
      const feesWithFormattedAmount = fees.map(function(fee) {
        return {
          ...fee,
          amountStr: fee.amount.toFixed(2)
        }
      })
      
      this.setData({ 
        fees: feesWithFormattedAmount,
        unpaidAmount,
        unpaidAmountStr: unpaidAmount.toFixed(2),
        unpaidCount: unpaidFees.length
      })
    } catch (err) {
      console.error('加载物业费失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async payFee(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认缴费',
      content: '确认缴纳该笔物业费吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request(`/fees/${id}/pay`, 'PUT')
            wx.showToast({
              title: '缴费成功',
              icon: 'success'
            })
            this.loadFees()
          } catch (err) {
            console.error('缴费失败', err)
          }
        }
      }
    })
  },

  getStatusText(status) {
    const texts = {
      unpaid: '待缴费',
      paid: '已缴费'
    }
    return texts[status] || status
  },

  onPullDownRefresh() {
    this.loadFees().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
