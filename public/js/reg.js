$(function(){
  $('.reg-btn2').on("tap",function(){
    getData(function(data){
      if(data.err_code==0){
         mui.alert("学号以注册");
      }else if(data.err_code==1){
          mui.alert("注册成功",function(){
             location.href="/";
          });
      }else if(Array.isArray(data.err_code)){
         mui.alert("请填写完整");
      }else if(data.err_code==51){
        mui.alert("两次密码必须一致");
      }else if(data.err_code==52){
         mui.alert("没这个学号(注意班级选择)");
      }
      else{
        mui.alert("服务器繁忙");
      }
    })
  })
  function getData(callback){
      var obj = $('form').serialize();
    $.ajax({
    url:"/add",
    data:obj,
    type:"POST",
    success: function (data) {
       callback(data);
    }
  });
  }
})