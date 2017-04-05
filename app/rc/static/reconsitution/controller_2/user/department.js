/**
 * Created by shmily on 2017/2/15.
 */

app.controller('DepartmentController',['$scope','$http','$q','SAlert','DepartmentService',function ($scope,$http,$q,SAlert,DepartmentService) {
    $(function (){
        set_navigator();
        init_department_table("");

        disabled_button();

        submit_create_department();
        submit_edit_department();
        submit_delete_department();
        click_refresh_department();
        click_delete_department();
        click_edit_department();
        click_create_department();

        keyup_search_department();
        form_check_event();
    });

    function set_navigator(){
        if ($("#infrastructure").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            $("#setting").removeClass('active');
            $("#setting").addClass('dhbg');
        }
        $(".navbar-words").html("配置 > 部门管理");
    }

    //这个事件是在翻页时候用的
    function department_table_pagination(data){
            var data_length=data.length;
            var page_num=10;
            //console.log("length:"+data_length);
            if(data_length<=page_num){
                render_department_table(data);
                $("#department_pagination").hide();
                return;
            }
            $("#department_pagination").show();
            //加入分页的绑定
            $("#department_pagination").pagination(data_length, {
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
                render_department_table(data.slice(start, end));
            }
    }

    function click_department_table_tr(){
        $("#department_table tbody tr").click(function(){
            if($(this).hasClass("table_body_tr_change")){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_rooms = $("#department_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                $(this).addClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", true);

                //console.log($(this).attr("id"));
                init_edit_form($(this).children("td"));
            }
            if (checked_table_tr("#department_table")){
                recover_button();
                if($(this).attr("admin_role") == "1"){
                    disabled_delete_button();
                }
            }
            else{
                disabled_button();
            }
        });
    }

    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        if(checked_tr.length){
            return true;
        }
        else {
            return false;
        }
    }

    function disabled_button(){

        disabled_delete_button();

        $('#edit_department').attr('disabled',"disabled");
        $("#edit_department").addClass("disabled_button");
        $("#edit_department").removeClass("general_button");

    }

    function disabled_delete_button(){
        $('#delete_department').attr('disabled',"disabled");
        $("#delete_department").addClass("disabled_button");
        $("#delete_department").removeClass("danger_button");
    }

    function recover_button(){
        $('#delete_department').removeAttr('disabled');
        $('#delete_department').addClass("danger_button");
        $("#delete_department").removeClass("disabled_button");

        $('#edit_department').removeAttr('disabled');
        $('#edit_department').addClass("general_button");
        $("#edit_department").removeClass("disabled_button");
    }

    function init_department_table(search){
        $.ajax(,PermitStatus);
    }

    function render_department_table(data){
        disabled_button();

        var departments = $("#department_tbody");
        clear_table_body("#department_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                table_tr.attr("tenant_id", data[i].tenant_id);
                table_tr.attr("admin_role", data[i].is_system_admin);

                var table_body = '<td><input type="checkbox"/></td>'+
                    '<td>'+data[i].name+'</td>' +
                    '<td>'+data[i].description+'</td>' +
                    '<td>'+data[i].create_time+ '</td>'+
                    '<td>'+data[i].update_time+ '</td>';

                 table_tr.append(table_body);
                 departments.append(table_tr);
            }
            click_department_table_tr();
        }
        else{
            var table_tr = '<tr><td colspan="5">没有用户</td></tr>';
            departments.append(table_tr);
        }
    }

    function init_edit_form(data){
        $("#edit_department_name").val(data.eq(1).text());
        $("#edit_description").val(data.eq(2).text());
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

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function click_create_department(){
        $("#add_department").click(function(){
            $("#submit_create_department").addClass("form_general_button");
            $("#submit_create_department").removeClass("disabled_button");
            $("#submit_create_department").removeAttr("disabled");

            $("#create_name_div").children(".desc").addClass("hide");
            $("#create_description_div").children(".desc").addClass("hide");
            $("#create_department_name").val("");
            $("#create_description").val("");
        });
    }

    function click_edit_department(){
        $("#edit_department").click(function(){
            $("#submit_edit_department").addClass("form_general_button");
            $("#submit_edit_department").removeClass("disabled_button");
            $("#submit_edit_department").removeAttr("disabled");
        });
    }

    function click_delete_department(){
        $("#delete_department").click(function(){
             $("#submit_delete_department").addClass("form_danger_button");
             $("#submit_delete_department").removeClass("disabled_button");
             $("#submit_delete_department").removeAttr("disabled");
        });
    }

    function submit_create_department(){
        $("#submit_create_department").click(function(){
            var data = getFormObject("#create_department_form");
            //console.log(data);
            if(!check_department_create_form(data)){
                return;
            }
            $.ajax(,PermitStatus);

            $("#submit_create_department").addClass("disabled_button");
            $("#submit_create_department").removeClass("form_general_button");
            $("#submit_create_department").attr("disabled", "disabled");
        });
    }

    function submit_edit_department(){
        $("#submit_edit_department").click(function(){
            var department_name = $("#department_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(1).text();
            var data = getFormObject("#edit_department_form");

            var department_id = $("#department_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");

            if(department_name == data.name){
                display_check_info("#edit_name_div", true, "")
                delete data.name
                if(!check_description_vaild(data.description, "#edit_description_div")){
                    return;
                }
            }else{
                if(!check_department_edit_form(data)){
                    return;
                }
            }
            //console.log(data);
            //var update_data = getFormObject("#edit_department_form");
            $.ajax(,PermitStatus);

            $("#submit_edit_department").addClass("disabled_button");
            $("#submit_edit_department").removeClass("form_general_button");
            $("#submit_edit_department").attr("disabled", "disabled");
        });
    }

    function submit_delete_department(){
        $("#submit_delete_department").click(function(){
        var department_id =  $("#department_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(department_id);
            $.ajax(,PermitStatus);

            $("#submit_delete_department").addClass("disabled_button");
            $("#submit_delete_department").removeClass("form_danger_button");
            $("#submit_delete_department").attr("disabled", "disabled");
        });
    }

    function click_refresh_department(){
        $("#refresh_department").click(function(){
            init_department_table("");
        });
    }

    function check_department_create_form(data){
        var name_check = check_name_vaild(data.name, "#create_name_div");
        var desc_check = check_description_vaild(data.description, "#create_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_department_edit_form(data){
        var name_check = check_edit_name_vaild(data.name, "#edit_name_div");
        var desc_check = check_description_vaild(data.description, "#edit_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function keyup_search_department(){
        $("#search_department_input").keyup(function(){
            //console.log($("#search_user_input").val());
            init_department_table($("#search_department_input").val());
        });
    }

    function form_check_event(){
        $("#create_department_name").blur(function(){
            var input_name = $("#create_department_name").val();
            check_name_vaild(input_name, "#create_name_div");
        });

        $("#create_description").blur(function(){
            var input_name = $("#create_description").val();
            check_description_vaild(input_name, "#create_description_div");
        });

         $("#edit_department_name").blur(function(){
             var department_name = $("#department_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(1).text();
             var input_name = $("#edit_department_name").val();
             if(department_name==input_name){
                 display_check_info("#edit_name_div", true, "")

             }else{
                 check_name_vaild(input_name, "#edit_name_div");
             }

        });

        $("#edit_description").blur(function(){
            var input_name = $("#edit_description").val();
            check_description_vaild(input_name, "#edit_description_div");
        });

        $("#create_department_name").keydown(function(e){
            var keynum = window.event ? e.keyCode : e.which;
            if(keynum==32){
                return false;
            }
        });

        $("#edit_department_name").keydown(function(e){
            var keynum = window.event ? e.keyCode : e.which;
            if(keynum==32){
                return false;
            }
        });
    }

    function display_check_info(check_div, success, message){
        if(success){
            $(check_div +  " .success").removeClass("hide");
            $(check_div + " .error").addClass("hide");
            $(check_div+ " .error_info").addClass("hide");

            return true;
        }else{
            $(check_div + " .success").addClass("hide");
            $(check_div + " .error").removeClass("hide");
            $(check_div + " .error_info").removeClass("hide");
            $(check_div + " .error_info" + " span").html(message);

            return false;
        }
    }

    function check_name_format(name){
        return true;
    }

    function reject(msg){
        console.log(msg);
    }

    function check_name_exist(name){
        var is_exist=false,defer = $q.defer();
        DepartmentService.getDepartments().then(function (data) {
            //console.log(data);
            var departments = data.departments;
            for(var i=0;i<departments.length;i++){
                if(departments[i].name==name){
                    is_exist=true;
                    defer.resolve(is_exist);
                    break;
                }
            }
        }, function (msg) {
            is_exist=true;
            defer.resolve(is_exist);
            reject(msg);
        });
        return defer.promise;
    }

    function check_name_vaild(name, name_div){
        if(name){
            if(name.length>=1 && name.length<=60){
                if(check_name_format(name)){
                    if(check_name_exist(name)){
                        return display_check_info(name_div, false, "名称已经存在,无法使用")
                    }else{
                        return display_check_info(name_div, true, "")
                    }

                }else{
                    return display_check_info(name_div, false, "格式不正确")
                }
            }else{
                return display_check_info(name_div, false, "长度范围为1-60个字符")
            }

        }else{
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_edit_name_vaild(name, name_div){
        if(name){
            if(name.length>=1 && name.length<=60){
                if(check_name_format(name)){
                    if(check_name_exist(name)){
                        return display_check_info(name_div, false, "名称已经存在,无法使用")
                    }else{
                        return display_check_info(name_div, true, "")
                    }
                }else{
                    return display_check_info(name_div, false, "格式不正确")
                }
            }else{
                return display_check_info(name_div, false, "长度范围为1-60个字符")
            }

        }else{
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_description_vaild(desc, desc_div){
        if(desc.length>1000){
            return display_check_info(desc_div, false, "长度范围为0-1000个字符");
        }else{
            return display_check_info(desc_div, true, "");
        }
    }


    /*function SAlert.showError(e){
        if(e.status==401){
            SAlert.showMessage("登录超时")
            location.href = "/logout?next=/app/department";
        }else{
            SAlert.showMessage("服务端出错")
        }
    }
    function SAlert.showError(e){
        var error_info  =  JSON.parse(e.responseText);
        SAlert.showMessage(error_info.error.message)
        if(e.status==401){
            location.href = "/logout?next=/app/department";
        }
    }*/
}]);
app.factory('DepartmentService',['$http','DepartmentUrlSetting',function ($http,DepartmentUrlSetting) {
    var getDepartments = function(){
        return $http.get(DepartmentUrlSetting.getDepartments,{
             headers : {
                 "RC-Token": $.cookie("token_id")
             }
        })
    };
    return {
        getDepartments : getDepartments
    }
}]);

app.factory('DepartmentUrlSetting',[function () {

    return {
        getDepartments : project_url + "/departments"
    }
}]);
