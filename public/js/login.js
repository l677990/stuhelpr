$(function(){
  $('.mui-btn-primary').on('tap',function(){
    getData(function(data){
        if(data.err_code==0){
          mui.alert("账号或密码错误");
      }else if(data.err_code==1){
          mui.alert("登录成功",function(){
            location.href="/";
          });
      }else if(data.err_code==51){
        mui.alert("请输入密码和账号");
      }
      else{
        mui.alert("服务器繁忙");
      }
    })
})
   
    function getData(callback){
    var obj = $('form').serialize();
    $.ajax({
    url:"/login",
    data:obj,
    type:"POST",
    success: function (data) {
       callback(data);
    }
  });
  }
})