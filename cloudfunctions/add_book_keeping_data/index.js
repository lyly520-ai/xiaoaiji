// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'textchange-8wsxr',
  traceUser: true,
})

//获取数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event ==> ', event);

  try {

    return await db.collection('book_keeping_data').add({
      data: event
    });

  } catch (e) {

    console.log(e)

  }
}