/**
 * Created by shmily on 2017/2/16.
 */

app.controller('Bill_recordController',['$scope','$http','$timeout','SAlert',function ($scope,$http,$timeout,SAlert) {
    $scope.$on('$viewContentLoaded',   function(event, viewConfig) {
        $(function(){
            $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});
            $("#search_start_time").val(getOffsetFormatDate("", -30));
            $("#search_end_time").val(getNowFormatDate());

            set_navigator();
            $timeout(function () {
                init_departments();
            });
            init_users();
            init_record_table("");

            change_department_select();
            change_user_select();
            click_search_record();
            change_type_select();
            click_close_button();
            change_start_time();
            change_end_time();
        });

        var record_type = {
            "server": "云主机",
            "volume": "云硬盘"
        };

        function set_navigator(){
            if ($("#consume_manage").hasClass('active')) {
                var lis = $('#demo1').children("li");
                lis.each(function () {
                    $(this).addClass('active');
                    $(this).removeClass('dhbg');
                });

                $("#consume_manage").removeClass('active');
                $("#consume_manage").addClass('dhbg');
            }
            $(".navbar-words").html("计费管理 > 消费记录");
        }

        function record_table_pagination(data){
            var page_num=11;
            var data_length=data.length;
            if(!data_length || data_length<=page_num){
                render_record_table(data);
                $("#record_pagination").hide();
                return;
            }
            $("#record_pagination").show();
            //加入分页的绑定
            $("#record_pagination").pagination(data_length, {
                callback : pageselectCallback,
                prev_text : '< 上一页',
                next_text: '下一页 >',
                items_per_page : page_num,
                num_display_entries : 4,
                current_page : 0,
                num_edge_entries : 1
            });
            //这个事件是在翻页时候用的
            function pageselectCallback(page_id, jq) {
                var start = page_id*page_num;
                var end = start + page_num;
                if(end>data_length){
                    end = start + data_length%page_num;
                }
                render_record_table(data.slice(start, end));
            }
        }

        function record_detail_table_pagination(data){
            var page_num=10;
            var data_length=data.length;
            if(!data_length || data_length<=page_num){
                render_record_detail(data);
                $("#record_detail_pagination").hide();
                return;
            }
            $("#record_detail_pagination").show();
            //加入分页的绑定
            $("#record_detail_pagination").pagination(data_length, {
                callback : pageselectCallback,
                prev_text : '< 上一页',
                next_text: '下一页 >',
                items_per_page : page_num,
                num_display_entries : 4,
                current_page : 0,
                num_edge_entries : 1
            });
            //这个事件是在翻页时候用的
            function pageselectCallback(page_id, jq) {
                var start = page_id*page_num;
                var end = start + page_num;
                if(end>data_length){
                    end = start + data_length%page_num;
                }
                render_record_detail(data.slice(start, end));
            }
        }

        function click_record_table_tr(){
            $("#record_table .animate_name").click(function(){
                var this_id = $(this).parent().parent().attr("id");
                $(".detail_div").stop(true).animate({"right":"-1000px"},function(){

                }).animate({"right":"0px"});
                get_record_detail(this_id);
            });

            $("#record_table tbody tr").click(function(e){
                if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){
                    $(this).removeClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                }
                else {
                    var checked_trs = $("#record_table tbody tr");
                    checked_trs.each(function(){
                        $(this).removeClass("table_body_tr_change");
                        $(this).children("td").eq(0).find("input").prop("checked", false);
                    });
                    $(this).addClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", true);
                }

            });

        }

        function get_record_detail(record_id){
            //console.log(record_id);

            $.ajax({
                type: "GET",
                url: project_url + "/bills/"+record_id,
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    //console.log(data);
                    record_detail_table_pagination(data.bills_detail);
                },
                error: function(e){
                    SAlert.showError(e);
                }
            });
        }

        function render_record_detail(data){
            var tbody = $("#record_detail_tbody");
            clear_table_body("#record_detail_tbody");
            if (data.length){
                for(var i= 0,l=data.length;i<l;i++){
                    var table_tr = $("<tr></tr>");

                    var table_body =
                        '<td >'+data[i].begin+'</td>' +
                        '<td>'+data[i].end+'</td>'+
                        '<td>'+parseFloat(data[i].cost)+'</td>'+
                        '<td>'+parseFloat(data[i].price)+'</td>';

                    table_tr.append(table_body);
                    tbody.append(table_tr);
                }
            }
            else{
                var table_tr = '<tr><td colspan="4">没有数据</td></tr>';
                tbody.append(table_tr);
            }
        }

        function init_departments(){
            if($("#department_select").length>0){
                $.ajax({
                type: "GET",
                url: project_url + "/departments",
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    //console.log(data.departments);
                    render_department(data.departments);
                },
                error: function(e){
                    //console.log(e);
                    SAlert.showError(e);
                }
            });
            }

        }

        function init_users(){
            if($("#user_select").length>0){
                $.ajax({
                type: "GET",
                url: project_url + "/users",
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    if(data.length){
                        console.log(data);
                        render_user(data);
                    }

                },
                error: function(e){
                    SAlert.showError(e);
                }
            });
            }
        }

        function render_user(data){
            $("#user_select").empty();
            var default_option = '<option selected="selected" value="">所有用户</option>';
            $("#user_select").append(default_option);

            for(var i=0,l=data.length;i<l;i++){
                var user_option = $("<option></option>");
                user_option.attr("value",data[i].id);
                user_option.text(data[i].user_name);
                $("#user_select").append(user_option);
            }

        }

        function getOffsetFormatDate(beginDate, offset) {
            if(beginDate){
                var date =new Date(new Date(beginDate)-0+offset*86400000)
            }else{
                var date = new Date(new Date()-0+offset*86400000);
            }

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

        function render_department(data){

            $("#department_select").empty();
            var default_option = '<option selected="selected" value="">所有部门</option>';
            $("#department_select").append(default_option);

            for(var i=0,l=data.length;i<l;i++){
                var department_option = $("<option></option>");
                department_option.attr("value",data[i].id);
                department_option.text(data[i].name);
                $("#department_select").append(department_option);
            }

        }

        function init_record_table(type){
            var department_id = $("#department_select").val();
            if(!department_id){
                department_id = "";
            }
            var user_id = $("#user_select").val();
            if(!user_id){
                user_id = "";
            }
            var start = $("#search_start_time").val();
            if (start){
                start += "T00:00:00";
            }
            var end = $("#search_end_time").val();
            if(end){
                end = getOffsetFormatDate(end, 1) + "T00:00:00";
            }
            var url = project_url + "/bills"+"?department_id="+department_id+"&user_id="+user_id+"&start="+start+"&end="+end;
            var record_url = project_url + "/export/record/"+"?department_id="+department_id+"&user_id="+user_id+"&start="+start+"&end="+end+"&type="+type;
            $("#export_record").attr("href", record_url);
            //console.log(url);
            $.ajax({
                type: "GET",
                url: url,
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    //console.log(data);
                    if(type){
                       record_table_pagination(data[type+"_bills"]);
                    }else{
                        var all_bills = data['server_bills'].concat(data['volume_bills']);
                        record_table_pagination(all_bills);
                    }

                },
                error: function(e){
                    //console.log(e);
                    SAlert.showError(e);
                }
            });

        }

        function render_record_table(data){
            var tbody = $("#record_tbody");
            clear_table_body("#record_tbody");
            if (data.length){
                for(var i= 0,l=data.length;i<l;i++){
                    var table_tr = $("<tr></tr>");
                    table_tr.attr("id", data[i].resource_id);

                    var resource_type = "";
                    if(data[i].resource){
                        resource_type = record_type[data[i].resource];
                    }

                    var name = "";
                    if (data[i].resource_name){
                        name = data[i].resource_name;
                    }else{
                        name = (data[i].resource_id).substr(0,11);
                    }

                    var table_body = '<td><input type="checkbox"/></td>'+
                        '<td title='+data[i].resource_name+'>'+'<a class="animate_name">'+name+'</a></td>' +
                        '<td>'+parseFloat(data[i].cost)+'</td>'+
                        '<td>'+resource_type+'</td>';

                    table_tr.append(table_body);
                    tbody.append(table_tr);
                }
                click_record_table_tr();
            }
            else{
                var table_tr = '<tr><td colspan="4">没有数据</td></tr>';
                tbody.append(table_tr);
            }
        }

        function change_department_select(){
            $("#department_select").change(function(){
                //console.log($("#department_select").val());
                init_record_table($("#type_select").val());
            });
        }

        function change_user_select(){
            $("#user_select").change(function(){
                init_record_table($("#type_select").val());
            });
        }

        function change_type_select(){
            $("#type_select").change(function(){
                init_record_table($("#type_select").val());
            });
        }

        function change_start_time(){
            $("#search_start_time").change(function(){
                init_record_table($("#type_select").val());
            });
        }

        function change_end_time(){
            $("#search_end_time").change(function(){
                init_record_table($("#type_select").val());
            });
        }

        function clear_table_body(tbody_id){
            $(tbody_id).html("");
        }

        function click_search_record(){
            $("#search_record").click(function(){
                init_record_table($("#type_select").val());

                clear_detail_data();
            });

        }

        function click_close_button(){
            $("#btn_close_detail").click(function(){clear_detail_data()});
        }

        function clear_detail_data(){
            $(".detail_div").animate({"right":"-1000px"});
        }

        function getNowFormatDate() {
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

        /*function getOffsetFormatDate(offset) {
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
        */

    });
}]);
