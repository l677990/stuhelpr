var express= require('express');//express框架
var session=require('express-session');//session

var app = express();

var fs = require('express');//文件操作

var query=require('./mysql');//自定义查询

var db=require('./method'); //数据查询

var template = require('art-template');//模版

var bodyParser= require('body-parser');//post查询

var router=require('./router');//；路由

app.engine('html',require('express-art-template'));//模版中间件

// app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json({limit: '1mb'}));//post中间件

app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));//为了传输base64图片 最大为1m

app.use(session({secret: 'keyboard cat',resave: false,saveUninitialized: true}))//session 更安全

app.use("/public/",express.static('./public'));

app.use(router);//所有中间件 在路由上面

//中间件



app.listen(3000,function(){
	console.log("启动");
})