app.controller('loginController',['$scope','$cookies','LoginService','$q', 'PermitStatus',function ($scope,$cookies,LoginService,$q,PermitStatus) {
     $scope.exec = function (funcname) {
        var theArguments = Array.prototype.splice.call(arguments,1,arguments.length);
        eval(funcname+'('+theArguments.join(',')+')');
        //this[funcname].apply(window,theArguments);
    };
    $(document).ready(function (){
        click_clear_user_name();
        click_clear_user_passwd();
        document.onkeyup = function(e){      //onkeyup是javascript的一个事件、当按下某个键弹起 var _key;                                                 //的时触发
                if (e == null) { // ie
                    _key = event.keyCode;
                } else { // firefox              //获取你按下键的keyCode
                    _key = e.which;          //每个键的keyCode是不一样的
                }

                if(_key == 13){   //判断keyCode是否是13，也就是回车键(回车的keyCode是13)
                 //if (validator(document.loginform)){ //这个因该是调用了一个验证函数
                     document.getElementById('login_button').click()    //验证成功触发一个Id为btnLogin的
                    //}                                                                        //按钮的click事件，达到提交表单的目的
                }
        }
    });

    function click_clear_user_name(){
        $("#clear_user_name").click(function(){
            $("#user_name").val("");
        })
    }

    function click_clear_user_passwd(){
        $("#clear_user_passwd").click(function(){
            $("#user_passwd").val("");
        })
    }



    function check(){

        if(!check_user_exist()){
            return;
        }

        var $loginBtn = $("#login_button");
        var $loginBtnStyle = $("#login_button_style");

        $loginBtn.toggle();

        $loginBtnStyle.css({
            display:'block'
        });

        var login_form_data = getFormObject("#login_form");
        console.log(login_form_data);
        //console.log(login_form_data.user_name);
        //console.log(login_form_data.user_passwd);
        if (!check_cookie_enabled()){
            alert("您的浏览器不支持Cookie，登陆需要打开cookie");
            return null;
        }

        //console.log(getUrlParam("next"));
        //return ;
        $.ajax({
                type:"POST",
                url:project_url + "/login",
                data: JSON.stringify(login_form_data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success:function(data){
                    //console.log(data);
                    $scope.$root.user.role = data.role;
                    $cookies.put('role',data.role);
                    get_token(login_form_data).then(function () {
                        var default_url = project_url + "/static/index.html";
                        location.href =default_url;
                    });
                },
                error:function(err){
                    user_passwd_error();
                    //console.log("error");
                    //console.log(err);
                }
        });
        }

    function user_passwd_error(){
        $("#error_user_passwd").removeClass("hidden");
        $("#user_name").val("");
        $("#user_passwd").val("");
        $("#login_button_style").toggle();
        $("#login_button").toggle();

    }

    function getFormObject(form) {
        var o = {};
        var a = $(form).serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }

    function check_cookie_enabled(){
        if(window.navigator.cookieEnabled){
            return true;
        }
        return false;
    }

    function check_user_exist(){

        $("#error_user_passwd").addClass("hidden");

        var userName = $("#user_name").val();

        var userPwd = $("#user_passwd").val();

        if(userName == null || userName == ""){

            $("#alert-pwd").attr("class","alert alert-danger hidden");
            $("#alert-user").attr("class","alert alert-danger");

            return;
        }else if(userPwd == null || userPwd == ""){

            $("#alert-user").attr("class","alert alert-danger hidden");
            $("#alert-pwd").attr("class","alert alert-danger");

            return;
        }else{
            $("#alert-user").attr("class","alert alert-danger hidden");
            $("#alert-pwd").attr("class","alert alert-danger hidden");

            return true;
        }
    }

    function get_token(user_data){
        var defer = $q.defer();
        LoginService.postTokens(angular.extend(user_data,{restful_client : 0})).then(function (ret) {
            console.log(ret.data);
            set_cookie(ret.data.token);
            defer.resolve(ret.data);
        }, function (e) {
            defer.reject(e);
            console.log(e);
        });
        return defer.promise;
    }

    //var timeout=2000; //minutes
    function set_cookie(token){
        //var expiresDate= new Date();
        //expiresDate.setTime(expiresDate.getTime() + (timeout * 60 * 1000));
        //$.cookie("user_id", token.user_id, {expires: expiresDate});

        $.cookie("user_id", token.user_id);
        $.cookie("user_name", token.user_name);
        $.cookie('role',token.role);
        $.cookie("token_id", token.token_id);
        $.cookie("user_id", token.user_id,{ path: '/rc' });
        $.cookie("user_name", token.user_name,{ path: '/rc' });
        $.cookie("token_id", token.token_id,{ path: '/rc' });
    }

    function getUrlParam(name){
        //构造一个含有目标参数的正则表达式对象
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        //匹配目标参数
        var r = window.location.search.substr(1).match(reg);
        //返回参数值
        if (r!=null) return unescape(r[2]);
        return null;
    }
}]);
app.factory('LoginService',['$http','LoginUrls',function ($http,LoginUrls) {
    var postTokens = function (params) {
        return $http.post(LoginUrls.postTokens,angular.toJson(params),{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    return {
        postTokens : postTokens
    }
}]);
app.factory('LoginUrls',[function () {
    return {
        postTokens : project_url + '/tokens'
    }
}]);