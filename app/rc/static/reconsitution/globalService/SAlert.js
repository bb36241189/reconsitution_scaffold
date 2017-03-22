/**
 * Created by shmily on 2017/2/17.
 */

app.factory('SAlert',[function () {
    var showMessage = function (title,message,status) {
        //$("#alert_message").show();
        //$("#alert_message_text").html(data);
        //$("#alert_message").delay(5000).hide(0);
        swal(title, message, status);
    };

    var confirm = function (title,text,callback) {
        swal({
          title: "确定要"+title,
          text: text,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "是的!",
          closeOnConfirm: true
        },
        callback)
    };
    
    var showError = function (e,fromUrl) {
        var error_info  =  e.responseText?JSON.parse(e.responseText): e;
        if(e.error==null){
            this.showMessage(e.message);
            return;
        }
        if (e.status == 403 || e.error.code == 403){
            this.showMessage("访问权限被禁止，请联系网络提供商进行咨询！")
        }
        if(e.status==401 || e.error.code == 401){
            this.showMessage("登录超时");
        }else{

        }

        //除401都叫服务器端出错
    };

    var alertError = function (title,message) {
        this.showMessage(title,message,'error');
    };
    var alertSuccess = function (message) {
        this.showMessage(message,'','success');
    };
    return {
        showMessage : showMessage,
        showError : showError,
        alertError : alertError,
        alertSuccess : alertSuccess,
        confirm : confirm
    }
}]);