$(function(){

$('.mui-btn-outlined').on("change",function(){
     lrz($('#file')[0].files[0])
        .then(function (rst) {
            $('.img').html(`<img src="${rst.base64}" alt="">`);
        });
});

$('#sh_btn').on("click",function(){
      var obj = $('form').serialize();
      obj=obj.replace(/%0D%0A/g,"\\r");//转换换行

if($('#file')[0].files[0]==undefined){
    return mui.alert("请选择图片");
}
    lrz($('#file')[0].files[0])
        .then(function (rst) {
            // 处理成功会执行
            $('#file')[0].files[0]='';

            $('#clon').show();//显示遮罩层
            $.ajax({
                url: '/upload',
                type: 'POST',
                data:"base64="+encodeURIComponent(rst.base64)+"&"+obj,
                success:function(data){
                    
                    if(data.err_code==0){
                    
                    mui.alert("传输失败");
                    $('#clon').hide();
                     }else if(data.err_code==51){
                      mui.alert("请填写完整");
                    $('#clon').hide();
                    }
                    else if(data.err_code==1){
                    mui.alert("上传成功",function(){
                        location.href="/claim";
                    });
                    }
                    else{
                    $('#clon').hide();
                    mui.alert("服务器繁忙");
                    }
                }
            }).catch(function(err) {
                 mui.alert(err);
        })
    })
});
})