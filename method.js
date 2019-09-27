var query=require('./mysql');//自定义查询
var fs = require('fs');

//首页渲染通知

exports.classnotice=function(classid,req,res){
			query("select id from sh_classnotice  where  classid = '"+classid+"' ORDER BY time desc  limit 1",function(err,rows){
			if(err) {
	 			return  res.status(200).json({err_code:50 });
	 		}else{
	 			if(!rows[0]){//没有通知也渲染课表以及页面
	 				let isClass=classid;
	 				return res.render("index.html",{isClass});
	 			}else{
		 			query("update sh_classnotice set browse=browse+1 where id="+rows[0].id+"",function(err,rows){
		 				if(err) {
		 			 		return res.status(200).json({err_code:50 });
		 				}else{
		 					query("select * from sh_classnotice  where  classid = '"+classid+"' ORDER BY time desc  limit 1",function(err,rows){
		 						if(err) {
		 							console.log(err);
		 			 				return res.status(200).json({err_code:50 });
		 						}
		 						rows[0].isClass=classid;//说明登录了
		 						res.render("index.html",rows[0]);
		 						
		 					})
		 				}
		 			})
	 			}
	 		}
		})
}

//上传图片
exports.fileData =function(data,req,res){

	var imgData=data.base64;

	if(data.content.trim()=="" || data.contact.trim()=="" || data.title.trim()==""){
		return	res.status(200).json({err_code:51 });
	}
	 var  base64Data = imgData.replace("data:image/jpeg;base64,", "");//去除文件样式;
	   var dataBuffer = new Buffer(base64Data, 'base64');//二进制流保存图片

	//创建目录
	var  nowDate =new Date(); 
	var fmkdir = nowDate.getFullYear()+""+nowDate.getMonth()+""+nowDate.getDate();
	
	var path=""+__dirname+"/public/upload/"+fmkdir+"";//文件夹
	fs.mkdir(path,function(err){
	   // if (err) {
	   //  // console.log(err);  //警告文件夹存在 不用管
	   // }
	   		var fname= path+"/"+nowDate.getTime()+""+parseInt(Math.random()*1000000)+".jpeg";//文件名
	   		fs.writeFile(fname, dataBuffer, function (err) {
	    		if (err) {
	     			return res.status(200).json({err_code:0 });
	    		} else {
	    			//保存到数据库  fname 文件路径  描述 主题
	    			//处理路径
	    			var length = fname.indexOf("/");
	    			var fpath=fname.substring(length);//文件路径
	    			query("insert into sh_lost (title,content,contact,image,state) values('"+data.title+"','"+data.content+"','"+data.contact+"','"+fpath+"','1')",function(err,rows){
	    				if(err){
	    					return res.status(200).json({err_code:0 });
	    				}
	    				if(rows.affectedRows==1){
	    					res.status(200).json({err_code:1 });
	    				}
	    				
	    			})
	      		
	    		}
	 		})
	})
}

//失物招领
exports.lost=function(req,res){
	query("select * from sh_lost where state=1 ORDER BY time desc",function(err,rows){
		if(err){
			 console.log(err);
	 		return res.status(200).json({err_code:500 });
		}
		res.render("claim.html",{
			rows:rows
		});
	})
}

//校园活动渲染
exports.activity=(req,res)=>{
	query('select id,title,text,time,browse,image,url from sh_activity order by  time desc ',function(err,rows){
		if(err){
			return res.status(200).json({err_code:500 });
		}else{
			res.render("activity.html",{ //渲染
				rows:rows
			});
		}
	});
}


//班费

exports.bf=(classid,req,res)=>{
		query("select money from sh_classfee where classid='"+classid+"' limit 1",function(err,rows){
			if(err){
				return res.status(200).json({err_code:500 });
			}else{
				if(rows[0]==undefined){
					query("insert into sh_classfee (classid,stuid) values('"+classid+"','"+req.session.stu.stuid+"') ",function(err,rows){
						if(err){
							return console.log(err);
						}

					})
				}
				res.render("sh_classFee.html",rows[0]);
			}
		})
}


