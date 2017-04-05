/**
 * Created by shmily on 2017/2/15.
 */

app.controller('UserController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function (){
        set_navigator();
        disabled_button();
        init_user_table("");

        click_create_user();
        click_edit_user();
        click_reset_password();
        click_delete_user();

        submit_create_user();
        submit_edit_user();
        submit_delete_user();
        click_refresh_user();
        submit_reset_passwd();

        form_check_event();

        keyup_search_user();
        click_search_user();
    });

    var user_roles = {
        "super_admin": "系统管理员",
        "dept_admin": "部门管理员",
        "user": "普通用户"
    };

    var common_roles = [
        {"id":"dept_admin", "name":"部门管理员"},
        {"id":"user", "name":"普通用户"}
    ];

    var admin_roles = [
        {"id":"super_admin", "name":"系统管理员" }
    ];

    var roles = [{"id":"super_admin", "name":"系统管理员" },{"id":"dept_admin", "name":"部门管理员" },{"id": "user", "name":"普通用户"}];

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
        $(".navbar-words").html("配置 > 用户管理");
    }

    //这个事件是在翻页时候用的
    function user_table_pagination(data){
            var data_length=data.length;
            var page_num=10;
            //console.log("length:"+data_length);
            if(data_length<=page_num){
                render_user_table(data);
                $("#user_pagination").hide();
                return;
            }
            $("#user_pagination").show();
            //加入分页的绑定
            $("#user_pagination").pagination(data_length, {
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
                render_user_table(data.slice(start, end));
        }
    }

    function click_user_table_tr(){
        $("#user_table tbody tr").click(function(){
            if($(this).hasClass("table_body_tr_change")){

                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);

            }
            else {
                var checked_rooms = $("#user_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);

                //console.log($(this).attr("id"));
                init_edit_form($(this).children("td"));
            }
            if (checked_table_tr("#user_table")){
                recover_button();
            }
            else{
                disabled_button();
            }
        });
    }

    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        //console.log(checked_tr.length);
        if (checked_tr.length) {
            return true;
        }
        else {
            return false;
        }
    }

    function disabled_button(){
        $('#delete_user').attr('disabled',"disabled");
        $("#delete_user").addClass("disabled_button");
        $("#delete_user").removeClass("danger_button");

        $('#edit_user').attr('disabled',"disabled");
        $("#edit_user").addClass("disabled_button");
        $("#edit_user").removeClass("general_button");

        $('#reset_passwd').attr('disabled',"disabled");
        $("#reset_passwd").addClass("disabled_button");
        $("#reset_passwd").removeClass("general_button");

    }

    function recover_button(){
        $('#delete_user').removeAttr('disabled');
        $('#delete_user').addClass("danger_button");
        $("#delete_user").removeClass("disabled_button");

        $('#edit_user').removeAttr('disabled');
        $('#edit_user').addClass("general_button");
        $("#edit_user").removeClass("disabled_button");

        $('#reset_passwd').removeAttr('disabled');
        $('#reset_passwd').addClass("general_button");
        $("#reset_passwd").removeClass("disabled_button");
    }

    function init_user_table(search){
        $.ajax(,PermitStatus);
    }

    function render_user_table(data){
        disabled_button();

        var users = $("#user_tbody");
        clear_table_body("#user_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);

                var user_role = user_roles[data[i].authority];
                /*if(data[i].authority=="user"){
                    user_role = "普通用户";
                }
                else if(data[i].authority=="super_admin"){
                    user_role = "系统管理员";
                }else if(data[i].authority=="dept_admin"){
                    user_role = "部门管理员";
                }*/
                var table_body = '<td><input type="checkbox"/></td>'+
                    '<td>'+data[i].user_name+'</td>' +
                    '<td>'+data[i].email+'</td>' +
                    '<td>'+data[i].department_name+'</td>'+
                    '<td>'+user_role+ '</td>'+
                    '<td>'+data[i].create_time+ '</td>'+
                    '<td>'+data[i].update_time+ '</td>';

                 table_tr.append(table_body);
                 users.append(table_tr);
            }
            click_user_table_tr();

            //set_network_default_checked();
        }
        else{
            var table_tr = '<tr><td colspan="7">没有用户</td></tr>';
            users.append(table_tr);
        }
    }

    function click_create_user(){
        $("#add_user").click(function(){
            clear_create_user_form();
            if( $("#create_department_div").length > 0 ) {
                init_create_department();
                render_roles(roles, "#create_authority");
            }else{
                render_roles(common_roles, "#create_authority");
            }

            $("#submit_create_user").addClass("form_general_button");
            $("#submit_create_user").removeClass("disabled_button");
            $("#submit_create_user").removeAttr("disabled");
        });
    }

    function click_edit_user(){
        $("#edit_user").click(function(){
            if( $("#edit_department_div").length > 0 ) {
                init_edit_department();
                //render_edit_role(roles);
            }else{
                render_edit_role(common_roles);
            }


            $("#submit_edit_user").addClass("form_general_button");
            $("#submit_edit_user").removeClass("disabled_button");
            $("#submit_edit_user").removeAttr("disabled");

            $("#edit_user_name_div").children(".desc").addClass("hide");
            $("#edit_email_div").children(".desc").addClass("hide");

        });
    }

    function click_reset_password(){
        $("#reset_passwd").click(function(){
            $("#submit_edit_user").addClass("form_general_button");
            $("#submit_edit_user").removeClass("disabled_button");
            $("#submit_edit_user").removeAttr("disabled");

            $("#reset_passwd_div").children(".desc").addClass("hide");
            $("#reset_confirm_passwd_div").children(".desc").addClass("hide");
            $("#reset_user_passwd").val("");
            $("#reset_confirm_passwd").val("");
        })
    }

    function click_delete_user(){
        $("#delete_user").click(function(){
            $("#submit_delete_user").addClass("form_danger_button");
            $("#submit_delete_user").removeClass("disabled_button");
            $("#submit_delete_user").removeAttr("disabled");
        })
    }

    function init_create_department(){
        $.ajax(,PermitStatus);
    }

    function render_create_department(data){
        $("#create_department").empty();
        var default_option = '<option selected="selected" value="">请选择部门</option>';
        $("#create_department").append(default_option);

        for(var i=0,l=data.length;i<l;i++){
            var department_option = $("<option></option>");
            //console.log(data[i].id);
            //console.log(data[i].name);
            department_option.attr("value",data[i].id);
            department_option.attr("admin_role",data[i].is_system_admin);
            department_option.text(data[i].name);
            $("#create_department").append(department_option);
        }

    }

    function init_edit_department(){
        $.ajax(,PermitStatus);
    }

    function render_edit_department(data){
        var department_name = $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(3).text();
        $("#edit_department").empty();
        //var default_option = '<option selected="selected" value="">请选择部门</option>';
        //$("#create_department").append(default_option);
        if(data.length){
            for(var i=0,l=data.length;i<l;i++){
                var department_option = $("<option></option>");
                department_option.attr("admin_role",data[i].is_system_admin);
                department_option.attr("value",data[i].id);
                department_option.text(data[i].name);

                if(data[i].name == department_name){
                department_option.attr("selected", "selected");
            }
                $("#edit_department").append(department_option);
            }
        //init_department_roles($("#edit_department  option:selected").attr("admin_role"), "#edit_authority");
            var department_role = $("#edit_department  option:selected").attr("admin_role");
            if(department_role == "1"){
                render_edit_role(admin_roles);
            }else if (department_role ==  "0"){
                render_edit_role(common_roles);
            }
        }


    }

    function render_edit_role(roles){
        $("#edit_authority").empty();
        var user_role = $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(4).text();
        for(var i=0;i<roles.length;i++){
            var role_option = $("<option></option>");
            role_option.attr("value",roles[i].id);
            role_option.text(roles[i].name);
            if(roles[i].name == user_role){
                role_option.attr("selected", "selected");
            }
            $("#edit_authority").append(role_option);
        }
    }

    function submit_create_user(){
        $("#submit_create_user").click(function(){
            var data = getFormObject("#create_user_form");
            //console.log(data);
            //return
            if(!check_user_create_form(data)){
                return;
            }
            delete data.confirm_passwd;
            //console.log(data);
            //return;
            $.ajax(,PermitStatus);

            $("#submit_create_user").addClass("disabled_button");
            $("#submit_create_user").removeClass("form_general_button");
            $("#submit_create_user").attr("disabled", "disabled");

        });
    }

    function submit_edit_user(){
        $("#submit_edit_user").click(function(){
            var data = getFormObject("#edit_user_form");
            if(!check_edit_user_form(data)){
                return;
            }
            data.id =  $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(data);
            //return;
            $.ajax(,PermitStatus);

            $("#submit_edit_user").addClass("disabled_button");
            $("#submit_edit_user").removeClass("form_general_button");
            $("#submit_edit_user").attr("disabled", "disabled");
        });
    }

    function submit_reset_passwd(){
        $("#submit_reset_passwd").click(function(){
            var data = getFormObject("#reset_passwd_form");
            //console.log(data);
            if(!check_user_reset_passwd(data)){
                return;
            }
            data.id =  $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            delete data.confirm_passwd;
            //console.log(data);
            //return;
            $.ajax(,PermitStatus);

            $("#submit_reset_passwd").addClass("disabled_button");
            $("#submit_reset_passwd").removeClass("form_general_button");
            $("#submit_reset_passwd").attr("disabled", "disabled");
        });
    }

    function submit_delete_user(){
        $("#submit_delete_user").click(function(){
            var user_id =  $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(user_id);
            $.ajax(,PermitStatus);

            $("#submit_delete_user").addClass("disabled_button");
            $("#submit_delete_user").removeClass("form_danger_button");
            $("#submit_delete_user").attr("disabled", "disabled");
        });
    }

    function click_refresh_user(){
        $("#refresh_user").click(function(){
            init_user_table("");
        });
    }

    function keyup_search_user(){
        $("#search_user_input").keyup(function(){
            //console.log($("#search_user_input").val());
            init_user_table($("#search_user_input").val());
        });
    }

    function click_search_user(){
        $("#search_user_img").click(function(){
            init_user_table($("#search_user_input").val());
        });
    }

    function init_edit_form(data){
        //console.log(data);
        $("#edit_user_name").val(data.eq(1).text());
        $("#edit_email").val(data.eq(2).text());
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function check_user_exist(key,value){
        var is_exist=true;
        $.ajax(,PermitStatus);
        //console.log(is_exist);
        return is_exist
    }

    function init_department_roles(department_role, jquery_select){
        //console.log(department_role);
        var roles = [];
        if (department_role == "1"){
            roles = admin_roles;
        }else if(department_role == "0"){
            roles = common_roles;
        }
        render_roles(roles, jquery_select);
    }

    function render_roles(roles, jquery_select){
        //console.log(roles);
        $(jquery_select).empty();
        for(var i=0; i<roles.length;i++){
            var role_option = $("<option></option>");

            role_option.attr("value", roles[i].id);
            role_option.text(roles[i].name);
            $(jquery_select).append(role_option);
        }
    }

    function form_check_event(){
        $("#create_user_name").blur(function(){
            var input_user = $("#create_user_name").val();
            //console.log(input_user);
            check_user_name_vaild(input_user);
        });

        $("#create_email").blur(function(){
            var input_email = $("#create_email").val();
            //console.log(input_email.length);
            check_email_vaild(input_email);
        });

        $("#create_user_passwd").blur(function(){
            var input_passwd = $("#create_user_passwd").val();
            //console.log(input_passwd);
            check_passwd_vaild(input_passwd, "#create_passwd_div");
        });

        $("#confirm_passwd").blur(function(){
            var input_passwd = $("#confirm_passwd").val();
            var first_passwd = $("#create_user_passwd").val();
            //console.log(input_passwd);
            //console.log(first_passwd);
            check_confirm_passwd_vaild(input_passwd, first_passwd, "#confirm_passwd_div");
        });

        $("#edit_user_name").blur(function(){
            var input_name = $("#edit_user_name").val();
            check_edit_name_vaild(input_name);
        });

        $("#edit_email").blur(function(){
            var input_email = $("#edit_email").val();
            //console.log(input_email.length);
            check_edit_email_vaild(input_email);
        });

        $("#reset_user_passwd").blur(function(){
            var input_passwd = $("#reset_user_passwd").val();
            //console.log(input_passwd);
            check_passwd_vaild(input_passwd, "#reset_passwd_div");
        });

        $("#reset_confirm_passwd").blur(function(){
            var input_passwd = $("#reset_confirm_passwd").val();
            var first_passwd = $("#reset_user_passwd").val();
            //console.log(input_passwd);
            //console.log(first_passwd);
            check_confirm_passwd_vaild(input_passwd, first_passwd, "#reset_confirm_passwd_div");
        });

        $("#create_department").change(function(){
            check_department_vaild("#create_department", "#create_department_div");
            init_department_roles($("#create_department  option:selected").attr("admin_role"), "#create_authority");
        });

        $("#edit_department").change(function(){
            //check_department_vaild("#edit_department", "#create_department_div");
            init_department_roles($("#edit_department  option:selected").attr("admin_role"), "#edit_authority");
        });

        $("#create_user_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#create_email").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#create_user_passwd").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#confirm_passwd").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_user_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_email").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#reset_passwd_div").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#reset_confirm_passwd_div").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

    }

    function check_user_name_vaild(name){
        //name = name.replace(" ","")
        //console.log(name.length);
        if(name){
            //console.log(name);
            if(check_name_formt(name)){
                if(check_user_exist("user_name",name)){
                    $("#create_name_div .success").addClass("hide");
                    $("#create_name_div .error").removeClass("hide");
                    $("#create_name_div .error_info").removeClass("hide");
                    $("#create_name_div .error_info span").html("用户名已经存在");

                    return false;
                }else{
                    $("#create_name_div .success").removeClass("hide");
                    $("#create_name_div .error").addClass("hide");
                    $("#create_name_div .error_info").addClass("hide");

                    return true;
                }

            }else{
                $("#create_name_div .success").addClass("hide");
                $("#create_name_div .error").removeClass("hide");
                $("#create_name_div .error_info").removeClass("hide");
                $("#create_name_div .error_info span").html("用户名长度为3-60个字符");
                return false;
            }

        }
        else{
            $("#create_name_div .success").addClass("hide");
            $("#create_name_div .error").removeClass("hide");
            $("#create_name_div .error_info").removeClass("hide");
            $("#create_name_div .error_info span").html("用户名不能为空");

            return false;
        }
    }

    function check_name_formt(name){
        if(name.length>=3 && name.length<=60){
            return true;
        }else{
            return false;
        }
    }

    function check_email_vaild(email){
        if(email){
            if(is.email(email)){
                //console.log("format true");
                if(check_user_exist("email",email)){
                    $("#create_email_div .success").addClass("hide");
                    $("#create_email_div .error").removeClass("hide");
                    $("#create_email_div .error_info").removeClass("hide");
                    $("#create_email_div .error_info span").html("邮箱已使用");

                    return false;
                }else{
                    $("#create_email_div .success").removeClass("hide");
                    $("#create_email_div .error").addClass("hide");
                    $("#create_email_div .error_info").addClass("hide");

                    return true;
                }
            }else{
                //console.log("format false");
                $("#create_email_div .success").addClass("hide");
                $("#create_email_div .error").removeClass("hide");
                $("#create_email_div .error_info").removeClass("hide");
                $("#create_email_div .error_info span").html("邮箱格式不正确");

                return false
            }
        }else{
            $("#create_email_div .success").addClass("hide");
            $("#create_email_div .error").removeClass("hide");
            $("#create_email_div .error_info").removeClass("hide");
            $("#create_email_div .error_info span").html("邮箱不能为空");

            return false;
        }
    }

    /*
    function check_email_format(email){

        //console.log(is.email(email));

        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(filter.test(email)){
            return true;
        }
        else{
            return false;
        }
    }*/

    function check_passwd_vaild(passwd, passwd_div){
        if(passwd){
            if(check_passwd_format(passwd)){
                //$("#create_passwd_div .success").removeClass("hide");
                //$("#create_passwd_div .error").addClass("hide");
                //$("#create_passwd_div .error_info").addClass("hide");
                $(passwd_div +  " .success").removeClass("hide");
                $(passwd_div + " .error").addClass("hide");
                $(passwd_div+ " .error_info").addClass("hide");

                return true;
            }else{
               $(passwd_div + " .success").addClass("hide");
               $(passwd_div + " .error").removeClass("hide");
               $(passwd_div + " .error_info").removeClass("hide");
               $(passwd_div + " .error_info" + " span").html("密码长度为4-10位");

                return false;
            }
        }else{
            $(passwd_div + " .success").addClass("hide");
            $(passwd_div + " .error").removeClass("hide");
            $(passwd_div + " .error_info").removeClass("hide");
            $(passwd_div + " .error_info" + " span").html("密码不能为空");

            return false;
        }
    }

    function check_passwd_format(passwd){
        //console.log(passwd.length);
        if(passwd.length>=4 && passwd.length<=10){
            return true
        }else{
            return false
        }
    }

    function check_confirm_passwd_vaild(passwd, first_passwd, passwd_div){
        if(passwd){
            //var first_passwd = $("#create_user_passwd").val();
            if(first_passwd!=passwd){
                //$("#confirm_passwd_div .success").addClass("hide");
                //$("#confirm_passwd_div .error").removeClass("hide");
                //$("#confirm_passwd_div .error_info").removeClass("hide");
                $(passwd_div + " .success").addClass("hide");
                $(passwd_div + " .error").removeClass("hide");
                $(passwd_div + " .error_info").removeClass("hide");
                $(passwd_div + " .error_info" + " span").html("两次密码输入不同");

                return false;
            }else{
                $(passwd_div +  " .success").removeClass("hide");
                $(passwd_div + " .error").addClass("hide");
                $(passwd_div+ " .error_info").addClass("hide");

                return true;
            }
        }else{
            $(passwd_div + " .success").addClass("hide");
            $(passwd_div + " .error").removeClass("hide");
            $(passwd_div + " .error_info").removeClass("hide");
            $(passwd_div + " .error_info" + " span").html("密码不能为空");

            return false;
        }
    }

    function check_user_create_form(data){
        var name_check = check_user_name_vaild(data.user_name);
        var email_check= check_email_vaild(data.email);
        var passwd_check = check_passwd_vaild(data.user_passwd, "#create_passwd_div");
        var confirm_passwd_check = check_confirm_passwd_vaild(data.confirm_passwd, data.user_passwd, "#confirm_passwd_div");
        var department_check = check_department_vaild("#create_department", "#create_department_div");
        if( !$("#create_department_div").length){
            department_check = true;
        }

        if(name_check && email_check && passwd_check && confirm_passwd_check&&department_check){
            return true;
        }else{
            return false;
        }
    }

    function check_user_reset_passwd(data){
        var first_passwd_check = check_passwd_vaild(data.user_passwd, "#reset_passwd_div");
        var confirm_passwd_check = check_confirm_passwd_vaild(data.confirm_passwd, data.user_passwd, "#reset_confirm_passwd_div");
        if(first_passwd_check && confirm_passwd_check){
            return true;
        }else{
            return false;
        }
    }

    function clear_create_user_form(){
        $("#create_user_name").val("");
        $("#create_email").val("");
        $("#create_user_passwd").val("");
        $("#confirm_passwd").val("");

        $("#create_name_div").children(".desc").addClass("hide");
        $("#create_email_div").children(".desc").addClass("hide");
        $("#create_passwd_div").children(".desc").addClass("hide");
        $("#confirm_passwd_div").children(".desc").addClass("hide");
        $("#create_department_div").children(".desc").addClass("hide");

    }

    function check_edit_user_form(data){
        var check_name = check_edit_name_vaild(data.user_name);
        var check_email = check_edit_email_vaild(data.email);
        if(check_name && check_email){
            return true;
        }else{
            return false;
        }
    }

    function check_edit_name_vaild(name){
        if(name){
            if(check_name_formt(name)){
                var current_name = $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(1).text();
                if(name==current_name){
                    $("#edit_user_name_div .success").removeClass("hide");
                    $("#edit_user_name_div .error").addClass("hide");
                    $("#edit_user_name_div .error_info").addClass("hide");

                    return true;
                }
                else{
                    if(check_user_exist("user_name",name)){
                    $("#edit_user_name_div .success").addClass("hide");
                    $("#edit_user_name_div .error").removeClass("hide");
                    $("#edit_user_name_div .error_info").removeClass("hide");
                    $("#edit_user_name_div .error_info span").html("用户名已经存在");

                    return false;
                    }else{
                        $("#edit_user_name_div .success").removeClass("hide");
                        $("#edit_user_name_div .error").addClass("hide");
                        $("#edit_user_name_div .error_info").addClass("hide");

                        return true;
                    }
                }
            }
            else{
                $("#edit_user_name_div .success").addClass("hide");
                $("#edit_user_name_div .error").removeClass("hide");
                $("#edit_user_name_div .error_info").removeClass("hide");
                $("#edit_user_name_div .error_info span").html("用户名长度为3-60个字符");
                return false;
            }

        }
        else{
            $("#edit_user_name_div .success").addClass("hide");
            $("#edit_user_name_div .error").removeClass("hide");
            $("#edit_user_name_div .error_info").removeClass("hide");
            $("#edit_user_name_div .error_info span").html("用户名不能为空");

            return false;
        }
    }

    function check_edit_email_vaild(email){
        if(email){
            if(is.email(email)){
                var current_email = $("#user_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(2).text();
                if(email==current_email){
                    $("#edit_email_div .success").removeClass("hide");
                    $("#edit_email_div .error").addClass("hide");
                    $("#edit_email_div .error_info").addClass("hide");

                    return true;
                }else{
                    if(check_user_exist("email",email)){
                    $("#edit_email_div .success").addClass("hide");
                    $("#edit_email_div .error").removeClass("hide");
                    $("#edit_email_div .error_info").removeClass("hide");
                    $("#edit_email_div .error_info span").html("邮箱已使用");

                    return false;
                }else{
                    $("#edit_email_div .success").removeClass("hide");
                    $("#edit_email_div .error").addClass("hide");
                    $("#edit_email_div .error_info").addClass("hide");

                    return true;
                }
                }

            }else{
                //console.log("format false");
                $("#edit_email_div .success").addClass("hide");
                $("#edit_email_div .error").removeClass("hide");
                $("#edit_email_div .error_info").removeClass("hide");
                $("#edit_email_div .error_info span").html("邮箱格式不正确");

                return false
            }
        }else{
            $("#edit_email_div .success").addClass("hide");
            $("#edit_email_div .error").removeClass("hide");
            $("#edit_email_div .error_info").removeClass("hide");
            $("#edit_email_div .error_info span").html("邮箱不能为空");

            return false;
        }
    }

    function check_department_vaild(department_id, department_div){
        if($(department_id).val()){
            $(department_div+ " .success").removeClass("hide");
            $(department_div+ " .error").addClass("hide");
            $(department_div+ " .error_info").addClass("hide");

            return true;
        }else{
            $(department_div +" .success").addClass("hide");
            $(department_div +" .error").removeClass("hide");
            $(department_div +" .error_info").removeClass("hide");
            $(department_div +" .error_info span").html("必须选择一个部门");

            return false;
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
        return o;
    }


}]);
