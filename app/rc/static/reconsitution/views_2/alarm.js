/**
 * Created by shmily on 2017/2/15.
 */

app.controller('AlarmController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function(){
        initInputs();
        get_Event_list();
        get_Volume_list();
        get_vm_Event_list();
        set_navigator();
        set_tab();
    });

    function set_tab(){

        if(GetQueryString("tab")=="1"){
            $("#title_tabs li").removeClass("active");
            $("#title_tabs").find("li").eq(0).addClass("active");
            $("#tab2").removeClass("active");
            $("#tab3").removeClass("active");
            $("#tab1").addClass("active");
        }
        if(GetQueryString("tab")=="2"){
            $("#title_tabs li").removeClass("active");
            $("#title_tabs").find("li").eq(1).addClass("active");
            $("#tab1").removeClass("active");
            $("#tab3").removeClass("active");
            $("#tab2").addClass("active");
        }
        if(GetQueryString("tab")=="3"){
            $("#title_tabs li").removeClass("active");
            $("#title_tabs").find("li").eq(2).addClass("active");
            $("#tab1").removeClass("active");
            $("#tab2").removeClass("active");
            $("#tab3").addClass("active");
        }
    }

    function set_navigator(){
        if ($("#manage").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            $("#manage").removeClass('active');
            $("#manage").addClass('dhbg');
        }
        $(".navbar-words").html("管理 > 告警");
    }


    function initInputs(){
        $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});
        $("#refresh_event").click(function(){
            $("#event_list").html("<tr><td colspan='7'>加载中...</td></tr>");
            get_Event_list();
        });
        $("#vm_refresh_event").click(function(){
            $("#vm_event_list").html("<tr><td colspan='7'>加载中...</td></tr>");
            get_vm_Event_list();
        });
        $('#search_start_time').val(getYesterdayFormatDate(-1));
        $('#search_end_time').val(getNowFormatDate());
        $('#vm_start_time').val(getYesterdayFormatDate(-1));
        $('#vm_end_time').val(getNowFormatDate());
        $('#form_datetime').datetimepicker('update');
    }

    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
        var context = "";
        if (r != null)
             context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    }

    Date.prototype.Format = function(fmt)
    { //author: meizz
      var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
      };
      if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
      for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      return fmt;
    }

    function getLocalTime(nS) {
        return new Date(parseInt(nS) * 1000).Format("yyyy-MM-dd hh:mm:ss");
    }

    function getTimeLength(nS){
        var s = 1000000000;
        var m = 60*s;
        var h = 60*m;
        var d = 24*h;
        var M = 30*d;

        var c = 0;
        var ss = nS;
        var r = "";
    /*
        if(c<2){
            var _M = parseInt(ss/M)>0?(parseInt(ss/M) + "月"):("");
            if(_M!=""){
                c++;
                ss = ss%M;
                r += _M;
            }
        }
        */
        if(c<2){
            var _d = parseInt(ss/d)>0?(parseInt(ss/d) + "天"):("");
            if(_d!=""){
                c++;
                ss = ss%d;
                r += _d;
            }
        }
        if(c<2){
            var _h = parseInt(ss/h)>0?(parseInt(ss/h) + "时"):("");
            if(_h!=""){
                c++;
                ss = ss%h;
                r += _h;
            }
        }
        if(c<2){
            var _m = parseInt(ss/m)>0?(parseInt(ss/m) + "分"):("");
            if(_m!=""){
                c++;
                ss = ss%m;
                r += _m;
            }
        }
        if(c<2){
            var _s = parseInt(ss/s)>0?(parseInt(ss/s) + "秒"):("");
            if(_s!=""){
                c++;
                ss = ss%s;
                r += _s;
            }
        }
        return r;
    }


        function get_Event_list(){
            var path = project_url + "/events";
            var data = {start:$("#search_start_time").val()+"T00:00:00",end:$("#search_end_time").val()+"T23:59:59"};
            if($("#search_start_time").val()>$("#search_end_time").val()){
                alert("结束时间必须晚于开始时间");
                return;
            }
            $.ajax({
                type: "GET",
                url: path,
                data:data,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    //console.log(JSON.stringify(data));
                    render_event_list(data);
                },
                error:function(e){
                    SAlert.showError(e);
                }
            });
        }

        function render_event_list(data){
            var $event = $("#event_list");
            $event.html("");
            if(data.length){
                for(var i=0;i<data.length;i++){
                    var $table_tr = $("<tr></tr>");
                    var _status="";
                    if(data[i].value=="0"){
                        //_status="<span class='label label-success'>成功</span>";
                        _status="<img src='" + project_url + "/static/images/success-small.png'/>";
                    }
                    else{
                        //_status="<span class='label label-danger'>失败</span>";
                        _status="<img src='" + project_url + "/static/images/error-small.png'/>";
                    }
                    var _priority="";
                    if(parseInt(data[i].priority)<=3){
                        _priority="<span class='label label-warning'>一般</span>";
                    }
                    else{
                        if(parseInt(data[i].priority)==4){
                            _priority="<span class='label label-danger'>严重</span>";
                        }
                        else{
                            _priority="<span class='label label-danger'>灾难</span>";
                        }
                    }

                    var table_body =
                        '<td><input type="checkbox"></td>' +
                        '<td>' + _priority + '</td>' +
                        '<td>' + _status + '</td>' +
                        '<td>' + data[i].name + '</td>' +
                        '<td>' + data[i].description + '</td>' +
                        '<td>' + getLocalTime(data[i].clock) + '</td>' +
                        '<td>' + (data[i].acknowledged=="0"?"否":"是") + '</td>';
                    $table_tr.append(table_body);
                    $event.append($table_tr);
                }


            }
            else{
                var table_tr = '<tr><td colspan="7">没有日志</td></tr>';
            $event.append(table_tr);
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
            //console.log("Object is:", o)
            return o;
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


    ////////
    //存储池


    function get_Volume_list(){
        var path = project_url + "/storage_alarms";
        var data={"pagesize":"100","pageno":"1"};
        $.ajax({
            type: "GET",
            url: path,
            data:data,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                //console.log(JSON.stringify(data));
                render_volume_list(data.results);
            },
            error:function(e){
                SAlert.showError(e);
            }
        });
    }

    function render_volume_list(data){
        var $event = $("#volume_list");
        $event.html("");
        if(data.length){
            for(var i=0;i<data.length;i++){
                var $table_tr = $("<tr></tr>");
                var _priority="";
                if(data[i].severity=="critical"){
                    //_status="<span class='label label-success'>成功</span>";
                    _priority="<span class='label label-danger'>紧急</span>";
                }
                if(data[i].severity=="warning"){
                    //_status="<span class='label label-danger'>失败</span>";
                    _priority="<span class='label label-warning'>重要</span>";
                }
                var _resolved="";
                if(parseInt(data[i].priority)==0){
                    _resolved="<span class='label label-danger'>未修复</span>";
                }
                else{
                     _resolved="<span class='label label-success'>已修复</span>";
                }

                var table_body =
                    '<td><input type="checkbox"></td>' +
                    '<td>' + _priority + '</td>' +
                    '<td>' + _resolved + '</td>' +
                    '<td>' + data[i].object + '</td>' +
                    '<td>' + data[i].indexShow + '</td>' +
                    '<td>' + (data[i].when) + '</td>';
                $table_tr.append(table_body);
                $event.append($table_tr);
            }


        }
        else{
            var table_tr = '<tr><td colspan="7">没有日志</td></tr>';
        $event.append(table_tr);
        }
    }


        function get_vm_Event_list(){
            var path = project_url + "/events";
            var data = {start:$("#vm_start_time").val()+"T00:00:00",end:$("#vm_end_time").val()+"T23:59:59"};
            if($("#vm_start_time").val()>$("#vm_end_time").val()){
                alert("结束时间必须晚于开始时间");
                return;
            }
            data.type = "vm";
            $.ajax({
                type: "GET",
                url: path,
                data:data,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_vm_event_list(data);
                },
                error:function(e){
                    SAlert.showError(e);
                }
            });
        }

        function render_vm_event_list(data){
            var $event = $("#vm_event_list");
            $event.html("");
            if(data.length){
                for(var i=0;i<data.length;i++){
                    var $table_tr = $("<tr></tr>");
                    var _status="";
                    if(data[i].value=="0"){
                        //_status="<span class='label label-success'>成功</span>";
                        _status="<img src='" + project_url + "/static/images/success-small.png'/>";
                    }
                    else{
                        //_status="<span class='label label-danger'>失败</span>";
                        _status="<img src='" + project_url + "/static/images/error-small.png'/>";
                    }
                    var _priority="";
                    if(parseInt(data[i].priority)<=3){
                        _priority="<span class='label label-warning'>一般</span>";
                    }
                    else{
                        if(parseInt(data[i].priority)==4){
                            _priority="<span class='label label-danger'>严重</span>";
                        }
                        else{
                            _priority="<span class='label label-danger'>灾难</span>";
                        }
                    }

                    var table_body =
                        '<td><input type="checkbox"></td>' +
                        '<td>' + _priority + '</td>' +
                        '<td>' + _status + '</td>' +
                        '<td>' + data[i].name + '</td>' +
                        '<td>' + data[i].description + '</td>' +
                        '<td>' + getLocalTime(data[i].clock) + '</td>' +
                        '<td>' + (data[i].acknowledged=="0"?"否":"是") + '</td>';
                    $table_tr.append(table_body);
                    $event.append($table_tr);
                }


            }
            else{
                var table_tr = '<tr><td colspan="7">没有日志</td></tr>';
            $event.append(table_tr);
            }
        }
}]);