//电话信息

exports.pinfo=(classid,req,res)=>{
		query("select  学号 as stuId, 姓名 as stuName, 联系电话 as stuPhone from "+classid+"",function(err,rows){
					if(err){
			 			return res.status(200).json({err_code:500 });
					}else{

						res.render("sh_userPhone.html",{
							rows:rows
						});
					}

			})
}
//历史通知
exports.history=(req,res)=>{
	if(req.session.stu==undefined){
		res.redirect('/');
	}else{
		let classid= req.session.stu.classid;
		query("select * from sh_classnotice where classid ='"+classid+"' order by  time desc  limit 10 ",function(err,rows){
			if(err){
				return res.status(200).json({err_code:500 });
			}else{
				res.render("sh_history.html",{
					rows:rows
				});
			}
		})
		
	}
}

//发布通知 

exports.notice=(req,res)=>{
	let classid = req.session.stu.classid;
	let title= req.body.title;
	let content=req.body.text;
	query("insert into sh_classnotice (title,text,classid) values('"+title+"','"+content+"','"+classid+"')",function(err,rows){
		if(err){
			return res.status(200).json({err_code:500 });
		}
		if(rows.affectedRows>0){
			res.status(200).json({err_code:1 });
		}else{
			res.status(200).json({err_code:0 });
		}
	})
}


	//1.判断是不是空的
	//添加到数据库
	
//支出 收入 接口
exports.addFee=function(req,res){
	var data=req.body;
	var stu=req.session.stu;
	if(!stu){
		return res.redirect('/');
	}
	if(data.sr || data.zc){
		 query("insert into sh_classfeeinfo (classid,srmoney,zcmoney,info,stuid) values('"+stu.classid+"','"+data.sr+"','"+data.zc+"','"+data.info+"','"+stu.stuid+"') ",function(err,rows){
		 	if(err){
		 		return console.log(err);
		 	}
		 	if(rows.affectedRows==1){
		 		res.status(200).json({err_code:1 });
		 	}
		 })
	}else{
		res.status(200).json({err_code:0 });
	}
}

//浏览量
exports.browse=function(req,res){
	if(req.body.id.trim()=='' || req.body.id==undefined ){
			res.status(200).json({err_code:50 });
	}else{
		var id = parseInt(req.body.id);
		query("update sh_activity set browse=browse+1 where id='"+id+"' ",function(err,rows){
			if(err){
				return	console.log(err);
			}
			res.status(200).json({err_code:1 });
		})
	}
	

}


exports.course=function(req,res){
	if(!req.body){
		return res.status(200).json({err_code:50 });
	}else{
		let week =req.body.week;
		let stu=req.session.stu;

		query("select count(*) as num from sh_course where classid='"+stu.classid+"' and week = '"+week+"' limit 1  ",function(err,rows){
			if(err){
				console.log(err);
				 return  res.status(200).json({err_code:50 });
			}
			if(rows[0].num==1){//说明有，修改语句
		 		query("update sh_course set course='"+JSON.stringify(req.body)+"' where  classid='"+stu.classid+"' and week = '"+week+"' ",function(err,rows){
					if(err){
						console.log(err);
						return res.status(200).json({err_code:50 });
					}
					if(rows.affectedRows==1){
						res.status(200).json({err_code:2 });
					}

				})

		 	}else{//没有添加
				query("insert into sh_course (week,course,classid)  values ('"+week+"','"+JSON.stringify(req.body)+"','"+stu.classid+"')",function(err,rows){
					if(err){
						console.log(err);
						return res.status(200).json({err_code:50 });
					}
					if(rows.affectedRows==1){
						res.status(200).json({err_code:1 });
					}

				})
		 	}

		})
		
	}
}