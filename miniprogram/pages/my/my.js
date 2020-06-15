//获取小程序实例
let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuth: false,

    userInfo: {
      avatarUrl: '',
      nickName: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  
  },

  onReady: function () {

    this.setData({
      isAuth: app.globalData.isAuth
    })

    // console.log('this.data.isAuth ==> ', this.data.isAuth);

    if (app.globalData.isAuth) {

      //获取用户信息
      wx.getUserInfo({
        success: res => {

          // console.log('getUserInfo res ==> ', res);

          this.setData({
            userInfo: {
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName
            }
          })

        }
      })

    }

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

  goMybill: function () {
    wx.navigateTo({
      url: '../mybill/mybill'
    })
  }

  
})