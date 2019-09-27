//路由
var url =require('url');
var fs = require('fs');
var express=require("express");
var app = express();
var router= express.Router();//路由
var query=require('./mysql');//自定义查询
var login= require('./isLogin');
var method = require('./method');//渲染方法

// 首页
router.get("/",function(req,res){
	if(req.session.stu==undefined){
		res.render("index.html");
	}else{
		let stu =req.session.stu;//保存session
		let classid =stu.classid;
		
	method.classnotice(classid,req,res);//渲染

	}
});

// 登录页面
router.get("/login",function(req,res){
	res.render("login.html");
});
// 登录验证
router.post("/login",function(req,res){
	var stuInfo=req.body;
	login.islogin(stuInfo,req,res);
});

// 注册页面
router.get("/add",function(req,res){
	query("select classname,classtable from sh_studentclass  ",function(err,rows){
		if(err){
			res.status(200).json({err_code:51});
		}else{
			res.render("reg.html",{
				rows:rows
			});
		}
	})
	
});
// 注册验证
//	err_code:1 成功 //0：失败  //500服务器繁忙  //50 必须要填写完 //密码错误
router.post("/add",function(req,res){
	var stuInfo=req.body;
	var arr=[];
	//验证是否填写，密码判断
	for( var key in stuInfo){
		if(stuInfo[key]==""){
			arr.push(key);
		}
	}
	if(arr.length>0){
	 res.status(200).json({err_code:arr});

	}else if(stuInfo.stuPass!=stuInfo.rPass){
		res.status(200).json({err_code:51});
	}
	else{//判断是不是有这个班级
		query('select classtable from sh_studentclass  ',function(err,rows){
			var classArr=[];
			for( var i=0;i<rows.length;i++){
				classArr.push(rows[i].classtable)
			}
			if (classArr.indexOf(stuInfo.classid)<0) { //用户乱改数据就服务器繁忙
					return  res.status(200).json({
 				 	err_code:500
 				 });
			}else{
				login.isAdd(stuInfo,req,res);//渲染	
			}
		})
	}
});

// 我的
router.get("/user",function(req,res){
	login.isuser(req.session.stu,req,res);//渲染
});

// 校内活动
router.get("/activity",function(req,res){
	method.activity(req,res);//渲染数据
});


//班级活动通知接口

// 历史通知
router.get("/sh_history",function(req,res){
	method.history(req,res);
});


// 失物招领
router.get("/claim",function(req,res){
	method.lost(req,res);
});


// 班费管理
router.get("/sh_classFee",function(req,res){
	//判断是不是生活委员,是就回调
	login.ispost(req,res,function(classid){//有没有全选
		method.bf(classid,req,res); //有就查询
	});
});

//收入 支出接口
router.post("/sh_classFee",function(req,res){
	method.addFee(req,res);

});

//班费接口
router.get("/feeData",function(req,res){
	login.ispost(req,res,function(classid){
		query("select sum(srmoney) as sr,sum(zcmoney) as zc from sh_classfeeinfo WHERE classid='"+classid+"' limit 1",function(err,rows){
			if(err){
				res.status(200).json({err_code:500 });
			}else{
				res.status(200).json({rows});
			}

		})
	});
});
//账单
router.get("/bill",function(req,res){
	login.ispost(req,res,function(classid){
		query("select srmoney,zcmoney,info,time,stuid from sh_classfeeinfo WHERE classid='"+classid+"' ORDER BY time desc  ",function(err,rows){
			if(err){
				res.status(200).json({err_code:500 });
			}else{
				res.render('sh_bill.html',{rows});
			}

		})
	});
});


// 同学电话
router.get("/sh_UserPhone",function(req,res){
	login.ispost(req,res,function(classid){
		method.pinfo(classid,req,res);
	});
});

// 班会通知
router.get("/sh_notice",function(req,res){
	res.render("sh_notice.html");
});


// 发布班会通知
router.post("/sh_notice",function(req,res){
	login.ispost(req,res,function(classid){//其实可以不用加什么classid 的 后面优化
		method.notice(req,res);
	});
	
});

// 失物发布页面
router.get("/claimRelease",function(req,res){
	res.render("claimRelease.html");
});

//发布
router.post("/upload",function(req,res){
	//上传图片
	var data = req.body;//获取到图片
	 method.fileData(data,req,res);//创建文件夹，并保存图片 //保存数据库
});	  	

//注销
router.get("/logout",function(req,res){
	if(req.session.stu==undefined){
		res.redirect('/');
	}else{
		req.session.stu=undefined;
		req.session.ispost=undefined;
    	res.redirect('/');
	}
});


//轮播图超链接

router.get("/act",function(req,res){
	res.render('banneract.html');
});


//浏览量

router.post("/browse",function(req,res){
	method.browse(req,res);
});



// 课程表
router.get("/sh_course",function(req,res){
	res.render("sh_course.html");
});

//查询课表数据接口
router.get("/courseData",function(req,res){
	let stu=req.session.stu;
	if(!req.session.stu){
		return false;
	}
	query("select course from sh_course  where classid='"+stu.classid+"' and week='"+new Date().getDay()+"' limit 1  ",function(err,rows){
		if(err){
			console.log(err);
			return res.status(200).json({err_code:50 });
		}else{
			 res.status(200).json(rows[0]);
		}

	})
});



//课程表提交接口
router.post("/course",function(req,res){
	method.course(req,res);
	
});

router.use('*',function(req,res){
	res.redirect('/');
})
module.exports=router;
