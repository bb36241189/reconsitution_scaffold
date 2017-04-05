/**
 * Created by lenovn on 2015/12/28.
 */

app.controller('RouterController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function (){
        /*
        $("#delete_router").tooltip();
        $("#add_router").tooltip();
        $("#edit_router").tooltip();
        $("#refresh_router").tooltip();
        $("#add_interface").tooltip();
        $("#delete_interface").tooltip();
        $("#edit_interface").tooltip();*/
        form_check_event();

        disabled_button();
        disabled_interface_button();

        init_router_table("");

        click_create_router();
        click_edit_router();
        click_delete_router();

        click_add_interface();
        click_edit_interface();
        click_delete_interface();
        click_refresh_router();

        keyup_search_router();
        click_search_router();

        click_submit_create_router();
        click_submit_edit_router();
        click_submit_delete_router();

        click_submit_add_interface();
        click_submit_delete_interface();
        click_submit_edit_interface();
        set_navigator();
        init_close_button();
    });

    var volume_transfer = {
        active: "运行中",
        error: "错误"
    };
    var volume_style={
        active:"success",
        error:"danger"
    };

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_router_detail_data();});
    }

    function set_navigator(){
        if ($("#network_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            //console.log("has");
            $("#network_resource").removeClass('active');
            $("#network_resource").addClass('dhbg');
            //console.log($('#demo1:not(this)').children("li"));
        }
        $(".navbar-words").html("网络资源 > 路由");

        //$("#network_resource .sub-menu").css("display", "block");
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

    function routert_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        /*
        if(!data_length){
            $("#room_table_num").hide();
        }
        $("#room_total_num").html(data_length);
        */
        if(!data_length || data_length<=page_num){
            render_router_table(data);
            return;
        }
        //加入分页的绑定
        $("#router_pagination").pagination(data_length, {
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
            render_router_table(data.slice(start, end));
        }
    }

    function router_interface_table_pagination(data){
        var page_num=8;
        var data_length=data.length;
        /*
        if(!data_length){
            $("#room_table_num").hide();
        }
        $("#room_total_num").html(data_length);
        */
        if(!data_length || data_length<=page_num){
            $("#router_interface_pagination").hide();
            render_router_interface_table(data);
            return;
        }
        $("#router_interface_pagination").show();
        //加入分页的绑定
        $("#router_interface_pagination").pagination(data_length, {
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
            render_router_interface_table(data.slice(start, end));
        }
    }

    function set_router_default_checked(){
        var _id = getUrlParam("id");
        if(_id!=null&&_id!=""){
            var this_tr = $("#router_tbody").find("tr[id=" + _id + "]");
            this_tr.addClass("table_body_tr_change");
            get_router_detail_data(this_tr.attr("id"));
            init_router_interface_table(this_tr.attr("id"));
            $(".operation_2").animate({"right":"-1000px"},function(){
            }).animate({"right":"0px"});
        }

        /*
        $("#router_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
        var tr_id = $("#router_tbody").find("tr:eq(0)").attr("id");
        $("#router_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);

        recover_button();
        get_router_detail_data(tr_id);
        init_router_interface_table(tr_id);
        */
    }

    function set_interface_default_checked(){
        $("#router_interface_tbody").find("tr:eq(0)").addClass("interface_table_tr");
        $("#router_interface_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);
        var tr_id = $("#router_interface_tbody").find("tr:eq(0)").attr("id");

        get_interface_detail_data(tr_id);
        recover_interface_button();
    }

    function click_router_table_tr(){
        $("#router_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
                /*
                var checked_rooms = $("#router_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                */
                //get_router_detail_data(this_id);init_router_interface_table(this_id);
            }).animate({"right":"0px"});
        });



        $("#router_table tbody tr").click(function(e){
            if(e.target.tagName!="TD"){
                //点击了a标签
            }
            else{
                clear_router_detail_data();
            }

            clear_table_body("#router_interface_tbody");
            if(e.target.tagName=="TD" && $(this).hasClass("table_body_tr_change")){

                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);



                //clear_router_interface_data();
            }
            else {

                var checked_rooms = $("#router_table tbody tr");
                //console.log(checked_rooms);
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);

                //console.log($(this).attr("id"));
                //set_cabinet_host($(this).attr("id"))
                var this_id = $(this).attr("id");
                get_router_detail_data(this_id);init_router_interface_table(this_id);
            }

            if (checked_table_tr("#router_table")){
                recover_button();
            }
            else{
                disabled_button();
            }

        });
    }

    function click_interface_table_tr(){
        $("#router_interface_table tbody tr").click(function(){
            if($(this).hasClass("interface_table_tr")){

                $(this).removeClass("interface_table_tr");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
                //clear_router_interface_data();
            }
            else {
                var checked_rooms = $("#router_interface_table tbody tr");
                //console.log(checked_rooms);
                checked_rooms.each(function(){
                    $(this).removeClass("interface_table_tr");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("interface_table_tr");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);
                get_interface_detail_data($(this).attr("id"));
            }

            if (checked_table_tr("#router_interface_table")){
                recover_interface_button();
            }
            else{
                disabled_interface_button();
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
            return false
        }
    }

    function disabled_button(){
        //$("#delete_router").css("cursor", "not-allowed");
        $('#delete_router').attr('disabled',"disabled");
        $("#delete_router").addClass("disabled_button");
        $("#delete_router").removeClass("danger_button");

        //$("#edit_router").css("cursor", "not-allowed");
        $('#edit_router').attr('disabled',"disabled");
        $("#edit_router").addClass("disabled_button");
        $("#edit_router").removeClass("general_button");

        //$("#add_interface").css("cursor", "not-allowed");
        $('#add_interface').attr('disabled',"disabled");
        $("#add_interface").addClass("disabled_button");
        $("#add_interface").removeClass("general_button");

        //$("#delete_router").attr("src", "/static/images/table_operate_button/disabled_delete.png");
        //$("#edit_router").attr("src", "/static/images/table_operate_button/disabled_edit.png");
        $("#add_interface").attr("src", project_url + "/static/images/table_operate_button/disabled_add.png");
    }

    function recover_button(){
        //$("#delete_router").css("cursor", "pointer");
        $('#delete_router').removeAttr('disabled');
        $('#delete_router').addClass("danger_button");
        $("#delete_router").removeClass("disabled_button");


        //$("#edit_router").css("cursor", "pointer");
        $('#edit_router').removeAttr('disabled');
        $('#edit_router').addClass("general_button");
        $("#edit_router").removeClass("disabled_button");

        //$("#add_interface").css("cursor", "pointer");
        $('#add_interface').removeAttr('disabled');
        $('#add_interface').addClass("general_button");
        $("#add_interface").removeClass("disabled_button");

        //$("#delete_router").attr("src", "/static/images/table_operate_button/delete.png");
        //$("#edit_router").attr("src", "/static/images/table_operate_button/edit.png");

        //$("#add_interface").attr("src", "/static/images/table_operate_button/add.png");
    }

    function recover_interface_button(){

        //$("#delete_interface").css("cursor", "pointer");
        $('#delete_interface').removeAttr('disabled');
        $('#delete_interface').addClass("danger_button");
        $("#delete_interface").removeClass("disabled_button");

        //$("#edit_interface").css("cursor", "pointer");
        $('#edit_interface').removeAttr('disabled');
        $('#edit_interface').addClass("general_button");
        $("#edit_interface").removeClass("disabled_button");

        //$("#delete_interface").attr("src", "/static/images/table_operate_button/delete.png");
        //$("#edit_interface").attr("src", "/static/images/table_operate_button/edit.png");

    }

    function  disabled_interface_button(){
        //$("#delete_interface").css("cursor", "not-allowed");
        $('#delete_interface').attr('disabled',"disabled");
        $('#delete_interface').addClass("disabled_button");
        $("#delete_interface").removeClass("danger_button");

        //$("#edit_interface").css("cursor", "not-allowed");
        $('#edit_interface').attr('disabled',"disabled");
        $('#edit_interface').addClass("disabled_button");
        $("#edit_interface").removeClass("general_button");


        //$("#delete_interface").attr("src", "/static/images/table_operate_button/disabled_delete.png");
        //$("#edit_interface").attr("src", "/static/images/table_operate_button/disabled_edit.png");
    }

    function init_router_table(search_name){
        $.ajax({
            type: "GET",
            url:project_url +  "/routers"+"?name="+search_name,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                    routert_table_pagination(data);
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }

        });
    }

    function render_router_table(data){
        //console.log(data);
        disabled_button();
        disabled_interface_button();
        clear_table_body("#router_interface_tbody");
        clear_router_detail_data();
        $("#router_interface_pagination").hide();

        var routers = $("#router_tbody");
        clear_table_body("#router_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);

                var router_status="";
                var rotuer_style ="";
                if(data[i].status="active"){
                    router_status="运行中";
                    router_style = "success";
                }else{
                    router_status="错误";
                    router_style = "danger";
                }
                var exteral_network="";
                if(data[i].network_name){
                    exteral_network=data[i].network_name;
                }
                var department_name = "";
                //console.log(data[i].department_name);
                //console.log(typeof(data[i].department_name))
                if(data[i].department_name){
                    department_name = data[i].department_name;
                }
                var table_body = '<td><input type="checkbox" /></td>'+
                    '<td><a class="animate_name">'+data[i].name+'</a></td>' +
                    '<td><span class="label label-' + router_style + '">'+router_status+'</span></td>' +
                    '<td>'+exteral_network+'</td>'+
                    '<td>'+ department_name+ '</td>';
                table_tr.append(table_body);
                routers.append(table_tr);
            }
            click_router_table_tr();

            set_router_default_checked();
        }
        else{
            var table_tr = '<tr><td colspan="5">没有路由</td></tr>';
            routers.append(table_tr);
        }
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function get_router_detail_data(router_id){
        //console.log(router_id);
        $.ajax({
            type: "GET",
            url: project_url + "/router/" + router_id,
            async: true,
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                if (data) {
                    //console.log(data);
                    var router_data = JSON.parse(data);
                    //console.log(router_data);
                    render_router_detail_data(router_data);
                    init_edit_router_form(router_data);
                }

            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e)
            }

        });
    }

    function render_router_detail_data(data){
        $(".router_detail_content td[name='name']").text(data.name);
        $(".router_detail_content td[name='status']").text(volume_transfer[data.status]);
        $(".router_detail_content td[name='status']").html("<span class='label label-" + volume_style[data.status] + "'>" + volume_transfer[data.status] + "</span>");
        //$(".router_detail_content td[name='network_name']").text(data.network_name);
        $(".router_detail_content td[name='create_time']").text(data.create_time);
        $(".router_detail_content td[name='description']").text(data.description);

        if (data.admin_state_up){
            $(".router_detail_content td[name='admin_state_up']").text("UP");
        }
        else{
            $(".router_detail_content td[name='admin_state_up']").text("Down");
        }

        if(data.network_name){
            $(".router_detail_content td[name='external_gateway_info']").text("已经连接到外部网络：" +data.network_name );
        }
        else{
            $(".router_detail_content td[name='external_gateway_info']").text("");
        }
    }

    function clear_router_detail_data(){
        $(".operation_2").animate({"right":"-1000px"});
        $(".router_detail_content td[name='name']").html("");
        $(".router_detail_content td[name='status']").html("");
        $(".router_detail_content td[name='admin_state_up']").html("");
        //$(".router_detail_content td[name='network_name']").html("");
        $(".router_detail_content td[name='external_gateway_info']").html("");
        $(".router_detail_content td[name='create_time']").html("");
        $(".router_detail_content td[name='description']").html("");
    }

    function click_refresh_router(){
        $("#refresh_router").click(function(){
            init_router_table("");
            clear_router_detail_data();
            clear_table_body("#router_interface_tbody");
            //clear_router_interface_data();

            disabled_button();
            disabled_interface_button();
        });
    }

    function click_create_router(){
        $("#add_router").click(function(){

            $("#submit_create_router").addClass("form_general_button");
            $("#submit_create_router").removeClass("disabled_button");
            $("#submit_create_router").removeAttr("disabled");

            if(!$("#router_external_network").length){
                return
            }
            $.ajax({
                type: "GET",
                url: project_url + "/networks",
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    //var router_data = JSON.parse(data);
                    init_create_router_form(data);
                },
                error: function(e){
                    //console.log(e);
                    SAlert.showError(e)
                }

            });

        });
    }

    function click_edit_router(){
        $("#edit_router").click(function(){
            $("#submit_edit_router").addClass("form_general_button");
            $("#submit_edit_router").removeClass("disabled_button");
            $("#submit_edit_router").removeAttr("disabled");
        });
    }

    function click_delete_router(){
        $("#delete_router").click(function(){
            $("#submit_delete_router").addClass("form_danger_button");
            $("#submit_delete_router").removeClass("disabled_button");
            $("#submit_delete_router").removeAttr("disabled");
        })
    }

    function init_create_router_form(data){
        var default_option=$("<option value=''>请选择一个外部网络</option>");
        $("#router_external_network").empty();
        $("#router_external_network").append(default_option);
        if (data){
            //console.log(data);
            for (var i=0,l=data.length;i<l;i++){
                if(data[i]['router:external']){
                    //console.log(data[i]['router:external']);
                    var router_option = $("<option></option>");
                    router_option.attr("value",data[i].network_id);
                    router_option.text(data[i].network_name);
                    $("#router_external_network").append(router_option);
                }
            }
        }
    }

    function click_submit_create_router(){
        $("#submit_create_router").click(function(){
            var router_data = getFormObject("#create_router_form");
            //console.log(router_data);
            if(!check_create_form_vaild(router_data)){
                return;
            }
            $.ajax({
                    type:"POST",
                    url:project_url + "/routers",
                    data: JSON.stringify(router_data),
                    //dataType: "json",
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        //console.log("success");
                        //$("#create_router_modal").modal('hide');
                        location.reload()
                    },
                    error:function(e){
                        //console.log("error");
                        $("#create_router_modal").modal('hide');
                        SAlert.showError(e);
                    }
                });

            $("#submit_create_router").addClass("disabled_button");
            $("#submit_create_router").removeClass("form_general_button");
            $("#submit_create_router").attr("disabled", "disabled");

        });
    }

    function click_submit_edit_router(){
        $("#submit_edit_router").click(function(){
            var router_data = getFormObject("#edit_router_form");
            var router_id = $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(router_data);
            if(!check_edit_form_vaild(router_data)){
                return;
            }
            $.ajax({
                type:"PUT",
                url:project_url + "/router/"+ router_id,
                data: JSON.stringify(router_data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    //$("#edit_router_modal").modal('hide');
                    location.reload()
                },
                error:function(e){
                    //console.log(e);
                    $("#edit_router_modal").modal('hide');
                    SAlert.showError(e);
                }
            });

            $("#submit_edit_router").addClass("disabled_button");
            $("#submit_edit_router").removeClass("form_general_button");
            $("#submit_edit_router").attr("disabled", "disabled");
        });
    }

    function init_edit_router_form(router_data){

        $("#edit_name").val(router_data.name);
        $("#edit_description").val(router_data.description);
        if(router_data.admin_state_up){
            $("#edit_admin_state_up option[value='True']").attr("selected", "selected");
        }
        else{
            $("#edit_admin_state_up option[value='False']").attr("selected", "selected");
        }
        var init_network_data = function(network_data) {
            if (network_data){
                $("#edit_external_network").empty();
                var default_option = '<option value="">清除网关</option>';
                $("#edit_external_network").append(default_option);
                for (var i=0,l=network_data.length;i<l;i++){
                    if(network_data[i]['router:external']){
                        //console.log(network_data[i]['router:external']);
                        var router_option = $("<option></option>");
                        router_option.attr("value",network_data[i].network_id);
                        router_option.text(network_data[i].network_name);
                        if(network_data[i].network_id == router_data.network_id){
                            router_option.attr("selected", "selected");
                        }
                        $("#edit_external_network").append(router_option);
                    }
                }
            }
        }

        if(!$("#edit_external_network").length){
            return
        }
        $.ajax({
            type: "GET",
            url:project_url +  "/networks",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                if (data) {
                    //var router_data = JSON.parse(data);
                    init_network_data(data);
                }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }

        });
    }

    function click_submit_delete_router(){
        $("#submit_delete_router").click(function(){
            var router_id = $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(router_id);
            $.ajax({
                type:"DELETE",
                url:project_url + "/router/"+router_id,
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    location.reload();
                },
                error:function(e){
                    $("#delete_router_modal").modal("hide");
                    //console.log(e);
                    SAlert.showError(e)
                }
            });

            $("#submit_delete_router").addClass("disabled_button");
            $("#submit_delete_router").removeClass("form_danger_button");
            $("#submit_delete_router").attr("disabled", "disabled");
        });
    }

    function init_router_interface_table(router_id){

        $.ajax({
            type: "GET",
            url: project_url + "/router_interface/"+router_id,
            async: true,
            //dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                if (data) {
                    //console.log(data);
                    var interface_data = JSON.parse(data);
                    router_interface_table_pagination(interface_data);
                    //render_router_interface_table(interface_data);
                }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e)
            }

        });
    }

    function render_router_interface_table(data){
        var interfaces = $("#router_interface_tbody");
        clear_table_body("#router_interface_tbody");
        if (data.length){
            //clear_router_interface_data();
            disabled_interface_button();
            for(var i=0;i<data.length;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                //table_tr.attr("subnet_id", data[i].fixed_ips[0].subnet_id);
                table_tr.attr("subnet_id", data[i].subnet_id);
                /*
                var ips='';
                for(var j=0;j<data[i].fixed_ips.length;j++){
                    ips += '<li>'+data[i].fixed_ips[j].ip_address+'</li>';
                }*/
                var interface_name='';
                if (data[i].name){
                    interface_name = data[i].name;
                }
                else{
                    interface_name = data[i].id.substring(0,8);
                }

                var admin_state = '';
                if (data[i].admin_state_up){
                    admin_state = "UP";
                }
                else{
                    admin_state = "DOWN";
                }
                var interface_type="";
                if(data[i].device_owner == "network:router_gateway"){
                    interface_type = "外部网关";
                }
                else if(data[i].device_owner == "network:router_interface"){
                    interface_type = "内部接口";
                }
                else{
                    interface_type = "未知";
                }
                var table_body = '<td><input type="checkbox" /></td>'+
                    '<td>'+interface_name+'</td>' +
                   // '<td>'+'<ul>' +ips +'</ul>'+'</td>'+
                    '<td>'+data[i].ip_address+'</td>'+
                    '<td>'+data[i].status+'</td>'+
                    '<td>'+ interface_type+ '</td>'+
                    '<td>'+ admin_state+ '</td>';

                table_tr.append(table_body);
                interfaces.append(table_tr);
            }
            click_interface_table_tr();

            //set_interface_default_checked();
        }
        else{
            var table_tr = $("<tr></tr>");
            var table_body = '<td colspan="6">没有接口信息</td>'
            table_tr.append(table_body);
            interfaces.append(table_tr);
            disabled_interface_button();
        }
    }

    function click_add_interface(){
        $("#add_interface").click(function(){
            $("#submit_create_interface").addClass("form_general_button");
            $("#submit_create_interface").removeClass("disabled_button");
            $("#submit_create_interface").removeAttr("disabled");

            var parm = {
                "router:external": "0",
                "interface_use" : "True"
            };

            $.ajax({
                type: "GET",
                //url: "/networks"+"?interface_use=True&router_external=0",
                url:project_url + "/networks",
                data:parm,
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                    if (data) {
                        //console.log(data);
                        //var subnets_data = JSON.parse(data);
                        init_create_interface_form(data);
                    }
                },
                error: function(e){
                    //console.log(e);
                    SAlert.showError(e)
                }

            });
        });
    }

    function click_edit_interface(){
        $("#edit_interface").click(function(){
            $("#submit_edit_interface").addClass("form_general_button");
            $("#submit_edit_interface").removeClass("disabled_button");
            $("#submit_edit_interface").removeAttr("disabled");
        });
    }

    function click_delete_interface(){
        $("#delete_interface").click(function(){
            $("#submit_delete_interface").addClass("form_danger_button");
            $("#submit_delete_interface").removeClass("disabled_button");
            $("#submit_delete_interface").removeAttr("disabled");
        });
    }

    function init_create_interface_form(data){
        if(data.length){
            $("#subnet_id").empty();
            var default_option = '<option value="">请选择网络</option>';
            $("#subnet_id").append(default_option);
            for (var i=0,l=data.length;i<l;i++){
                var network_option = $("<option></option>");
                network_option.attr("value",data[i].subnet_id);
                network_option.text(data[i].network_name + "("+data[i].cidr+")");
                $("#subnet_id").append(network_option);
            }
        }
    }

    function click_submit_add_interface(){
        $("#submit_create_interface").click(function(){
            var router_id = $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var interface_data = getFormObject("#create_interface_form");
            //console.log(interface_data);
            if(!check_add_interface_form(interface_data.subnet_id)){
                return;
            }
            //console.log(router_id);
            $.ajax({
                type:"POST",
                url:project_url + "/router_interface/"+router_id,
                data: JSON.stringify(interface_data),
                //dataType: "json",
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    $("#create_interface_modal").modal('hide');
                    init_router_interface_table(router_id)
                    //location.reload()
                },
                error:function(e){
                    //console.log(e);
                    $("#create_interface_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_create_interface").addClass("disabled_button");
            $("#submit_create_interface").removeClass("form_general_button");
            $("#submit_create_interface").attr("disabled", "disabled");

        });
    }

    function click_submit_delete_interface(){
        $("#submit_delete_interface").click(function(){
            var subnet_id = $("#router_interface_table tbody tr input[type=checkbox]:checked").parents("tr").attr("subnet_id");
            var router_id = $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var interface_type = $("#router_interface_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(4).text()
            //console.log(interface_type);
            //console.log(subnet_id);
            if(interface_type == "外部网关"){
                $.ajax({
                    type:"PUT",
                    url:project_url + "/router/"+ router_id,
                    data: JSON.stringify({"network_id":""}),
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        $("#delete_interface_modal").modal('hide');
                        init_router_interface_table(router_id);
                        $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(3).text("");
                    },
                    error:function(e){
                        //console.log(e);
                        $("#delete_interface_modal").modal('hide');
                        SAlert.showError(e)
                    }
                });
                return
            }
            console.log(subnet_id)
            $.ajax({
                type:"DELETE",
                url:project_url + "/router_interface/" +router_id,
                data: JSON.stringify({"subnet_id":subnet_id}),
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    $("#delete_interface_modal").modal('hide');
                    init_router_interface_table(router_id);
                },
                error:function(e){
                    //console.log(e);
                    $("#delete_interface_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_delete_interface").addClass("disabled_button");
            $("#submit_delete_interface").removeClass("form_danger_button");
            $("#submit_delete_interface").attr("disabled", "disabled");
        });
    }

    function get_interface_detail_data(port_id){
        $.ajax({
            type: "GET",
            url: project_url + "/port/"+port_id,
            async: true,
            //dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                if (data) {
                    //console.log(data);
                    var port_data = JSON.parse(data);
                    //render_interface_detail_data(port_data);
                    init_interface_edit_form(port_data);
                }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e)
            }

        });
    }

    function init_interface_edit_form(data){
        //console.log(data);
        $("#edit_interface_name").val(data.name);

        if(data.admin_state_up){
            $("#interface_admin_state_up option[value='True']").attr("selected", "selected");
        }
        else{
            $("#interface_admin_state_up option[value='False']").attr("selected", "selected");
        }
    }

    function click_submit_edit_interface(){
        $("#submit_edit_interface").click(function(){
            var interface_data = getFormObject('#edit_interface_form');
            var port_id = $("#router_interface_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var router_id = $("#router_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //if(!check_edit_interface_form(interface_data)){
            //    return ;
           // }
            $.ajax({
                    type:"PUT",
                    url:project_url + "/port/"+ port_id,
                    data: JSON.stringify(interface_data),
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        //console.log(msg);
                        $("#edit_interface_modal").modal('hide');
                        init_router_interface_table(router_id);
                        //location.reload()
                    },
                    error:function(e){
                        //console.log(e);
                        $("#edit_interface_modal").modal('hide');
                        SAlert.showError(e)
                    }
            });

            $("#submit_edit_interface").addClass("disabled_button");
            $("#submit_edit_interface").removeClass("form_general_button");
            $("#submit_edit_interface").attr("disabled", "disabled");
        });
    }

    function check_create_form_vaild(data){
        var name_check = check_name_vaild(data.name, "#create_name_div");
        var desc_check = check_description_vaild(data.description, "#create_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_edit_form_vaild(data){
        var name_check = check_name_vaild(data.name, "#edit_name_div");
        var desc_check = check_description_vaild(data.description, "#edit_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_edit_interface_form(data){
        var name_check = check_name_vaild(data.name, "#interface_name_div")
        if(name_check){
            return true;
        }else{
            return false;
        }
    }

    function check_add_interface_form(subnet_id){
        var subnet_check = check_network_vaild(subnet_id, "#subnets_div");
        if(subnet_check){
            return true;
        }else{
            return false;
        }
    }

    function form_check_event(){
        $("#create_name").blur(function(){
            var input_name = $("#create_name").val();
            check_name_vaild(input_name, "#create_name_div");
        });

        $("#edit_name").blur(function(){
            var input_name = $("#edit_name").val();
            check_name_vaild(input_name, "#edit_name_div");
        });

        $("#create_description").blur(function(){
           var input_desc = $("#create_description").val();
            check_description_vaild(input_desc, "#create_description_div")
        });

        $("#edit_description").blur(function(){
           var input_desc = $("#edit_description").val();
            check_description_vaild(input_desc, "#edit_description_div")
        });

        $("#edit_interface_name").blur(function(){
            var input_name = $("#edit_interface_name").val();
            //check_name_vaild(input_name, "#interface_name_div");
        });

        $("#create_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_interface_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#subnet_id").change(function(){
            var subnet_id = $("#subnet_id").val();
            //console.log(server_id);
            check_network_vaild(subnet_id, "#subnets_div");
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

    function check_name_vaild(name, name_div){
        if(name){
            if(name.length>=3 && name.length<=60){
                if(check_name_format(name)){
                    return display_check_info(name_div, true, "")
                }else{
                    return display_check_info(name_div, false, "格式不正确")
                }
            }else{
                return display_check_info(name_div, false, "长度范围为3-60个字符")
            }

        }else{
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_name_format(name){
        return true;
    }

    function check_description_vaild(desc, desc_div){
        if(desc.length>1024){
            return display_check_info(desc_div, false, "长度范围为0-1024个字符");
        }else{
            return display_check_info(desc_div, true, "");
        }
    }

    function check_network_vaild(network, network_div){
        if(network){
            return display_check_info(network_div, true, "");
        }else{
            return display_check_info(network_div, false, "请选择一个网络");
        }
    }


    function keyup_search_router(){
        $("#search_router_input").keyup(function(){
            //console.log($("#search_user_input").val());
            init_router_table($("#search_router_input").val());
        });
    }

    function click_search_router(){
        $("#search_router_img").click(function(){
            init_router_table($("#search_router_input").val());
        });
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