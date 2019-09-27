var mysql = require('mysql');

var pool = mysql.createPool({
  host     : 'wnhjaimee.top',
  user     : 'HJ',
  password : '131011',
  timezone:'Asia/Shanghai',
  database : 'stuhandy'
});



//查询方法
function query(sql,callback){
    pool.getConnection(function(err,connection){
      if(err) {
        return console.log(err);
      } 
        connection.query(sql, function (err,rows) {
            callback(err,rows);
            connection.release();
        })
    })
}//对数据库进行增删改查操作的基础

module.exports=query;
