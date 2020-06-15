// miniprogram/pages/home/home.js
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

   bookKeepingData: [],

   //是否首次加载
   isFirstLoaded: true,

   //当天日期
   currentDate: '',

   //是否为今天
   isToday: true,

  //当天的消费
   cost: {
     //收入
     shouru: 0,

     //支出
     zhichu: 0
   },


  //当月花费
  costMonth: {
    shouru: 0,
    zhichu: 0,
    jieyu: 0,
    jieyuDecimal: '00'
  }

  },

  /**
   * 生命周期函数--监听页面加载, 类似 vue created
   */
  onLoad: function (options) {
    console.log('onload');

    if (this.data.isFirstLoaded) {

      setTimeout(() => {
        this.setData({
          isFirstLoaded: false
        })
      }, 1000)
      
    }

    
    //设置日期
    this.setDate();

    let date = this.getCurrentDate();

    //获取今天所有记账数据
    this.getTodayBookKeeping(date);

    //获取当月花费
    this.calcMonthCost();

  },

  //页面进入时，触发该函数
  onShow: function () {

    if (this.data.isFirstLoaded) {
      // console.log('onShow拦截');
      return;
    }

    // console.log('执行逻辑');
    //设置日期
    this.setDate();
    
    let date = this.getCurrentDate();

    //获取今天所有记账数据
    this.getTodayBookKeeping(date);

    //获取当月花费
    this.calcMonthCost();
    
  },

  //选择日期
  selectDate(e) {
    //e: 事件对象
    // console.log('e ==> ', e);

    //获取指定日期的所有记账数据
    this.getTodayBookKeeping(e.detail.value);
  },

  //获取今天的所有记账
  getTodayBookKeeping(date) {

    wx.showLoading({
      title: '加载中',
    })

    // 调用云函数[get_book_keeping_data], 获取记账数据
    wx.cloud.callFunction({

      //云函数名称
      name: 'get_book_keeping_data',

      //参数
      data: {
        date,

        //获取当前日期的记账数据
        count: 1
      },

      //请求成功执行
      success: res => {

        this.setData({
          cost: {
            shouru: 0,
            zhichu: 0
          }
        })

        wx.hideLoading()
        console.log('[云函数] [get_book_keeping_data] res ==> ', res);
        res.result.data.forEach(v => {

          //统计当天的收入和支出
          this.data.cost[v.costType] += Number(v.money);

          v.money = Number(v.money).toFixed(2);

        })

        for (let key in this.data.cost) {

          //处理千分位
          this.data.cost[key] = this.data.cost[key].toLocaleString();

          //处理小数
          let index = this.data.cost[key].indexOf('.');

          if (index === -1) {
            this.data.cost[key] += '.00';
          } else {
            let k = this.data.cost[key].split('.');
            if (k[1].length == 1) {
              k[1] += '0'
              this.data.cost[key] = k.join('.');
            }

          }
        }

        let currentDate = date.split('-');

        currentDate = currentDate[1] + '月' + currentDate[2] + '日';

        //判断是否为今天
        let todayDate = this.getCurrentDate();

        this.setData({
          bookKeepingData: res.result.data,
          currentDate,
          isToday: todayDate === date,
          cost: this.data.cost
        })


      },

      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [get_book_keeping_data] 调用失败 err ==> ', err);
      }
    })

  },

  //设置日期
  setDate: function () {
    //设置开始日期、结束日期

    //获取当前日期
    let currentDate = new Date().toLocaleDateString().split('/');
    // console.log('currentDate ==> ', currentDate);

    currentDate[1] = currentDate[1] >= 10 ? currentDate[1] : '0' + currentDate[1];
    currentDate[2] = currentDate[2] >= 10 ? currentDate[2] : '0' + currentDate[2];

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

  //获取档期日期
  getCurrentDate: function () {
    //获取当前查询记账数据的日期
    let currentDate = new Date().toLocaleDateString().split('/');

    currentDate[1] = currentDate[1] >= 10 ? currentDate[1] : '0' + currentDate[1];
    currentDate[2] = currentDate[2] >= 10 ? currentDate[2] : '0' + currentDate[2];

    currentDate = currentDate.join('-');

    return currentDate;
  },

  //统计当月的花费
  calcMonthCost: function() {

    //获取当前日期
    let currentDate = this.getCurrentDate();

    //获取当月1号
    let oneDate = currentDate.split('-');

    oneDate[2] = '01';

    oneDate = oneDate.join('-');

    // console.log('oneDate ==> ', oneDate);
    // console.log('currentDate ==> ', currentDate);

    wx.showLoading({
      title: '加载中',
    })

    // 调用云函数[get_book_keeping_data], 获取记账数据
    wx.cloud.callFunction({

      //云函数名称
      name: 'get_book_keeping_data',

      //参数
      data: {
        start: oneDate,
        end: currentDate
      },

      //请求成功执行
      success: res => {

        this.setData({
          costMonth: {
            jieyu: 0,
            shouru: 0,
            zhichu: 0
          }
        })

        wx.hideLoading()
        // console.log('[云函数] 当月记账数据 [get_book_keeping_data] res ==> ', res);

        //统计当月的消费-收入-支出-结余
        res.result.data.forEach(v => {
          this.data.costMonth[v.costType] += Number(v.money);
        })

        this.data.costMonth.jieyu = this.data.costMonth.shouru - this.data.costMonth.zhichu;

        
        for (let key in this.data.costMonth) {
          //千分位
          this.data.costMonth[key] = this.data.costMonth[key].toLocaleString();

          //处理小数
          let index = this.data.costMonth[key].indexOf('.');

          if (index === -1) {
            this.data.costMonth[key] += '.00'
          } else {
            let k = this.data.costMonth[key].split('.');
            if (k[1].length == 1) {
              k[1] += '0'
              this.data.costMonth[key] = k.join('.');
            }

          }
        }


        //分离结余数据（整数-小数）
        let jieyu = this.data.costMonth.jieyu.split('.');

        this.data.costMonth.jieyu = jieyu[0];
        this.data.costMonth.jieyuDecimal = jieyu[1];

        this.setData({
          costMonth: this.data.costMonth
        })

        // console.log(this.data.costMonth);
        

      },

      //请求失败执行
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] 当月记账数据 [get_book_keeping_data] 调用失败 err ==> ', err);
      }
    })

  }


})