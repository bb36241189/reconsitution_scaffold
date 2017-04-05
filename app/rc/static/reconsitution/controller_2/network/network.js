/**
 * Created by yugongpeng on 2015/12/22.
 */

app.controller('NetworkController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function (){

        //$("#delete_network").tooltip();
        //$("#add_network").tooltip();
        //$("#edit_network").tooltip();
        //$("#refresh_network").tooltip();

        disabled_button();

        init_network_table("");

        //click_network_table_tr();
        click_add_network();
        click_edit_network();
        click_delete_network();

        click_submit_create_network();
        click_submit_delete_network();
        click_refresh_network();
        click_submit_edit_network();

        click_disabled_gateway();
        click__exteral_network();
        set_navigator();

        //click_edit_form();
        keyup_search_network();
        click_search_network();

        init_close_button();

        click_add_pool();
        click_del_pool();
        blur_cidr();

        register_network_type();
    });

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_detail_data()});
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
            $(".navbar-words").html("网络资源 > 网络");
        }

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

    function network_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        /*
        if(!data_length){
            $("#room_table_num").hide();
        }
        $("#room_total_num").html(data_length);
        */
        if(!data_length || data_length<=page_num){
            render_network_table(data);
            $("#network_pagination").hide();
            return;
        }
        $("#network_pagination").show();
        //加入分页的绑定
        $("#network_pagination").pagination(data_length, {
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
            render_network_table(data.slice(start, end));
            //render_image_list(data.slice(start, end));
        }
    }

    function set_network_default_checked(){
        $("#network_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
        var tr_id = $("#network_tbody").find("tr:eq(0)").attr("id");
        $("#network_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);


        recover_button();
        get_network_detail_data(tr_id);
    }

    function click_network_table_tr(){
        $("#network_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
                /*
                var checked_rooms = $("#network_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                get_network_detail_data(this_id);
                */
            }).animate({"right":"0px"});
        });


        $("#network_table tbody tr").click(function(e){

            if(e.target.tagName!="TD"){

            }
            else{
                clear_detail_data();
            }

            if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){

                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);


            }
            else {

                var checked_rooms = $("#network_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);
                var this_id = $(this).attr("id");
                get_network_detail_data(this_id);
            }

            if (checked_table_tr("#network_table")){
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
            //console.log(true);
            return true;
        }
        else {
            //console.log(false);
            return false
        }
    }

    function disabled_button(){
        $('#delete_network').attr('disabled',"disabled");
        //$("#delete_network").css("cursor", "not-allowed");
        $("#delete_network").addClass("disabled_button");
        $("#delete_network").removeClass("danger_button");

        $('#edit_network').attr('disabled',"disabled");
        //$("#edit_network").css("cursor", "not-allowed");
        $("#edit_network").addClass("disabled_button");
        $("#edit_network").removeClass("general_button");

        //$("#delete_network").attr("src", "/static/images/table_operate_button/disabled_delete.png");
        //$("#edit_network").attr("src", "/static/images/table_operate_button/disabled_edit.png");
    }

    function recover_button(){
        $('#delete_network').removeAttr('disabled');
        //$("#delete_network").css("cursor", "pointer");
        $('#delete_network').addClass("danger_button");
        $("#delete_network").removeClass("disabled_button");

        $('#edit_network').removeAttr('disabled');
        //$("#edit_network").css("cursor", "pointer");
        $('#edit_network').addClass("general_button");
        $("#edit_network").removeClass("disabled_button");


        //$("#delete_network").attr("src", "/static/images/table_operate_button/delete.png");
        //$("#edit_network").attr("src", "/static/images/table_operate_button/edit.png");
    }

    function init_network_table(search){
        $.ajax(,PermitStatus);
    }

    function render_network_table(data){
        disabled_button();
        clear_detail_data();

        var networks = $("#network_tbody");
        clear_table_body("#network_tbody");
        console.log(data);
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].network_id);
                table_tr.attr("qos_policy_id", data[i].qos_policy_id);

                var network_status="";
                var network_style="";
                //console.log(data[i].status.toLowerCase());
                if(data[i].status.toLowerCase() == "active"){
                    network_status="可用";
                    network_style="success";
                }
                else{
                    network_status="不可用";
                    network_style="danger";
                }
                var ip_version="";
                if(data[i].ip_version){
                    ip_version = "IPv" + data[i].ip_version
                }
                var network_type = "否";
                if (data[i]['router:external']){
                    network_type = "是";
                }
                var table_body = '<td><input type="checkbox" /></td>'+
                    '<td><a class="animate_name">'+data[i].network_name+'<a/></td>' +
                    '<td>'+data[i].cidr+'</td>' +
                    '<td>'+ip_version+'</td>'+
                    '<td>'+ data[i].gateway_ip+ '</td>'+
                    '<td>'+ network_type+ '</td>'+
                    '<td><span class="label label-' + network_style + '">'+ network_status+ '</span></td>';

                 table_tr.append(table_body);
                 networks.append(table_tr);
            }
            click_network_table_tr();

            //set_network_default_checked();
        }
        else{
            var table_tr = '<tr><td colspan="7">没有网络</td></tr>';
            networks.append(table_tr);
        }
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function click_add_network(){
        $("#add_network").click(function(){
            $("#submit_create_network").addClass("form_general_button");
            $("#submit_create_network").removeClass("disabled_button");
            $("#submit_create_network").removeAttr("disabled");

            $("#network_name").val("");
            $("#cidr1").val("192");
            $("#cidr2").val("168");
            $("#cidr3").val("");
            $("#cidr4").val("0");
            $("#cidr5").val("24");
            $("#external").removeAttr('checked');
            $("#description").val("");
            $("#gateway_ip").val("");
            $("#shared").removeAttr('checked');
            //$("#enable_dhcp").removeAttr('checked');
            $("#enable_dhcp").prop("disabled", false);
            $(".pool-list").html("");
            $("#dns_nameservers").val("");

            $("#pool1").val("");
            $("#pool2").val("");
            $("#pool3").val("");
            $("#pool4").val("");
            $("#pool5").val("");
            $("#pool6").val("");
            $("#pool7").val("");
            $("#pool8").val("");

            $("#cidr5").change();
            // get_qos_policy('create');
        })
    }

    function get_qos_policy(op_type) {
        $.ajax(,PermitStatus);
    }

    function render_qos_policy(data){
        $("#qos_policy_id").empty();
        var default_option = '<option selected="selected" value="">选择QOS</option>';
        $("#qos_policy_id").append(default_option);
        var policy_data = data.policies;
        for(var i=0,l=policy_data.length;i<l;i++){
            var select_option = $("<option></option>");
            select_option.attr("value",policy_data[i].id);
            select_option.text(policy_data[i].name);
            $("#qos_policy_id").append(select_option);
        }
        $("#qos_policy_id").val($("#qos_policy_id").attr("pid"));
    }

    function render_qos_policy_update(data){
        $("#update_qos_policy_id").empty();
        var default_option = '<option selected="selected" value="">选择QOS</option>';
        $("#update_qos_policy_id").append(default_option);
        var policy_data = data.policies;
        for(var i=0,l=policy_data.length;i<l;i++){
            var select_option = $("<option></option>");
            select_option.attr("value",policy_data[i].id);
            select_option.text(policy_data[i].name);
            $("#update_qos_policy_id").append(select_option);
        }
        $("#update_qos_policy_id").val($("#update_qos_policy_id").attr("pid"));
    }

    function click_edit_network(){
        $("#edit_network").click(function(){
            $("#submit_edit_network").addClass("form_general_button");
            $("#submit_edit_network").removeClass("disabled_button");
            $("#submit_edit_network").removeAttr("disabled");
            get_qos_policy('update');
        });
    }

    function click_delete_network(){
        $("#delete_network").click(function(){
            $("#submit_delete_interface").addClass("form_danger_button");
            $("#submit_delete_interface").removeClass("disabled_button");
            $("#submit_delete_interface").removeAttr("disabled");

            $("#submit_delete_network").addClass("form_danger_button");
            $("#submit_delete_network").removeClass("disabled_button");
            $("#submit_delete_network").removeAttr("disabled");
        });
    }

    function click_submit_create_network(){
        $("#submit_create_network").click(function(){
            if(!submitValidation("create_network_form")){
                return;
            }
            var network_data = getFormObject("#create_network_form");
            //默认为内部网络
            if(network_data.external==undefined){
                network_data.external = "False";
            }
            if(network_data.shared==undefined){
                network_data.shared = "False";
            }

            var data = get_network_form_checkbox(network_data);
            //默认为ip4
            data.ip_version = 4;
            data.admin_state_up = "True";
            //console.log(data);
            //return
            $.ajax(,PermitStatus);

            $("#submit_create_network").addClass("disabled_button");
            $("#submit_create_network").removeClass("form_general_button");
            $("#submit_create_network").attr("disabled", "disabled");

        });
    }

    function click_submit_delete_network(){
        $("#submit_delete_network").click(function () {
            //console.log("click delete");
            var network_id = $("#network_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(network_id);
            $.ajax(,PermitStatus);

            $("#submit_delete_network").addClass("disabled_button");
            $("#submit_delete_network").removeClass("form_danger_button");
            $("#submit_delete_network").attr("disabled", "disabled");
        })
    }

    function click_refresh_network(){
        $("#refresh_network").click(function(){
            init_network_table("");
            clear_detail_data();
            disabled_button();
        });
    }

    function init_edit_network_form(data){
        $("#edit_network_name").val(data.network_name);
        $("#edit_gateway_ip").val(data.gateway_ip);
        $("#edit_description").val(data.description);
        $("#update_qos_policy_id").attr("pid",data.qos_policy_id);


        var dns_nameservers = "";
        if(data.dns_nameservers){
            var dns_data = $.parseJSON(data.dns_nameservers);
            //console.log(dns_data);
            for(var i=0;i<dns_data.length;i++){
                var tmp = dns_data[i] + "\n";
                dns_nameservers += tmp;
            }
        }
        $("#edit_dns_nameservers").val(dns_nameservers);

        var host_routers = "";
        if(data.host_routes){
            var routers_data = $.parseJSON(data.host_routes);
            //console.log(routers_data);
            for(var i=0;i<routers_data.length;i++){
                var tmp = routers_data[i].destination + "," +routers_data[i].nexthop+ "\n";
                host_routers += tmp;
            }
        }
        $("#edit_host_routes").val(host_routers);
        //console.log(data.host_routes);
        //console.log(data.dns_nameservers);

        if(data.shared){
            $("#edit_shared").prop("checked", true);
        }
        else{
            $("#edit_shared").prop("checked",false);
        }
        if (data.admin_state_up){
            $("#edit_admin_state_up option[value='True']").attr("selected", "selected");
        }
        else{
            $("#edit_admin_state_up option[value='False']").attr("selected", "selected");
        }
        if(data['router:external']){
            $("#edit_external").prop("checked", true);
            $("#edit_enable_dhcp").prop("disabled", true);
        }
        else{
            $("#edit_external").prop("checked",false);
            $("#edit_enable_dhcp").prop("disabled", false);
        }
        if(data.enable_dhcp){
            $("#edit_enable_dhcp").prop("checked", true);
        }
        else{
            $("#edit_enable_dhcp").prop("checked",false);
        }

    }

    function click_submit_edit_network(){
        $("#submit_edit_network").click(function (){
            if(!submitValidation("edit_network_form")){
                return;
            }
            var network_id = $("#network_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var network_data = getFormObject("#edit_network_form");
            if(network_data.external==undefined){
                network_data.external = "False";
            }
            if(network_data.shared==undefined){
                network_data.shared = "False";
            }
            var data = get_edit_network_form_checkbox(network_data);
            //默认为ip4
            data.ip_version = "4";
            data.admin_state_up = "True";
            //console.log(data);
            //return;
            $.ajax(,PermitStatus);

            $("#submit_edit_network").addClass("disabled_button");
            $("#submit_edit_network").removeClass("form_general_button");
            $("#submit_edit_network").attr("disabled", "disabled");
        });
    }

    function get_network_form_checkbox(network_data){
        if ($("#disabled_gateway").is(':checked')){
                network_data.gateway_ip = "";
        }

        if ($("#shared").is(':checked')){
            network_data.shared = true;
        }
        else{
            network_data.shared = false;
        }

        if ($("#enable_dhcp").is(':checked')){
            network_data.enable_dhcp = true;
        }
        else{
            network_data.enable_dhcp = false;
        }

        if ($("#external").is(':checked')){
            network_data['router:external'] = true;
        }
        else{
            network_data['router:external'] = false;
        }
        delete network_data.external
        network_data.subnet_name = network_data.network_name + "-subnet";
        return network_data;
    }

    function get_edit_network_form_checkbox(network_data){
        if ($("#edit_disabled_gateway").is(':checked')){
                network_data.gateway_ip = "";
        }

        if ($("#edit_shared").is(':checked')){
            network_data.shared = true;
        }
        else{
            network_data.shared = false;
        }

        if ($("#edit_enable_dhcp").is(':checked')){
            network_data.enable_dhcp = true;
        }
        else{
            network_data.enable_dhcp = false;
        }

        if ($("#edit_external").is(':checked')){
            network_data['router:external'] = true;
        }
        else{
            network_data['router:external'] = false;
        }
        delete network_data.external
        network_data.subnet_name = network_data.network_name + "-subnet";
        return network_data;
    }

    function click_disabled_gateway(){
        $("#disabled_gateway").click(function(){
            if ($("#disabled_gateway").is(':checked')){
                //console.log("checked");
                $("#gateway_ip").val("");
                $("#gateway_ip").prop("disabled", "disabled");
                //$("#gateway_ip").attr("readOnly", true);
            }
            else{
                //console.log("no checked");
                //$("#gateway_ip").removeAttr("readOnly");
                $("#gateway_ip").removeAttr("disabled");
            }
        });

        $("#edit_disabled_gateway").click(function(){
            if ($("#edit_disabled_gateway").is(':checked')){
                //console.log("checked");
                $("#edit_gateway_ip").val("");
                $("#edit_gateway_ip").prop("disabled", "disabled");
                //$("#gateway_ip").attr("readOnly", true);
            }
            else{
                //console.log("no checked");
                //$("#gateway_ip").removeAttr("readOnly");
                $("#edit_gateway_ip").removeAttr("disabled");
            }
        });
    }

    function click__exteral_network(){
        $(".create_external").click(function(){
            if($("#external").is(':checked')){
                $("#enable_dhcp").removeAttr("checked");
                $("#shared").prop("checked", "checked");
                $("#enable_dhcp").prop("disabled", true);
                //console.log("checked");
            }
            else{
                $("#enable_dhcp").prop("checked", "checked");
                $("#shared").removeAttr("checked");
                $("#enable_dhcp").prop("disabled", false);
                //console.log("no checked");
            }
        });

          $("#edit_external").click(function(){
            if($("#edit_external").is(':checked')){
                $("#edit_enable_dhcp").removeAttr("checked");
                $("#edit_enable_dhcp").prop("disabled", true);
            }
            else{
                $("#edit_enable_dhcp").prop("checked", "checked");
                $("#edit_enable_dhcp").prop("disabled", false);

            }
        });
    }

    function get_network_detail_data(network_id){
        //console.log(network_id);
        $.ajax(,PermitStatus);
    }

    function render_detail_data(data){
        //console.log(data);

        $(".network_detail td[name='network_name']").text(data.network_name);
        $(".network_detail td[name='qos_policy_id']").text(data.qos_policy_id);
        $(".network_detail td[name='network_type']").text(data['provider:network_type']);
        $(".network_detail td[name='ip_version']").text(data.ip_version);
        $(".network_detail td[name='cidr']").text(data.cidr);
        $(".network_detail td[name='gateway_ip']").text(data.gateway_ip);
        $(".network_detail td[name='description']").text(data.description);
        //$(".operation_d_1 span[name='description']").text(data.description);

        if(data.status.toLowerCase() == "active"){
            $(".network_detail td[name='status']").html("<span class='label label-success'>可用</span>");
        }else{
            $(".network_detail td[name='status']").html("<span class='label label-danger'>不可用</span>");
        }

        if (data.admin_state_up){
            $(".network_detail td[name='admin_state_up']").text("UP");
        }
        else{
            $(".network_detail td[name='admin_state_up']").text("Down");
        }

        if (data.shared){
            $(".network_detail td[name='shared']").text("是");
        }
        else{
            $(".network_detail td[name='shared']").text("否");
        }

        if (data['router:external']){
            $(".network_detail td[name='external']").text("是");
        }
        else{
            $(".network_detail td[name='external']").text("否");
        }

        if(data.enable_dhcp){
            $(".network_detail td[name='enable_dhcp']").text("是");
        }
        else{
            $(".network_detail td[name='enable_dhcp']").text("否");
        }

        if(data['provider:physical_network']){
            $(".td_physical_network").show();
            $(".network_detail td[name='physical_network']").text(data['provider:physical_network']);
        }else{
            $(".td_physical_network").hide();
        }

        if(data['provider:segmentation_id']){
            $(".td_segmentation_id").show();
            $(".network_detail td[name='segmentation_id']").text(data['provider:segmentation_id']);
        }else{
            $(".td_segmentation_id").hide();
        }

        var ip_pools = "";
        if(data.allocation_pools){
            var  pools = $.parseJSON(data.allocation_pools.replace(/u'|'/g,'"'));
            for (var i= 0,l=pools.length;i<l;i++){
                var tmp = "开始 "+pools[i].start + " " + "结束 " + pools[i].end  + "  ";
                ip_pools += tmp;
            }
        }
        $(".network_detail td[name='allocation_pools']").text(ip_pools);

        var dns_nameservers = "";
        if(data.dns_nameservers){
            var nameservers = $.parseJSON(data.dns_nameservers.replace(/u'|'/g,'"'));
            for(var i= 0,l=nameservers.length;i<l;i++){
                var tmp = nameservers[i] + " ";
                dns_nameservers += tmp;
            }
        }
        $(".network_detail td[name='dns_nameservers']").text(dns_nameservers);

        var host_routers = "";
        if(data.host_routes){
            var routers = $.parseJSON(data.host_routes.replace(/u'|'/g,'"'));
            for(var i= 0,l=routers.length;i<l;i++){
                var tmp = "目的地址 " + routers[i].destination  + " 下一跳" + routers[i].nexthop + " ";
                host_routers += tmp;
            }
        }
        $(".network_detail td[name='host_routes']").text(host_routers);

        $(".network_detail td[name='qos_name']").text(data.qos_name);
        //console.log(data.allocation_pools);
        //console.log($.parseJSON(data.allocation_pools.replace(/u'|'/g,'"')));
    }

    function clear_detail_data(){
        $(".operation_2").animate({"right":"-1000px"});
        $(".network_detail td[name='network_name']").html("");
        $(".network_detail td[name='status']").html("");
        $(".network_detail td[name='admin_state_up']").html("");
        $(".network_detail td[name='shared']").html("");
        $(".network_detail td[name='external']").html("");
        $(".network_detail td[name='network_type']").html("");
        $(".network_detail td[name='ip_version']").html("");
        $(".network_detail td[name='cidr']").html("");
        $(".network_detail td[name='gateway_ip']").html("");
        $(".network_detail td[name='enable_dhcp']").html("");
        $(".network_detail td[name='host_routes']").html("");
        $(".network_detail td[name='dns_nameservers']").html("");
        $(".network_detail td[name='allocation_pools']").html("");
        $(".operation_d_1 span[name='description']").html("");
    }

    function keyup_search_network(){
        $("#search_network_input").keyup(function(){
            //console.log($("#search_user_input").val());
            init_network_table($("#search_network_input").val());
        });
    }

    function click_search_network(){
        $("#search_network_img").click(function(){
            init_network_table($("#search_network_input").val());
        });
    }


    function blur_cidr(){
        $("#cidr-setting").children().change(function(){
            if(submitValidation("cidr-setting")){
                //更新input
                $("#cidr").val($("#cidr1").val() + "." + $("#cidr2").val() + "." + $("#cidr3").val() + "." + $("#cidr4").val() + "/" + $("#cidr5").val());

                clear_pool_list();
                //根据子网掩码确定范围
                var _mask = parseInt($("#cidr5").val());
                //确定的个数
                var _s = parseInt(_mask/8);
                //剩余的掩码长度
                var _m = _mask%8;
                //剩余的ip
                var _i=0;
                switch(_s){
                    case 4:

                        break;
                    case 3:
                        _i = parseInt($("#cidr4").val());
                        break;
                    case 2:
                        _i = parseInt($("#cidr3").val());
                        break;
                    case 1:
                        _i = parseInt($("#cidr2").val());
                        break;
                    case 0:
                        _i = parseInt($("#cidr1").val());
                        break;
                }
                //转二进制
                var _t = pad(_i.toString(2),8);
                //截取
                var _p = _t.substring(0,_m);
                _p = _p ==""?"0":_p;

                //起始占用
                var pfix = 1;
                //结束占用
                var efix = 1;
                //十进制
                var _min = parseInt(pad2(_p,8),2) + pfix;

                switch (_s){
                    case 4:
                        $("#pool1").attr("disabled","disabled");
                        $("#pool2").attr("disabled","disabled");
                        $("#pool3").attr("disabled","disabled");
                        $("#pool4").attr("disabled","disabled");
                        $("#pool5").attr("disabled","disabled");
                        $("#pool6").attr("disabled","disabled");
                        $("#pool7").attr("disabled","disabled");
                        $("#pool8").attr("disabled","disabled");
                        $("#pool1").val($("#cidr1").val());
                        $("#pool2").val($("#cidr2").val());
                        $("#pool3").val($("#cidr3").val());
                        $("#pool4").val($("#cidr4").val());
                        $("#pool5").val($("#cidr1").val());
                        $("#pool6").val($("#cidr2").val());
                        $("#pool7").val($("#cidr3").val());
                        $("#pool8").val($("#cidr4").val());
                        break;
                    case 3:
                        $("#pool1").attr("disabled","disabled");
                        $("#pool2").attr("disabled","disabled");
                        $("#pool3").attr("disabled","disabled");
                        $("#pool4").removeAttr("disabled");
                        $("#pool5").attr("disabled","disabled");
                        $("#pool6").attr("disabled","disabled");
                        $("#pool7").attr("disabled","disabled");
                        $("#pool8").removeAttr("disabled");
                        $("#pool1").val($("#cidr1").val());
                        $("#pool2").val($("#cidr2").val());
                        $("#pool3").val($("#cidr3").val());
                        $("#pool4").val(_min);
                        $("#pool4").attr("min",_min);
                        //$("#pool4").val("");
                        $("#pool5").val($("#cidr1").val());
                        $("#pool6").val($("#cidr2").val());
                        $("#pool7").val($("#cidr3").val());
                        $("#pool8").val(255-efix);
                        //$("#pool8").val("");
                        $("#pool8").attr("max",255-efix);
                        break;
                    case 2:
                        $("#pool1").attr("disabled","disabled");
                        $("#pool2").attr("disabled","disabled");
                        $("#pool3").removeAttr("disabled");
                        $("#pool4").removeAttr("disabled");
                        $("#pool5").attr("disabled","disabled");
                        $("#pool6").attr("disabled","disabled");
                        $("#pool7").removeAttr("disabled");
                        $("#pool8").removeAttr("disabled");
                        $("#pool1").val($("#cidr1").val());
                        $("#pool2").val($("#cidr2").val());
                        $("#pool3").val(_min);
                        $("#pool4").val(0);
                        //$("#pool3").val("");
                        //$("#pool4").val("");
                        $("#pool5").val($("#cidr1").val());
                        $("#pool6").val($("#cidr2").val());
                        $("#pool7").val(255-efix);
                        $("#pool8").val(255);
                        //$("#pool7").val("");
                        //$("#pool8").val("");
                        //$("#pool7").attr("max",255-efix);


                        break;
                    case 1:
                        $("#pool1").attr("disabled","disabled");
                        $("#pool2").removeAttr("disabled");
                        $("#pool3").removeAttr("disabled");
                        $("#pool4").removeAttr("disabled");
                        $("#pool5").attr("disabled","disabled");
                        $("#pool6").removeAttr("disabled");
                        $("#pool7").removeAttr("disabled");
                        $("#pool8").removeAttr("disabled");
                        $("#pool1").val($("#cidr1").val());
                        $("#pool2").val(_min);
                        $("#pool3").val(0);
                        $("#pool4").val(0);
                        //$("#pool2").val("");
                        //$("#pool3").val("");
                        //$("#pool4").val("");
                        $("#pool5").val($("#cidr1").val());
                        $("#pool6").val(255-efix);
                        //$("#pool6").attr("max",255-efix);
                        $("#pool7").val(255);
                        $("#pool8").val(255);
                        //$("#pool6").val("");
                        //$("#pool7").val("");
                        //$("#pool8").val("");
                        break;
                    case 0:
                        $("#pool1").removeAttr("disabled");
                        $("#pool2").removeAttr("disabled");
                        $("#pool3").removeAttr("disabled");
                        $("#pool4").removeAttr("disabled");
                        $("#pool5").removeAttr("disabled");
                        $("#pool6").removeAttr("disabled");
                        $("#pool7").removeAttr("disabled");
                        $("#pool8").removeAttr("disabled");
                        $("#pool1").val(_min);
                        $("#pool2").val(0);
                        $("#pool3").val(0);
                        $("#pool4").val(0);
                        $("#pool5").val(255-efix);
                        $("#pool5").attr("max",255-efix);
                        $("#pool6").val(255);
                        $("#pool7").val(255);
                        $("#pool8").val(255);
                        //$("#pool1").val("");
                        //$("#pool2").val("");
                        //$("#pool3").val("");
                        //$("#pool4").val("");
                        //$("#pool5").val("");
                        //$("#pool6").val("");
                        //$("#pool7").val("");
                        //$("#pool8").val("");
                        break;
                }
            }
        });
    }

    function pad(num, n) {
        var len = num.toString().length;
        while(len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }

    function pad2(num, n) {
        var len = num.toString().length;
        while(len < n) {
            num = num + "0";
            len++;
        }
        return num;
    }

    //pool的相关操作
    //清空列表
    function clear_pool_list(){
        $(".pool-list").html("");
        $("#allocation_pools").val("");
    }

    //增加pool
    function click_add_pool(){
        $("#btn_add_pool").click(function(){
            if(submitValidation("pool-edit")){
                var li = "<li we='1'><span>" + $("#pool1").val() + "." + $("#pool2").val() + "." + $("#pool3").val() + "." + $("#pool4").val() + "-" + $("#pool5").val() + "." + $("#pool6").val() + "." + $("#pool7").val() + "." + $("#pool8").val() + "</span><span class='label label-danger label-del-pool'>删除</span></li>";
                $(".pool-list").append(li);
            }
            refresh_pool();
        });
    }

    //删除pool
    function click_del_pool(){
        $(document).on("click",".label-del-pool",function(){
            //console.log(100);
            $(this).parent().remove();
            refresh_pool();
        });
    }

    //更新input
    function refresh_pool(){
        $("#allocation_pools").val("");
        $(".pool-list").children().each(function(){
            $("#allocation_pools").val(($("#allocation_pools").val()==""?$("#allocation_pools").val():($("#allocation_pools").val()+"\r\n")) +  $(this).children().eq(0).html().replace('-',','));
        });
    }

    function register_network_type(){
        $(document).on("change","#create_network_network_type",function(){
            $(".show_physical_network [name='physical_network']").val('');
            $(".show_physical_network [name='physical_network']").val('');
            switch($(this).val()){
                case "":
                    $(".show_physical_network,.show_segmentation_id").hide();
                    break;
                case "local":
                    $(".show_physical_network,.show_segmentation_id").hide();
                    break;
                case "flat":
                    $(".show_physical_network").show();
                    $(".show_segmentation_id").hide();
                    break;
                case "vlan":
                    $(".show_physical_network,.show_segmentation_id").show();
                    break;
                case "gre":
                    $(".show_physical_network").hide();
                    $(".show_segmentation_id").show();
                    break;
                case "vxlan":
                    $(".show_physical_network").hide();
                    $(".show_segmentation_id").show();
                    break;
            }
        })
    }
}]);
