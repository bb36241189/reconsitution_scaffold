/**
 * Created by shmily on 2017/3/27.
 */
app.controller('OperationController',['$scope','PermitStatus',function ($scope,PermitStatus) {
    /**
 * Created by A on 2016/3/10.
 */
function get_Operation_list(){
        var data = {start:$("#search_start_time").val()+"T00:00:00",end:$("#search_end_time").val()+"T23:59:59"};
        if($("#search_start_time").val()>$("#search_end_time").val()){
            alert("结束时间必须晚于开始时间");
            return;
        }
    if($("#search_user").val()!="")
        {
            data.user_id = $("#search_user").val();
        }
        $.ajax({
            type: "GET",
            url: project_url + "/operation_log",
            data:data,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                //console.log(JSON.stringify(data));
                render_operation_list(data.operation_logs);
            },
            error:function(e){
                alert_error(e);
            }
        });
    }

    $(function(){
        $scope.$on('$viewContentLoaded', function(){
            $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});
            $("#refresh_operation").click(function(){
                get_Operation_list();
            });
            $('#search_start_time').val(getYesterdayFormatDate(-1));
            $('#search_end_time').val(getNowFormatDate());
            $('#form_datetime').datetimepicker('update');
            if ( $("#search_user").length > 0 ) {
                initSearchUser();
            }

            get_Operation_list();
        });
    });

    function initSearchUser(){
        $.ajax({
            type: "GET",
            url: project_url + "/users",
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                //console.log(JSON.stringify(data));
                renderUsers(data);
            },
            error:function(e){
                alert_error(e);
            }
        });
    }

    function renderUsers(data){
        $("#search_user").append("<option value=''>所有用户</option>");
        for(var i=0;i<data.length;i++){
            $("#search_user").append("<option value='" + data[i].id + "'>" + data[i].user_name + "</option>")
        }
    }

    function render_operation_list(data){
        var $operation = $("#operation_list");
        $operation.html("");
        if(data.length){
            for(var i=0;i<data.length;i++){
                var $table_tr = $("<tr></tr>");
                var _status="";
                if(data[i].is_success=="1"){
                    //_status="<span class='label label-success'>成功</span>";
                    _status="<img src='" + project_url + "/static/images/success-small.png'/>";
                }
                else{
                    //_status="<span class='label label-danger'>失败</span>";
                    _status="<img src='" + project_url + "/static/images/error-small.png'/>";
                }
                var table_body =
                    '<td><input type="checkbox"></td>' +
                    '<td>' + data[i].time + '</td>' +
                    '<td>' + data[i].action + '</td>' +
                    '<td>' + data[i].resource_type + '</td>' +
                    '<td>' + data[i].resource_name + '</td>' +
                    '<td>' + _status + '</td>';

                $table_tr.append(table_body);
                $operation.append($table_tr);
            }
        }
        else{
            var table_tr = '<tr><td colspan="6">没有日志</td></tr>';
            $operation.append(table_tr);
        }
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
        console.log("Object is:", o)
        return o;
    }

    function display_message(data){
        $("#alert_message").show();
        $("#alert_message_text").html(data);
        $("#alert_message").delay(3000).hide(0);
    }

    function alert_error(e){
        if(e.status==401){
            display_message("登录超时")
            location.href = project_url + "/logout?next=" + project_url + "/app/image";
        }else{
            display_message("服务端出错")
        }
    }

    function getYesterdayFormatDate(offset) {
        var date = new Date(new Date()-0+offset*86400000);
        var seperator1 = "-";
        var seperator2 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
                //+ " " + date.getHours() + seperator2 + date.getMinutes()
                //+ seperator2 + date.getSeconds();
        return currentdate;
    }

    function getNowFormatDate(offset) {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
                //+ " " + date.getHours() + seperator2 + date.getMinutes()
                //+ seperator2 + date.getSeconds();
        return currentdate;
    }
}]);