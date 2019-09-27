// 判断是否登录方法 注销  注册方法
var express=require("express");

var query=require('./mysql');//自定义查询
var async = require('async');


//所有班级信息

//注册验证



exports.isAdd=function(stuInfo,req,res){
		 query("select count(*) as num  from "+stuInfo.classid+" where 学号= '"+stuInfo.stuId+"'",function(err,rows){//查询到在学号有木有
	 		if(err) {
	 			return res.status(200).json({err_code:500 });
	
	 		};
	 			if(rows[0].num==0){//	console.log(rows[0].num); 没有报错
	 				 res.status(200).json({
	 				 	err_code:52 //学号或班级不对
	 				 });
	 			}else{
 				//没有一样的数据 判断一次
 				 query("select count(*) as num  from sh_stuinfo where stuid= '"+stuInfo.stuId+"'",function(err,rows){
 				 	if(err){
 				 		res.status(200).json({err_code:500 });	
 				 	}else{
 				 		if(rows[0].num==0){//可以注册了
 				 				var sql="insert into sh_stuinfo (stuId,stuPass,stuName,stuSex,stuPhone,chamBer,stuTor,classid) values('"+stuInfo.stuId+"','"+stuInfo.stuPass+"','"+stuInfo.stuName+"','"+stuInfo.sex+"','"+stuInfo.stuPhone+"','"+stuInfo.chamBer+"','"+stuInfo.stutor+"','"+stuInfo.classid+"')";
						query(sql,function(err,rows){
							if(err) {
								return	res.status(200).json({err_code:500});
							}
							if(rows.affectedRows>0){
								req.session.stu={stuid:stuInfo.stuId,classid:stuInfo.classid};
								res.status(200).json({err_code:1});
								}
							});

 				 			}else{
 				 				res.status(200).json({err_code:0});//学号被注册
 				 			}
						

	 				 	}
	 				})
 				}
	 	})
}

//登录验证
exports.islogin=function(stuInfo,req,res){
	if(stuInfo.stuid=="" || stuInfo.stupass=="" ){
		res.status(200).json({err_code:51 });
		return;	
	}
	query("select stuid,stupass,classid from  sh_stuinfo  where stuid='"+stuInfo.stuid+"' and stupass='"+stuInfo.stupass+"' limit 1 ",function(err,rows){
		 if(err){
		 	return res.status(200).json({err_code:500 });	
		 }
			if(rows.length<=0){ //没查到用户
 				 res.status(200).json({
 				 	err_code:0
 				 });
 			}else{ //查到了
 				req.session.stu={stuid:stuInfo.stuid,classid:rows[0].classid};
 				 res.status(200).json({
 				 	err_code:1
 				 });
 			}
	});
}

//我的 判断是否登录 否则去登录页面

exports.isuser=function(stu,req,res){
	if(req.session.stu==undefined){
		res.redirect("/login");
	}else{
		let stu=req.session.stu;
		query("select * from sh_stuinfo where stuid='"+stu.stuid+"' limit 1 ",function(err,rows){
			if(err) {
	 			return	 res.status(200).json({err_code:500 });
	 		}
	 		else{
	 			if(!rows[0]){
	 				return	res.redirect("/logout");
	 			}
	 			if(rows[0].stuPost==1){
	 				req.session.ispost=1;
	 			}
	 			res.render("user.html",rows[0]);//传入信息
		
	 		}

		})
		
	}
}

//判断是不是生活委员


exports.ispost=function(req,res,callback){
	//验证是不是生活委员
	if(req.session.stu){
		var stu=req.session.stu;
		var classid=req.session.stu.classid;
		if(req.session.ispost==1){
			callback(classid);
		}else{
			res.redirect("/");
		}
	}
	else{
		res.redirect("/");
	}
	
}