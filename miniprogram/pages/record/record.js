
//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //选择日期范围
    dateRange: {
      //开始日期
      start: '',

      //结束日期
      end: ''
    },

    //记账类型
    bookKeepingData: [],

    //标签数据
    tabData: [
      {
        title: '收入',
        type: 'shouru',
        isActive: true
      },
      {
        title: '支出',
        type: 'zhichu',
        isActive: false
      },
    ],

    //账户选择
    accountData: [
      {
        title: '现金',
        type: 'xainjin',
        isActive: true
      },
      {
        title: '微信钱包',
        type: 'wechatqianbao',
        isActive: false
      },
      {
        title: '支付宝',
        type: 'zhifubao',
        isActive: false
      },
      {
        title: '储蓄卡',
        type: 'chuxuka',
        isActive: false
      },
      {
        title: '信用卡',
        type: 'xinyongka',
        isActive: false
      },

    ],

    info: {
      date: '选择记账日期',
      money: '',
      comment: ''
    },

    isAuth: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

   this.setData({
     isAuth: app.globalData.isAuth
   })


    this.setDate();

    this.getBookKeepingType();
    
  },

  //获取用户授权信息
  getUserInfo: function (res) {
    // console.log('res ==> ', res);

    if (res.detial) {
      this.globalData.isAuth = true;
      this.setData({
        isAuth: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  
  //切换标签
  toggleTab: function (e) {
    //e: 事件对象
    // console.log('e ==> ', e);

    if (e.currentTarget.dataset.active) {
      console.log('当前已经激活');
      return;
    }

    let dataName = e.currentTarget.dataset.datas;

    let tabData = this.data[dataName];

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i].isActive) {
        tabData[i].isActive = false;
        break;
      }
    }

    tabData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      [dataName]:tabData
    })

  },

  //选择记账类型
  selectBookKeepingType: function(e) {

    console.log(e);

    let data = e.currentTarget.dataset;

    if (data.selected) {
      return;
    }

    let bookKeepingData = this.data.bookKeepingData;

    for (let i = 0; i < bookKeepingData.length; i++) {
      if (bookKeepingData[i].selected) {
        bookKeepingData[i].selected = false;
        break;
      }
    }

    bookKeepingData[data.index].selected = true;

    this.setData({
      bookKeepingData
    })

    console.log('this.data.bookKeepingData ==> ', this.data.bookKeepingData);

  },

  //设置开始日期结束日期
  setDate() {
    //设置开始日期、结束日期

    //获取当前日期
    let currentDate = new Date().toLocaleDateString().split('/');
    // console.log('currentDate ==> ', currentDate);

    //开始日期
    let start = currentDate[0] - 1 + '-' + currentDate[1] + '-' + currentDate[2];

    //结束日期
    let end = currentDate.join('-');

    //数据响应, 如果不设置，wxml无法实现数据响应
    this.setData({
      dateRange: {
        start,
        end
      }
    })
  },

  //获取记账类型
  getBookKeepingType: function () {
    wx.showLoading({
      title: '加载中',
    })

    // 调用云函数[get_book_keeping], 获取记账类型数据
    wx.cloud.callFunction({

      //云函数名称
      name: 'get_book_keeping',

      //参数
      data: {},

      //请求成功执行
      success: res => {
        wx.hideLoading()
        console.log('[云函数] [get_book_keeping] res ==> ', res);

        res.result.data.forEach(v => {
          v.selected = false;
        })

        this.setData({
          bookKeepingData: res.result.data
        })

      },

      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [get_book_keeping] 调用失败 err ==> ', err);
      }
    })
  },

  //获取输入内容
  getInfo: function (e) {

    console.log(e);

    this.data.info[e.currentTarget.dataset.title] = e.detail.value;

    this.setData({
      info: this.data.info
    })

    console.log(this.data.info);

  },

  //记账
  bookKeeping: function () {

    let data = {};

    //获取收入类型或者支出类型
    for (let i = 0; i < this.data.tabData.length; i++) {
      if (this.data.tabData[i].isActive) {
        data.cost = this.data.tabData[i].title;
        data.costType = this.data.tabData[i].type;
      }
    }
    

    //获取记账类型
    let isSelect = false;
    for (let i = 0; i < this.data.bookKeepingData.length; i++) {
      if (this.data.bookKeepingData[i].selected) {
        data.id = this.data.bookKeepingData[i]._id;
        data.type = this.data.bookKeepingData[i].type;
        data.title = this.data.bookKeepingData[i].title;
        data.icon = this.data.bookKeepingData[i].icon_url;
        isSelect = true;
        break;
      }
    }

    if (!isSelect) {
      //提示选择记账类型
      wx.showToast({
        title: '请选择记账类型',
        icon: 'none',
        duration: 2000,
        mask: true
      })

      return;
    }

    //获账户类型
    for (let i = 0; i < this.data.accountData.length; i++) {
      if (this.data.accountData[i].isActive) {
        data.account = this.data.accountData[i].title;
        data.accountType = this.data.accountData[i].type;
        break;
      }
    }

    //判断日期是否选择
    if (this.data.info.date == '选择记账日期') {
      //提示选择记账类型
      wx.showToast({
        title: '请选择记账日期',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    } else if (this.data.info.money == '') {
      //判断金额是否填写
      //提示选择记账类型
      wx.showToast({
        title: '请填写金额',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }


    for (let key in this.data.info) {
      data[key] =  this.data.info[key];
    }

    wx.showLoading({
      title: '加载中',
    })

    // 调用云函数[get_book_keeping], 添加记账数据
    wx.cloud.callFunction({

      //云函数名称
      name: 'add_book_keeping_data',

      //参数
      data,

      //请求成功执行
      success: res => {
        wx.hideLoading()
        console.log('[云函数] [add_book_keeping_data] res ==> ', res);

      },

      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [add_book_keeping_data] 调用失败 err ==> ', err);
      }
    })


    console.log('data ==> ', data);

  }

})