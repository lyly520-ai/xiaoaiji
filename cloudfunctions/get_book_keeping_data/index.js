// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'textchange-8wsxr',
  traceUser: true,
})

//获取数据库引用
const db = cloud.database()

//操作条件命令
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {

  let o = {
    userInfo: event.userInfo
  }

  //根据指定一个日期查询记账数据
  if (event.count == 1) {
    o.date = event.date

  } else if (event.count != -1) {

    //当月1号 - 当月当号
    // 2020-04-01 <= xxx <= 2020-04-15
    o.date = _.gte(event.start).and(_.lte(event.end))

  }
  
  try {

    return await db.collection('book_keeping_data').where(o).get();

  } catch (e) {

    console.log(e)

  }



}