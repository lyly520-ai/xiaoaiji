let wxCharts = require('../../js/wxcharts.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {

    //显示或者隐藏年份、日列表
    dateList: {
      isYear: false,
      isDay: false
    },

    //当前选择年份
    currentSelectYear: '',

    //当前选择月份
    currentSelectMonth: '',

    //当前选择日
    currentSelectDay: '',

    //总年份
    yearData: [],

    //总月份
    monthData: [],

    //总日
    dayData: [],

    //月份的宽度
    width: 80,

    //用于判断生成日
    dateInfo: {
      date31: ['01', '03', '05', '07', '08', '10', '12'],
      date30: ['04', '06', '09', '11']
    },

    //筛选标签数据
    tabData: [
      {
        title: '年收入',
        money: 0,
        isActive: true,
        className: 'sr',
        cls: 'shouru'
      },
      {
        title: '年支出',
        money: 0,
        isActive: false,
        className: 'zc',
        cls: 'zhichu'
      }
    ],

    //屏幕宽度
    screenWidth: 0,

    //是否首次加载
    isFirstLoaded: true,

    //总金额
    total: {
      //收入
      shouru: 0,

      //支出
      zhichu: 0
    },

    //记账数据
    recordDatas: {},

    //是否存在数据
    isHasData: false,


    //按照类型分类数据
    typeDatas: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //A页面携带参数到B页面，B页面可以在onload方法的options获取参数
    //options: 路由参数

    if (this.data.isFirstLoaded) {

      setTimeout(() => {
        this.setData({
          isFirstLoaded: false
        })
      }, 1000)

    }

    this.getReleaseYear();

    //获取屏幕宽度
    let screenWidth = wx.getSystemInfoSync().screenWidth;

    this.setData({
      screenWidth
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady');
  },

  //小程序进入时触发
  onShow: function () {

    if (this.data.isFirstLoaded) {
      console.log('onShow拦截');
      return;
    }

    this.setData({
      yearData: [],
      monthData: [],
      dayData: []
    })

    this.getReleaseYear();

  },

  //获取开始记账的年份
  getReleaseYear: function () {

    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
      name: 'get_release_date',
      success: res => {
        wx.hideLoading();
        // console.log('get_release_date res ==> ', res);

        //记账开始年份
        let startYear = res.result.data[0].date;

        //当前年份
        let currentYear = new Date().getFullYear();

        //总年数
        let years = currentYear - startYear + 1;

        for (let i = 0; i < years; i++) {
          this.data.yearData.unshift({ title: Number(startYear) + i, isSelected: i == years - 1});
        }

        // console.log('this.data.yearData ==> ', this.data.yearData);

        this.setData({
          yearData: this.data.yearData,
          currentSelectYear: currentYear
        })


        //生成月份
        this.generateMonth();

        //按照年份查询记账数据
        this.selectData();

      },
      fail: err => {
        wx.hideLoading();
        console.log('get_release_date err ==> ', err);
      }
    })

  },

  //选择年, 月，日状态
  selectStatus: function (e, dataKey, key) {
  
    let dataset = e.currentTarget.dataset;

    if (dataset.selected) {

      this.data.dateList[key] = false;
      this.setData({
        dateList: this.data.dateList
      })

      return;
    }

    for (let i = 0; i < this.data[dataKey].length; i++) {
      if (this.data[dataKey][i].isSelected) {
        this.data[dataKey][i].isSelected = false;
        break;
      }
    }


    this.data[dataKey][dataset.index].isSelected = true;

    this.data.dateList[key] = false;

    this.setData({
      [dataKey]: this.data[dataKey],

      dateList: this.data.dateList
    })
    
  },

  //选择年份
  selectYear: function (e) {

    this.selectStatus(e, 'yearData', 'isYear');
    
    this.setData({
      currentSelectYear: this.data.yearData[e.currentTarget.dataset.index].title,
      currentSelectMonth: '',
      currentSelectDay: ''
    })
    //根据年份生成月份
    this.generateMonth();

    //按照年查询记账数据
    this.selectData();

  },

  //选择年份生成的月份
  generateMonth: function () {

    this.setData({
      monthData: []
    })

    let date = new Date();

    //获取今年年份
    let currentYear = date.getFullYear();

    //获取选择的年份
    let selectYear = this.data.currentSelectYear;

    let month = 12;

    if (currentYear == selectYear) {
      //获取今天当前的月份
      month = date.getMonth() + 1;
    }

    for (let i = 1; i <= month; i++) {
      this.data.monthData.push({ title: i >= 10 ? i : '0' + i, isSelected: false });
    }

    this.setData({
      monthData: this.data.monthData
    })


  },

  //选择月份
  selectMonth: function (e) {

    this.selectStatus(e, 'monthData', 'isYear');

    this.data.dateList.isDay = false;

    this.setData({
      currentSelectMonth: this.data.monthData[e.currentTarget.dataset.index].title,
      currentSelectDay: '',
      dateList: this.data.dateList
    })

    // console.log('this.data.monthData ==> ', this.data.monthData);

    //选择月份生成日
    this.generateDay();


    //按照年月查询记账数据
    this.selectData();
  },

  //选择月份生成日
  generateDay: function () {

    this.setData({
      dayData: []
    })

    //获取当前选择的年份
    let currentYear = this.data.currentSelectYear;

    // console.log('currentYear ==> ', currentYear);

    //获取当前选择的月份
    let currentMonth = this.data.currentSelectMonth;

    console.log('currentMonth ==> ', currentMonth);


    let date = new Date();

    //获取今年年份
    let year = date.getFullYear();


    //获取今年的月份
    let month = date.getMonth() + 1;

    console.log('month ==> ', month);

    let day = 0;

    //判断年份
    if (currentYear == year && currentMonth == month) {

      //获取当前几号
      day = date.getDate();


    } else {

      //对于2月份，需要判断闰年平年, 闰年：29，平年：28

      //对于其他月份，需要根据dateInfo判断生成

      if (currentMonth == 2) {

        //判断闰年平年
        day = (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ? 29 : 28;

      } else {

        for (let key in this.data.dateInfo) {
          if (this.data.dateInfo[key].indexOf(currentMonth) > -1) {
            day = key.slice(4);
            break;
          }
        }

      }

    }

    for (let i = 1; i <= day; i++) {
      this.data.dayData.push({ title: i >= 10 ? i : '0' + i, isSelected: false });
    }



    this.setData({
      dayData: this.data.dayData
    })

    console.log('this.data.dayData ==> ', this.data.dayData);

  },


  //选择年份,日
  selectDate: function (e) {

    let key = e.currentTarget.dataset.key;

    if (key == 'isYear') {
      this.data.dateList.isDay = false;
    } else if (key == 'isDay') {
      this.data.dateList.isYear = false;
    }

    if (key == 'isDay' && this.data.currentSelectMonth == '') {
      wx.showToast({
        title: '请选择月份',
        icon: 'none',
        duration: 2000
      })

      return;
    }
    
    this.data.dateList[key] = !this.data.dateList[key];

    this.setData({
      dateList: this.data.dateList
    })

    // console.log('selectDate this.data.dateList ==> ', this.data.dateList);
  },

  //选择日
  selectDay: function (e) {
    this.selectStatus(e, 'dayData', 'isDay');

    this.setData({
       currentSelectDay: this.data.dayData[e.currentTarget.dataset.index].title
    })

    //按照年月日查询记账数据
    this.selectData();
  },

  //按照年份 或者 月份 、日 查询记账数据
  selectData() {

    let costType = '';

    //获取收入-支出状态
    for (let i = 0; i < this.data.tabData.length; i++) {
      if (this.data.tabData[i].isActive) {
        costType = this.data.tabData[i].cls;
        break;
      }
    }

    //记录年月日收入、年月日支出
    let title = [];

    let o = {};

    //获取年份
    let year = this.data.currentSelectYear;
    // console.log('year ==> ', year);

    o.start = '';

    o.end = '';

    //判断选择年, 月, 日

    let month = this.data.currentSelectMonth;

    //是否选择月份
    if (month == '') {
      //按年查询记账数据
      o.start = year + '-01-01';
      o.end = year + '-12-31';

      title = ['年收入', '年支出'];

    } else {

      let day = this.data.currentSelectDay;

      console.log('day ==> ', day);

      //选择月份, 但没有选择日

      if (day == '') {

        //判断是否为2月份
        //如果是2月份且为闰年: 2020-02-01 <= date <= 2020-02-29
        //如果是2月份且为平年: 2020-02-01 <= date <= 2020-02-28
        if (month == 2) {
          o.start = year + '-02-01';

          if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            o.end = year + '-02-29';
          } else {
            o.end = year + '-02-28';
          }
        } else {

          o.start = year + '-' + month + '-01';

          let d = '';
          //如果不是2月份, 则需要判断当月是30天，还是31天
          for (let key in this.data.dateInfo) {
            if (this.data.dateInfo[key].indexOf(month)) {
              d = key.slice(4);
              o.end = year + '-' + month + '-' + d;
              break;
            }
          }


        }

        title = ['月收入', '月支出'];


      } else {
        //选择日

        o.count = 1;
        o.date = year + '-' + month + '-' + day;

        title = ['日收入', '日支出'];

      }
      

    }


    console.log('日期参数 o ==> ', o);

    title.forEach((v, i) => {
      this.data.tabData[i].title = v;
    })

    this.setData({
      tabData: this.data.tabData
    })
    

    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
      name: 'get_book_keeping_data',
      data: o,

      success: res => {
        wx.hideLoading();
        console.log('[get_book_keeping_data] res ==> ', res);

        this.setData({
          total: {
            shouru: 0,
            zhichu: 0
          }
        })

        //按收入-支出分类
        let ty = ['shouru', 'zhichu'];

        let tyDatas = {};

        ty.forEach((v, i) => {
          this.data.tabData[i].money = 0;
          tyDatas[v] = [];
          res.result.data.forEach(item => {
            if (v == item.costType) {
              tyDatas[v].push(item);

              this.data.total[v] += Number(item.money);

              this.data.tabData[i].money += Number(item.money);
            }
          })

          this.data.tabData[i].money = this.data.tabData[i].money.toFixed(2);
        })

        // console.log('tyDatas ==> ', tyDatas);

        this.setData({
          recordDatas: tyDatas,
          total: this.data.total,
          tabData: this.data.tabData
        })

        // console.log('this.data.total ==> ', this.data.total);
        // console.log('this.data.tabData ==> ', this.data.tabData);
       


        this.formatPieData(costType);


      },

      fail: err => {
        wx.hideLoading();
        console.log('err [get_book_keeping_data] 云函数调用失败');
      }
    })


  },

  //处理饼图数据
  formatPieData: function (costType) {

    this.setData({
      typeDatas: []
    })

    //记录所有类型
    let types = [];


    console.log('this.data.recordDatas ==> ', this.data.recordDatas);

    //统计数据类型, 按照type分类
    this.data.recordDatas[costType].forEach(v => {

      for (let i = 0; i < types.length; i++) {
        if (types[i].type == v.type) {
          return;
        }
      }

      types.push({ type: v.type, name: v.title, cost: v.cost, costType: v.costType,  icon: v.icon});

    })

    console.log('types ==> ', types);

    //统计所有类型消费金额
    let allCostTypeData = [];

    let num = 0;

    //统计每种类型消费金额
    types.forEach((v, i) => {

      //随机生成一个颜色
      let red = Math.ceil(Math.random() * 255);
      let green = Math.ceil(Math.random() * 255);
      let blue = Math.ceil(Math.random() * 255);

      //每种类型的统计
      let typeData = Object.assign({}, v);


      typeData.color = `rgb(${red},${green},${blue})`;
      typeData.total = 0;
      typeData.count = 0;
      typeData.width = 0;
      typeData.ids = []

      let costTypeData = {
        //消费
        data: 0,
        name: v.name,
        color: `rgb(${red},${green},${blue})`,
        format(value) {
          return ` ${v.name} ` + (value * 100).toFixed(3) + '%  '
        }
      };

      this.data.recordDatas[costType].forEach(item => {
        if (v.type == item.type) {
          costTypeData.data += Number(item.money);
          typeData.total += Number(item.money);
          ++typeData.count;
          typeData.ids.push(item._id);
        }

      })

      if (i == types.length - 1) {
        costTypeData.data = 100 - num;
      } else {
        costTypeData.data = costTypeData.data / this.data.total[costType] * 100;
        num += costTypeData.data;
      }

      allCostTypeData.push(costTypeData);

      typeData.total = typeData.total.toFixed(2);

      typeData.ids = typeData.ids.join('@');

      this.data.typeDatas.push(typeData);

    })

    console.log('allCostTypeData ==> ', allCostTypeData);
    console.log('this.data.typeDatas ==> ', this.data.typeDatas);



    this.setData({
      typeDatas: this.data.typeDatas,
      isHasData: allCostTypeData.length > 0
    })

    if (allCostTypeData.length > 0) {
      this.drawPie(allCostTypeData);
    }


    var query = wx.createSelectorQuery();
    //选择id
    query.select('.ty-progress').boundingClientRect(rect => {
      console.log('rect ==> ', rect);

      this.data.typeDatas.forEach(v => {
        //总金额
        let total = Number(this.data.total[v.costType]);

        //占比
        let percent = Number(v.total) / total;

        v.width = percent * rect.width;
      })

      this.setData({
        typeDatas: this.data.typeDatas
      })

    }).exec();
    
    
  },


  // 绘制饼图
  drawPie: function (series) {
    new wxCharts({
      //canvas元素的id
      canvasId: 'pieCanvas',

      //图表类型, 饼图
      type: 'pie',

      //数据
      series,

      //绘制图形宽度
      width: this.data.screenWidth,

      //绘制图形高度
      height: 300,

      //显示数据百分比
      dataLabel: true
    });
  },

  //切换标签
  toggleTab: function (e) {
    //e: 事件对象
    // console.log('e ==> ', e);

    if (e.currentTarget.dataset.active) {
      console.log('当前已经激活');
      return;
    }

    let tabData = this.data.tabData;

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i].isActive) {
        tabData[i].isActive = false;
        break;
      }
    }

    tabData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      tabData
    })

    //绘制饼图
    this.formatPieData(tabData[e.currentTarget.dataset.index].cls);

  },

  //查询当前类型的记账数据
  selectCurrentTypeData: function (e) {
    // console.log('selectCurrentTypeData e ==> ', e);

    let o = e.currentTarget.dataset;

    let params = '';

    for (let key in o) {
      params += key + '=' + o[key] + '&'
    }

    params = params.slice(0, -1);

    //查看记账详情
    wx.navigateTo({
      url: '../type/type?' + params
    })
  }


})