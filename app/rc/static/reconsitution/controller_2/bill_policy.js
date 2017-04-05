/**
 * Created by shmily on 2017/2/16.
 */

app.controller('Bill_policyController',['$scope','$http','SAlert','PermitStatus',function ($scope,$http,SAlert,PermitStatus) {
    $(function(){
        set_navigator();
        disabled_policy_button();
        disabled_price_button();

        init_policy_table();

        click_close_button();
        click_edit_policy();
        click_edit_price();
        click_create_policy();
        click_refresh_policy();

        submit_edit_price();
        submit_create_policy();
        submit_edit_policy();
        submit_delete_policy();
    });

    var price_resource = {
        "server": "云主机",
        "volume": "云硬盘"
    };

    var type_unit = {
        "server": "元/小时",
        "volume":  "元/(G*H)"
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
        $(".navbar-words").html("消费管理 > 计费策略");
    }

    function price_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            render_price_table(data);
            $("#price_pagination").hide();
            return;
        }
        $("#price_pagination").show();
        //加入分页的绑定
        $("#price_pagination").pagination(data_length, {
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
            render_price_table(data.slice(start, end));
        }
    }

    function policy_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            render_policy_table(data);
            $("#policy_pagination").hide();
            return;
        }
        $("#policy_pagination").show();
        //加入分页的绑定
        $("#policy_pagination").pagination(data_length, {
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
            render_policy_table(data.slice(start, end));
        }
    }

    function disabled_policy_button(){
        $('#delete_policy').attr('disabled',"disabled");
        $("#delete_policy").addClass("disabled_button");
        $("#delete_policy").removeClass("danger_button");

        $('#edit_policy').attr('disabled',"disabled");
        $("#edit_policy").addClass("disabled_button");
        $("#edit_policy").removeClass("general_button");

    }

    function disabled_price_button(){
        $('#delete_price').attr('disabled',"disabled");
        $("#delete_price").addClass("disabled_button");
        $("#delete_price").removeClass("danger_button");

        $('#edit_price').attr('disabled',"disabled");
        $("#edit_price").addClass("disabled_button");
        $("#edit_price").removeClass("general_button");

    }

    function recover_policy_button(){
        $('#delete_policy').removeAttr('disabled');
        $('#delete_policy').addClass("danger_button");
        $("#delete_policy").removeClass("disabled_button");

        $('#edit_policy').removeAttr('disabled');
        $('#edit_policy').addClass("general_button");
        $("#edit_policy").removeClass("disabled_button");

    }

    function recover_price_button(){
        $('#delete_price').removeAttr('disabled');
        $('#delete_price').addClass("danger_button");
        $("#delete_price").removeClass("disabled_button");

        $('#edit_price').removeAttr('disabled');
        $('#edit_price').addClass("general_button");
        $("#edit_price").removeClass("disabled_button");

    }

    function init_policy_table(){
        $.ajax({
            type: "GET",
            url: project_url + "/price_schemes",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data);
                //render_policy_table(data.price_schemes);
                policy_table_pagination(data.price_schemes);
            },
            error: function(e){
                SAlert.showError(e);
            }
        });
    }

    function clear_detail_data(){
        $(".detail_div").animate({"right":"-1000px"});
    }

    function click_policy_table_tr(){
        $("#policy_table .animate_name").click(function(){
            var this_id = $(this).parent().parent().attr("id");
            $(".detail_div").stop(true).animate({"right":"-1000px"},function(){

            }).animate({"right":"0px"});
            get_policy_detail(this_id);
        });

        $("#policy_table tbody tr").click(function(e){
            if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_trs = $("#policy_table tbody tr");
                checked_trs.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                $(this).addClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", true);
            }

            if (checked_table_tr("#policy_table")){
                recover_policy_button();
            }
            else{
                disabled_policy_button();
            }
        });

    }

    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        if (checked_tr.length) {
            return true;
        }
        else {
            return false;
        }
    }

    function click_price_table_tr(){
        $("#price_table tbody tr").click(function(){
            if($(this).hasClass("table_body_tr_change")){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_trs = $("#price_table tbody tr");
                checked_trs.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                $(this).addClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", true);
            }

            if (checked_table_tr("#price_table")){
                recover_price_button();
            }
            else{
                disabled_price_button();
            }
        });
    }

    function render_policy_table(data){
        disabled_policy_button();

        var policy = $("#policy_tbody");
        clear_table_body("#policy_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                var status = "";
                if (data[i].active == 1){
                    status = "使用中";
                }else{
                    status = "未使用";
                }
                var table_body = '<td><input type="checkbox"/></td>'+
                    '<td>'+'<a class="animate_name">'+data[i].name+'</a></td>' +
                    '<td>'+status+'</td>'+
                    '<td>'+data[i].create_time+'</td>'+
                    '<td>'+data[i].update_time+ '</td>';

                table_tr.append(table_body);
                policy.append(table_tr);
            }
            click_policy_table_tr();
        }
        else{
            var table_tr = '<tr><td colspan="5">没有数据</td></tr>';
            policy.append(table_tr);
        }
    }

    function click_close_button(){
        $("#btn_close_detail").click(function(){clear_detail_data()});
    }

    function click_create_policy(){
        $("#add_policy").click(function(){
             $.ajax({
            type: "GET",
            url: project_url + "/flavors",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                console.log(data);
                render_flavor(data);
                //render_price_table(data.prices);
                //price_table_pagination(data.prices);
            },
            error: function(e){
                $("#create_policy_modal").modal("hide");
                SAlert.showError(e);
            }
        });
        });
    }

    function render_flavor(data){
        var flavors = $("#flavor_price");
        flavors.html("");
        if(data.length){
            for(var i=0; i<data.length;i++){
                var flavor =  $('<div class="price_conf"></div>');
                var mem="";
                if(data[i].ram>=1024){
                    mem = (data[i].ram /1024)+"G";
                }else{
                    mem = data[i].ram + "MB"
                }
                var price_type = '<div class="price_type">'+data[i].vcpus+"vcpus"+mem+'</div>';
                var price_num = '<div class="price_num">'+ '<input type="number" value="0" min="0" step="0.001" ' +
                    'class="machine-name conf_input" name='+data[i].id+'>'+
                    "元/小时"+ '</div>';
                flavor.append(price_type);
                flavor.append(price_num);

                flavors.append(flavor);
            }
        }else{
            $("#flavor_price").html("没有配置项，请设置套餐!");
        }

    }

    function click_edit_policy(){
        $("#edit_policy").click(function(){
            var tds = $("#policy_table tbody tr input[type=checkbox]:checked").parents("tr").children("td");
            $("#edit_name").val(tds.eq(1).text());

            if(tds.eq(2).text() == "使用中"){
                $("#edit_active").prop("checked", true);
            }else{
                $("#edit_active").prop("checked", false);
            }
            //console.log(tds.eq(1).text());
        });

    }

    function click_edit_price(){
        $("#edit_price").click(function(){
            var tds = $("#price_table tbody tr input[type=checkbox]:checked").parents("tr").children("td");
            $("#current_price").val(tds.eq(3).text());
            $("#new_price").val("0");
        });
    }

    function click_refresh_policy(){
        $("#refresh_policy").click(function(){
            init_policy_table();
        });
    }

    function submit_edit_price(){
        $("#submit_edit_price").click(function(){
            var prices = {};
            var new_price = $("#new_price").val();
            var price_id = $("#price_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var policy_id = $("#policy_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            prices[price_id] = new_price;
            //console.log(prices);

            $.ajax({
                type:"PUT",
                url:project_url + "/prices",
                data: JSON.stringify({"prices":prices}),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(){
                    $("#edit_price_modal").modal('hide');
                    get_policy_detail(policy_id);
                    //location.reload();
                },
                error:function(e){
                    $("#edit_price_modal").modal('hide');
                    SAlert.showError(e);
                }
            });
        });
    }

    function submit_create_policy(){
        $("#submit_create_policy").click(function(){
            var data = getFormObject("#create_policy_form");
            //console.log(data);
            if(!submitValidation("create_policy_form")){
                return;
            }
            var prices = {};
            var volume_prices=[];
            prices['name'] = data.name;
            delete data.name;
            volume_prices.push({"price": data['system'], "type": "system"});
            delete data.system;
            volume_prices.push({"price": data['data'], "type": "data"});
            delete data.data;
            prices['volume_prices'] = volume_prices;
            prices['server_prices'] = get_flavor_prices(data);
            console.log(prices);
            $.ajax({
                type:"POST",
                url:project_url + "/price_schemes",
                data: JSON.stringify(prices),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    location.reload();
                },
                error:function(e){
                    $("#create_policy_modal").modal('hide');
                    SAlert.showError(e);
                }
            });

            //$("#submit_create_tag").addClass("disabled_button");
            //$("#submit_create_tag").removeClass("form_general_button");
            //$("#submit_create_tag").attr("disabled", "disabled");

        });
    }

    function submit_edit_policy(){
         $("#submit_edit_policy").click(function(){
             var data = getFormObject("#edit_policy_form");
             var policy_id = $("#policy_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");

             if(!submitValidation("edit_policy_form")){
                return;
            }
             if($("#edit_active").prop("checked")){
                data.active = 1;
            }else{
                data.active = 0;
            }
             console.log(data);
             $.ajax({
                type:"PUT",
                url:project_url + "/price_schemes/"+policy_id,
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    location.reload();
                },
                error:function(e){
                    $("#edit_policy_modal").modal('hide');
                    SAlert.showError(e);
                }
            });

             //$("#submit_create_tag").addClass("disabled_button");
             //$("#submit_create_tag").removeClass("form_general_button");
             //$("#submit_create_tag").attr("disabled", "disabled");

        });
    }

    function submit_delete_policy(){
        $("#submit_delete_policy").click(function(){
            var policy_id = $("#policy_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");

            $.ajax({
                type:"DELETE",
                url:project_url + "/price_schemes/"+policy_id,
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    //$("#delete_tag_modal").modal('hide');
                    location.reload()
                },
                error:function(e){
                    $("#delete_policy_modal").modal('hide');
                    SAlert.showError(e);
                }
            });

        });
    }

    function get_flavor_prices(data){
        var server_prices = [];
        for(var key in data){
            server_prices.push({"price":data[key], "type":key});
        }
        return server_prices
    }

    function get_policy_detail(policy_id){
        //console.log(policy_id);

        $.ajax({
            type: "GET",
            url: project_url + "/price_schemes/"+policy_id,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data);
                //render_price_table(data.prices);
                price_table_pagination(data.prices);
            },
            error: function(e){
                SAlert.showError(e);
            }
        });
    }

    function render_price_table(data){
       disabled_price_button();

        var price = $("#price_tbody");
        clear_table_body("#price_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                var table_body = '<td><input type="checkbox"/></td>'+
                    '<td>'+price_resource[data[i].resource]+'</td>' +
                    '<td>'+data[i].type+'</td>'+
                    '<td>'+parseFloat(data[i].price)+type_unit[data[i].resource]+ '</td>';

                table_tr.append(table_body);
                price.append(table_tr);
            }
            click_price_table_tr();
        }
        else{
            var table_tr = '<tr><td colspan="4">没有数据</td></tr>';
            price.append(table_tr);
        }
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
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

