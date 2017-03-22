app.controller('StorageController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    
    $(function () {
        get_all_pools("");
        disabled_button();

        set_navigator();

        click_create_pool();
        click_edit_pool();
        click_delete_pool();
        init_close_button();

        click_submit_create_pool();
        click_submit_edit_pool();
        click_submit_delete_pool();
        click_submit_refresh_pool();
        form_check_event();

        //click_search_pool();
        //keyup_search_pool();

        set_usage_pie();
    });


    var pool_handle_status = ["build", "building", "spawning"];
    var pool_status = {
        recovering: "恢复中",
        healthy: "正常",
        unhealthy: "异常"
    };

    var pool_style={
        recovering: "warning",
        healthy: "success",
        unhealthy: "danger"
    };

    function set_navigator(){
        if ($("#storage_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            });
            $("#storage_resource").removeClass('active');
            $("#storage_resource").addClass('dhbg');
        }
        $(".navbar-words").html("存储资源 > 存储池管理");
    }

    //这个事件是在翻页时候用的
    function table_pagination(data){
            //console.log(data);
            var data_length=data.length;
            var page_num=6;
            if(!data_length || data_length<=page_num){
                render_pool_list(data);
                $("#storage_pagination").hide();
                return;
            }
            $("#storage_pagination").show();
            //加入分页的绑定
            $("#storage_pagination").pagination(data_length, {
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
                render_pool_list(data.slice(start, end));
        }
    }

    function set_pool_default_checked(){
        $("#pool_list").find("tr:eq(0)").addClass("table_body_tr_change");
        var tr_id = $("#pool_list").find("tr:eq(0)").attr("id");

       $("#pool_list").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);
        //console.log(tr_id);
        //init_pool_detail(tr_id);
        enabled_button();
    }

    function get_all_pools(search_name) {
        var path = project_url + "/storage_pools"+"?name="+search_name;
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                //console.log(data);
                table_pagination(data);
            },
            error:function(e){
                SAlert.showError(e)
            }
        });
    }

    function render_pool_list(data) {
        disabled_button();
        clear_detail_data();

        var pools_tbody = $("#pool_list");
        //console.log(data);
        pools_tbody.html("");
        if (data.length) {
            //var pools = data.pools
            var pools = data;
            for (var i = 0;i < pools.length; i++) {
                //console.log(pools[i]);
                var table_tr = $("<tr></tr>");
                //$table_tr.attr("id", pools[i].id);
                table_tr.attr("id", pools[i].poolId);
                table_tr.attr("name", pools[i].poolName);

                var loading = reformat_display(pools[i].status.state);
                if($.inArray(pools[i].status.state,pool_handle_status)>=0){
                    loading = '<div class="loading">'+'</div>'+
                    '<div class="td_status">'+pools[i].status.state+'</div>';
                }
                /*var use_rate = (pools[i].used / pools[i].capacity).toFixed(2);
                console.log(use_rate);
                var used_progress='<div class="progress-bar progress-bar-success" ';
                if(use_rate>=0.8){
                    used_progress='<div class="progress-bar progress-bar-danger" ';
                    console.log("large");
                }
                var using = '<div class="progress total_progress">'+used_progress
                 +'role="progressbar " aria-valuenow='+use_rate*100+
                    ' aria-valuemin="0" aria-valuemax="100"style=width:'+use_rate*100+'%;'+'>'+ '<span >'+use_rate*100+'%'+'</span>'+' </div>'+'</div>';

                var use_data='<div class="use_data">'+pools[i].used + '/' + pools[i].capacity+'</div>';*/
                var table_body =
                    '<td><input type="checkbox"/></td>' +
                    '<td>' + '<a class="animate_name">'+pools[i].poolName + '</a></td>'+
                    '<td><span class="label label-' + pool_style[pools[i].status.state] + '">' + pool_status[pools[i].status.state] + '</span></td>'+
                    '<td>' + pools[i].replication + '</td>'+
                    '<td>' + pools[i].iops + '</td>'+
                    '<td>' + ((pools[i].mbps)/1024).toFixed(2) + '</td>';
                    //'<td item_tag= "pool_name">' + pools[i].name + '</td>' +
                   // '<td>' +using +use_data+ '</td>' +
                    //'<td>' + loading + '</td>'+
                   // '<td>' +pools[i].description+ '</td>'+
                   // '<td>' +pools[i].create_time+ '</td>'+
                    //'<td>' +pools[i].update_time+ '</td>';

                table_tr.append(table_body);
                pools_tbody.append(table_tr);
            }
            //$("#current_num").html(data.length);
            click_pool_table_tr();

            //set_pool_default_checked();

            //pool_interval=setInterval(check_pool_status, 2000);
        }
        else{
            var table_tr = '<tr><td colspan="6">没有数据</td></tr>';
            pools_tbody.append(table_tr);
        }
    }

    function reformat_display(pool_status){
        if (pool_status == 'active'){
            return "可用"
        }
    }

    function click_pool_table_tr() {
        $("#pool_table .animate_name").click(function(e){

            $("#detail_div").stop(true).animate({"right":"-1000px"},function(){
            }).animate({"right":"0px"});

        });

        $("#pool_table tbody tr").click(function (e) {
            if (e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")) {
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
                //clear_detail_data();
            }
            else {
                var checked_trs = $("#pool_table tbody tr");
                checked_trs.each(function () {
                    $(this).removeClass("table_body_tr_change");
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", true);

                get_pool_detail($(this).attr("id"));
                render_perf_num($(this).children());
            }

            if ($("#pool_table tbody tr input:checked").length) {
                enabled_button();
            }
            else {
                disabled_button();
            }

        });
    }

    /*
     Define button init click status
     */

    function render_perf_num(data){
        $("#iops_num").html(data.eq(4).text());
        $("#mbps_num").html(data.eq(5).text());
    }

    function disabled_button() {
        $('#edit_pool').attr('disabled',"disabled").css("cursor", "not-allowed")
            .addClass("disabled_button").removeClass("general_button");

        $('#delete_pool').attr('disabled',"disabled").css("cursor", "not-allowed")
            .addClass("disabled_button").removeClass("danger_button");
    }

    function enabled_button() {
        $("#edit_pool").removeAttr('disabled').css("cursor", "pointer")
            .removeClass("disabled_button").addClass("general_button");

        $("#delete_pool").removeAttr('disabled').css("cursor", "pointer")
            .removeClass("disabled_button").addClass("danger_button");
    }

    function get_pool_detail(pool_id) {
        var root_path = project_url + "/storage_pool_perf";
        var query_path = root_path +"?poolId="+ pool_id+"&fromtime=-1w";
        console.log(query_path);
        $.ajax({
            type: "GET",
            url: query_path,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                if(data.length){
                    render_pool_perf(data);
                }
            },
            error: function(e){
                SAlert.showError(e)
            }
        });

    }

    function getDate(tm){
        var tt = new Date(parseInt(tm)*1000)
            //.toLocaleDateString()
        return tt.toLocaleDateString();
    }

    function render_pool_perf(data){
        //console.log(data);
        var item_data = [];
        var mpbs_data = [];
        for (var i=0;i<data.length;i++){
            item_data.push([parseInt(data[i][0])*1000, data[i][1].toFixed(2)]);
            mpbs_data.push([parseInt(data[i][0])*1000, (data[i][2]/1024).toFixed(2)]);
        }
        //console.log(item_data);
        var iopsChart = echarts.init(document.getElementById('iops'));
        var mbpsChart = echarts.init(document.getElementById('mbps'));

        var iops_option = {
            grid:{
                top: 30,
                left: 50,
                bottom: 40,
                right:30
            },
            color: ['#02cd4e'],
            xAxis: [
                {
                    type: "time",
                    boundaryGap : false,
                    splitNumber: 7,
                    splitLine : {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    type: "value",
                    name: "IOPS",
                    splitNumber: 4
                }
            ],
            series: [
                {
                    type: 'line',
                    showSymbol: false,
                    data: item_data
                }
            ]
        };

        var mbps_option = {
            grid:{
                top: 30,
                left: 60,
                bottom: 40,
                right:30
            },
            color: ['#00acff'],
            xAxis: [
                {
                    type: "time",
                    boundaryGap : false,
                    splitNumber: 7,
                    splitLine : {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    type: "value",
                    name: "MBps",
                    splitNumber: 4
                }
            ],
            series: [
                {
                    type: 'line',
                    showSymbol: false,
                    data: mpbs_data
                }
            ]
        };

        iopsChart.setOption(iops_option);
        window.onresize = iopsChart.resize;

        mbpsChart.setOption(mbps_option);
        window.onresize = mbpsChart.resize;
    }

    function clear_detail_data() {
        //var $servers = $("#pool_info");
        //$servers.html("");
         $("#detail_div").animate({"right":"-1000px"});
    }

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_detail_data()});
    }

    function click_create_pool(){
        $("#add_pool").click(function(){
            $("#submit_create_pool").addClass("form_general_button");
            $("#submit_create_pool").removeClass("disabled_button");
            $("#submit_create_pool").removeAttr("disabled");

            $("#create_pool_name").val("");
            $("#create_pool_description").val("");

            $("#create_pool_name_div").children(".desc").addClass("hide");
            $("#create_pool_description_div").children(".desc").addClass("hide");
        });
    }

    function click_edit_pool(){
        $("#edit_pool").click(function(){
            $("#submit_edit_pool").addClass("form_general_button");
            $("#submit_edit_pool").removeClass("disabled_button");
            $("#submit_edit_pool").removeAttr("disabled");

            var pool_name = $("#pool_table tbody tr input[type=checkbox]:checked").parents("tr").attr("name");
            $("#edit_pool_name").val(pool_name);
            $("#edit_pool_name_div").children(".desc").addClass("hide");
        });
    }

    function click_delete_pool(){
        $("#delete_pool").click(function(){
            $("#submit_delete_pool").addClass("form_danger_button");
            $("#submit_delete_pool").removeClass("disabled_button");
            $("#submit_delete_pool").removeAttr("disabled");
        });
    }

    function click_submit_create_pool(){
        $("#submit_create_pool").click(function(){
            var pool_data = getFormObject("#create_pool_form");
            var replicate_num = $("#replicate_num").val();
            pool_data.replicate_num = replicate_num;
            //console.log(pool_data);
            if(!check_create_pool_form(pool_data)){
                return
            }
            $.ajax({
                type:"POST",
                url:project_url + "/storage_pools",
                data: JSON.stringify(pool_data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    $("#create_pool_modal").modal('hide');
                    get_all_pools("");
                    //location.reload()
                },
                error:function(e){
                    //alert("创建失败");
                    $("#create_pool_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_create_pool").addClass("disabled_button");
            $("#submit_create_pool").removeClass("form_general_button");
            $("#submit_create_pool").attr("disabled", "disabled");
        });
    }

    function click_submit_edit_pool(){
        $("#submit_edit_pool").click(function(){
            var pool_data = getFormObject("#edit_pool_form");
            var pool_id = $("#pool_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var pool_name = $("#pool_table tbody tr input[type=checkbox]:checked").parents("tr").attr("name");
            //var new_pool_name = pool_data.name;

            //console.log(pool_data);
            if(!check_edit_pool_form(pool_data)){
                return
            }
            var data = {
                "pool_name" : pool_name,
                "new_pool_name" : pool_data.name
            };
            //console.log(data);
            $.ajax({
                type:"PUT",
                url:project_url + "/storage_pools/"+pool_id,
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    $("#edit_pool_modal").modal('hide');
                    get_all_pools("");
                    //location.reload()
                },
                error:function(e){
                    $("#edit_pool_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_edit_pool").addClass("disabled_button");
            $("#submit_edit_pool").removeClass("form_general_button");
            $("#submit_edit_pool").attr("disabled", "disabled");
        });
    }

    function click_submit_delete_pool(){
        $("#submit_delete_pool").click(function(){
            //var pool_id = $("#pool_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var pool_name = $("#pool_table tbody tr input[type=checkbox]:checked").parents("tr").attr("name");
            //console.log(pool_name);
            $.ajax({
                type:"DELETE",
                url:project_url + "/storage_pools/"+pool_name,
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //$("#delete_pool_modal").modal('hide');
                    //get_all_pools("");
                    //init_storage_info();
                    location.reload();
                },
                error:function(e){
                    $("#delete_pool_modal").modal('hide');
                    //alert("更新失败");
                    SAlert.showError(e)
                }
            });

            $("#submit_delete_pool").addClass("disabled_button");
            $("#submit_delete_pool").removeClass("form_danger_button");
            $("#submit_delete_pool").attr("disabled", "disabled");
        });
    }

    function click_submit_refresh_pool(){
        $("#refresh_pool").click(function(){
            get_all_pools("");
        });
    }

    function init_edit_pool_form(data){
        $("#edit_pool_description").val(data.description);
    }

    function check_create_pool_form(data){
        var name_check=check_name_vaild(data.name, "#create_pool_name_div")
        var desc_check=check_description_vaild(data.description,"#create_pool_description_div")

        if(name_check&&desc_check){
            return true;
        }
        else{
            return false;
        }
    }

    function check_edit_pool_form(data){
        var name_check=check_name_vaild(data.name, "#edit_pool_name_div")
        //var desc_check=check_description_vaild(data.description,"#edit_pool_description_div")

        if(name_check){
            return true;
        }
        else{
            return false;
        }
    }

    function form_check_event(){
        $("#create_pool_name").blur(function(){
            var input_name = $("#create_pool_name").val();
            check_name_vaild(input_name, "#create_pool_name_div");
        });

        $("#edit_pool_name").blur(function(){
            var input_name = $("#edit_pool_name").val();
            check_name_vaild(input_name, "#edit_pool_name_div");
        });

        $("#create_pool_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#create_pool_description").blur(function(){
           var input_desc = $("#create_pool_description").val();
            check_description_vaild(input_desc, "#create_pool_description_div");
        });

        $("#edit_pool_description").blur(function(){
           var input_desc = $("#edit_pool_description").val();
            check_description_vaild(input_desc, "#edit_pool_description_div");
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
                    if(check_name_exist(name)){
                        return display_check_info(name_div, false, "存储池名称已经存在，无法使用");
                    }
                    else{
                        return display_check_info(name_div, true, "");
                    }

                }else{
                    return display_check_info(name_div, false, "名称由3-60个小写字母或数字组成");
                }
            }else{
                return display_check_info(name_div, false, "名称长度为3-60个字符");
            }

        }else{
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_name_format(name){

        var rep_str = /^[a-z][a-z0-9]+$/g;
        if(rep_str.test(name)){
            //console.log("true");
            return true;
        }
        else{
            //console.log("false");
            return false;
        }

    }

    function check_description_vaild(desc, desc_div){
        if(desc.length>1000){
            return display_check_info(desc_div, false, "长度范围为0-1000个字符");
        }else{
            return display_check_info(desc_div, true, "");
        }
    }

    function check_name_exist(value){
        var is_exist="";
        $.ajax({
            type: "GET",
            url:project_url +  "/storage_pools",
            async: false,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data);
                if(data.length){
                    for(var i=0; i<data.length;i++){
                        if(data[i].poolName == value){
                            is_exist = true;
                            break;
                        }
                    }
                }
            },
            error: function(e){
                is_exist=true;
                SAlert.showError(e)
            }
        });
        return is_exist
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

    function keyup_search_pool(){
        $("#search_pool_input").keyup(function(){
            //console.log($("#search_pool_input").val());
            get_all_pools($("#search_pool_input").val());
        });
    }

    function click_search_pool(){
        $("#search_pool_img").click(function(){
            get_all_pools($("#search_pool_input").val());
        });
    }


    function set_usage_pie() {

        var labelTop = {
            normal: {
                color: '#000',
                label: {
                    show: true,
                    position: 'center',
                    formatter: '{b}',
                    textStyle: {
                        baseline: 'bottom',
                        fontSize: 14,
                        color: '#000'
                    }
                },
                labelLine: {
                    show: false
                }
            }
        };

        var labelBottom = {
            normal: {
                color: '#dadada',
                label: {
                    show: true,
                    position: 'center'
                },
                labelLine: {
                    show: false
                }
            },
        };

        function init_storage_info() {
            $.ajax({
                type: "GET",
                url: project_url + "/storage_pool_info",
                async: true,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    //console.log(data);
                    render_storage_info(data)
                },
                error: function (e) {
                    //console.log(e);
                    SAlert.showError(e);
                }
            });
        }

        init_storage_info();

        var StoragelabelFromatter = {
            normal: {
                label: {
                    formatter: function () {
                        return '剩余空间';
                    },
                    textStyle: {
                        baseline: 'top',
                        fontSize: 12,
                        color: '#000'
                    }
                }
            },
        };

        var radius = ['92%', '100%'];

        function set_pie_option(used_storage, remain_storage, storage_unit) {
            //console.log(remain_storage);

            var usage_option = {
                calculable: false,
                series: [
                    {
                        type: 'pie',
                        hoverAnimation: false,
                        center: ['50%', '50%'],
                        radius: radius,
                        itemStyle: StoragelabelFromatter,
                        data: [
                            {
                                value: remain_storage,
                                name: remain_storage + storage_unit,
                                itemStyle: labelTop
                            },
                            {value: used_storage, name: '已使用', itemStyle: labelBottom}
                        ]
                    }
                ]
            };

            var usageChart = echarts.init(document.getElementById('use_pie'));
            usageChart.setOption(usage_option);

            window.onresize = usageChart.resize;

        }

        function render_storage_info(data) {
            var total_storage = (data.capacity.capacity_bytes) / 1024 / 1024 / 1024  //GB
            var used_storage = (data.capacity.used_bytes) / 1024 / 1024 / 1024
            //console.log(total_storage);
            //console.log(used_storage);
            if (total_storage >= 1024) {
                $("#total_storage").html((total_storage / 1024).toFixed(1) + "TB");
                $("#used_storage").html((used_storage / 1024).toFixed(1) + "TB");
                set_pie_option((used_storage / 1024).toFixed(1), ((total_storage - used_storage) / 1024).toFixed(1), "T");
            } else {
                $("#total_storage").html((total_storage).toFixed(1) + "GB");
                $("#used_storage").html((used_storage).toFixed(1) + "GB");
                set_pie_option(used_storage, total_storage - used_storage, "GB");
            }

            $("#ok_nodes").html(data.node_status.ok);
            $("#down_nodes").html(data.node_status.down);
            $("#total_nodes").html(data.node_status.total);

            //$("#storage_num").html(data.pool_status.length);
            //$("#lun_num").html(data.lun_status.length);
            $("#total_storages").html(data.pool_status.length);

        }
    }
}]);
