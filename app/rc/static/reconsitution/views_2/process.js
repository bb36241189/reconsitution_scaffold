/**
 * Created by shmily on 2017/2/15.
 */

app.controller('ProcessController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    var status_map = {
        cancel: {
            action_approve: "unavailable",
            action_reject: "unavailable",
            action_submit: "unavailable",
            action_cancel: "unavailable"
        },
        wait_for_approve: {
            action_approve: "wait_for_create",
            action_reject: "approve_reject",
            action_submit: "unavailable",
            action_cancel: "unavailable"
        },
        wait_for_create: {
            action_approve: "done",
            action_reject: ["create_reject_user", "create_reject_dept_admin"],
            action_submit: "unavailable",
            action_cancel: "unavailable"
        },
        approve_reject: {
            action_approve: "unavailable",
            action_reject: "unavailable",
            action_submit: "wait_for_approve",
            action_cancel: "cancel"
        },
        create_reject_user: {
            action_approve: "unavailable",
            action_reject: "approve_reject",
            action_submit: "wait_for_create",
            action_cancel: "unavailable"
        },
        create_reject_dept_admin: {
            action_approve: "unavailable",
            action_reject: "unavailable",
            action_submit: "wait_for_create",
            action_cancel: "cancel"
        },
        done: {
            action_approve: "unavailable",
            action_reject: "unavailable",
            action_submit: "unavailable",
            action_cancel: "unavailable"
        }
    };

    function getProcess(status){
        var passed = '<img title="提交环节" src="' + project_url + '/static/images/success.png"/>';
        var reject = '<img title="审批环节" src="' + project_url + '/static/images/error.png"/>';
        var unknown = '<img title="实施环节" style="width:18px;height:18px;" src="' + project_url + '/static/images/question.png"/>';
        var data = {};
        switch(status){
            case "":
                data.process = passed + ">>" + unknown + ">>" + unknown;
                data.style = "warning";
                data.zh_cn = "待提交";
                break;
            case "cancel":
                data.process = reject + ">>" + reject + ">>" + unknown;
                data.style = "danger";
                data.zh_cn = "已取消";
                break;
            case "wait_for_approve":
                data.process = passed + ">>" + unknown + ">>" + unknown;
                data.style = "warning";
                data.zh_cn = "待审批";
                break;
            case "wait_for_create":
                data.process = passed + ">>" + passed + ">>" + unknown;
                data.style = "warning";
                data.zh_cn = "待实施";
                break;
            case "approve_reject":
                data.process = passed + ">>" + reject + ">>" + unknown;
                data.style = "danger";
                data.zh_cn = "驳回";
                break;
            case "create_reject_user":
                data.process = passed + ">>" + passed + ">>" + reject;
                data.style = "danger";
                data.zh_cn = "拒绝实施";
                break;
            case "create_reject_dept_admin":
                data.process = passed + ">>" + passed + ">>" + reject;
                data.style = "danger";
                data.zh_cn = "拒绝实施";
                break;
            case "done":
                data.process = passed + ">>" + passed + ">>" + passed;
                data.style = "success";
                data.zh_cn = "已完成";
                break;
        }
        return data;
    }

    function getActionName(action){
        var name = "";
        var color = "";
        switch(action){
            case "approve":
                name="通过";
                color="green";
                break;
            case "reject":
                name="拒绝";
                color="red";
                break;
            case "submit":
                name="提交";
                color="green";
                break;
            case "cancel":
                name="废除";
                color="red";
                break;
        }
        var obj={};
        obj.name = name;
        obj.color = color;

        return obj;
    }


    $(function () {
        set_navigator();
        initWorkinglist();
        initDonelist();
        getWorkinglist();
        getDonelist();
        initTimer();
        registerCheckBox();

        //server
        register_create_info();
        init_volume_slider();
        register_apply_action();
        register_server_number();
        //volume
        init_slider();




        $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});

    });

    function set_navigator() {
        if ($("#manage").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            $("#manage").removeClass('active');
            $("#manage").addClass('dhbg');
        }
        $(".navbar-words").html("管理 > 流程");
    }

    var timer;
    function initTimer(){
        if(timer){
            clearInterval(timer);
        }
        timer = setInterval(function(){
            getWorkinglist();
            getDonelist();
        },20000);

    }

    function registerCheckBox(){
        $("#apply_server_enable").change(function(){
            if($(this).prop("checked")){
                enable_server_apply(true);
            }
            else{
                enable_server_apply(false);
            }
        });

        $("#apply_volume_enable").change(function(){
            if($(this).prop("checked")){
                enable_volume_apply(true);
            }
            else{
                enable_volume_apply(false);
            }
        });
    }

    function enable_server_apply(enable){
        if(!enable){
            $("#apply_server_name").prop("disabled",true);
            $("#apply_server_image").prop("disabled",true);
            $("#apply_cpu_container").hide();
            $("#apply_ram_container").hide();
            $("#apply_server_disk_container").hide();
            $("#apply_network_select_container").prop("disabled",true);
            $("#apply_server_number").prop("disabled",true);
        }
        else{
            $("#apply_server_name").prop("disabled",false);
            $("#apply_server_image").prop("disabled",false);
            $("#apply_cpu_container").show();
            $("#apply_ram_container").show();
            $("#apply_server_disk_container").show();
            $("#apply_network_select_container").prop("disabled",false);
            $("#apply_server_number").prop("disabled",false);
        }
    }

    function enable_volume_apply(enable){
        if(!enable){
            $("#create_volume_name").prop("disabled",true);
            $("#create_description").prop("disabled",true);
            $("#apply_volume_disk_container").hide();
        }
        else{
            $("#create_volume_name").prop("disabled",false);
            $("#create_description").prop("disabled",false);
            $("#apply_volume_disk_container").show();
        }
    }

    /*
    $('#apply_server_modal').off('show.bs.modal').on('show.bs.modal', function () {
        console.log("show off")
    });
    */

    $scope.show_apply_server_modal = show_apply_server_modal;

    function show_apply_server_modal(resource,status,para,attrs,operate){
        if(operate){
            $("#apply_server_enable").prop("checked",false);
            $("#apply_volume_enable").prop("checked",false);
            enable_server_apply(false);
            enable_volume_apply(false);

            clear_modal_content();
            get_images();
            get_flavors();
            get_network();
            render_server_number();
        }
        var process=getProcess(status);
        $(".apply_action_btn").hide();
        if(status==""){
            //新建状态
            $(".body_apply_right").hide();
            $(".body_apply_left").show();
            $("#btn_next").show();
            $("#btn_previous").hide();
            $("#action_submit").hide();
            $("#apply_detail_id").html("");
            $("#apply_detail_status").html(process.zh_cn);
            $("#apply_detail_process").html(process.process);
            $("#btn_description").hide();
            $("#request_log_tbody").html("");
            $("#request_log").hide();
            $(".process-trangle-wd").html(process.zh_cn);
        }
        else{
            //其它状态
            //详情
            var para = JSON.parse(para);

            $(".show_server").hide();
            $(".show_volume").hide();

            if(resource=="server"){
                $("#apply_show_server_name").html(para.name);
                $("#apply_show_server_number").html(para.max_count);
                $("#apply_show_image_name").html("ID:"+para.source_id);
                $("#apply_show_network").html("ID:"+para.network_id);
                $("#apply_show_vcpus").html("ID:"+para.flavor_id);
                $("#apply_show_ram").html("ID:"+para.flavor_id);
                //请求各个ID
                $.ajax({
                    type: "GET",
                    url: project_url + "/image/" + para.source_id,
                    dataType: "json",
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function (data) {
                        $("#apply_show_image_name").html(data.name);
                    },
                    error: function (e) {
                        SAlert.showError(e);
                    }
                });

                $.ajax({
                    type: "GET",
                    url:project_url + "/network/" + para.network_id,
                    dataType: "json",
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function (data) {
                        $("#apply_show_network").html(data.network_name);
                    },
                    error: function (e) {
                        SAlert.showError(e);
                    }
                });

                $.ajax({
                    type: "GET",
                    url:project_url +  "/flavor/" + para.flavor_id,
                    dataType: "json",
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function (data) {
                        $("#apply_show_vcpus").html(data.vcpus + "核");
                        $("#apply_show_ram").html((data.ram/1024).toFixed(1) + "GB");
                    },
                    error: function (e) {
                        SAlert.showError(e);
                    }
                });


                $("#apply_show_disk").html(para.volume_size + "GB");
                $(".show_server").show();
            }
            if(resource=="volume"){
                $("#apply_show_volume_name").html(para.name);
                $("#apply_show_volume_description").html(para.description);
                $("#apply_show_volume_size").html(para.size + "GB");
                $(".show_volume").show();
            }



            $("#apply_detail_id").html(attrs);
            $("#apply_detail_status").html(process.zh_cn);
            $(".process-trangle-wd").html(process.zh_cn);
            $(".process-trangle-bg")
                .removeClass("process-trangle-success")
                .removeClass("process-trangle-warning")
                .removeClass("process-trangle-danger")
                .addClass("process-trangle-" + process.style);
            $("#apply_detail_process").html(process.process);
            $("#request_log").show();

            //是否可操作
            if(operate){
                $(".body_apply_right").show();
                $(".body_apply_left").hide();
                $("#btn_next").hide();
                $("#btn_previous").hide();
                $("#btn_description").show();

                for(var p in status_map){
                    if(p==status){
                        for(var a in status_map[p]){
                            if(status_map[p][a]!="unavailable"){
                                $("#" + a).show();
                            }
                        }
                        break;
                    }
                }

                //此处有特例，部门管理员自己的申请，会直接跳到第三步，如果被退回，则直接跳到第一步


            }else{
                $(".body_apply_right").show();
                $(".body_apply_left").hide();
                $("#btn_next").hide();
                $("#btn_previous").hide();
                $("#btn_description").hide();
            }
        }
        $("#apply_server_modal").attr("status",status);
        $("#apply_server_modal").modal("show");
    }

    function nextStep(){
        var bool_server = $("#apply_server_enable").prop("checked");
        var bool_volume = $("#apply_volume_enable").prop("checked");
        $(".show_server").hide();
        $(".show_volume").hide();
        if(!(bool_server||bool_volume)){
            return;//没有任何申请
        }
        if(bool_server){
            if(check_create_params()){
                $("#apply_volume_size").val($("#apply_server_volume_size").val());
                $("#apply_show_disk").html($("#apply_server_volume_size").val() + "GB");
                $(".show_server").show();
            }
            else{
                return;//不满足条件
            }
        }
        if(bool_volume){
            var data = getFormObject("#create_volume_form");
            if(check_create_volume_vaild(data)){
                $("#apply_show_volume_name").html($("#create_volume_name").val());
                $("#apply_show_volume_name").attr("volume_name",$("#create_volume_name").val());
                $("#apply_show_volume_description").html($("#create_description").val());
                $("#apply_show_volume_description").attr("volume_description",$("#create_description").val());
                $("#apply_show_volume_size").html($("#create_size").val() + "GB");
                $("#apply_show_volume_size").attr("volume_size",$("#create_size").val());

                $(".show_volume").show();
            }
            else{
                return;
            }
        }

        $(".apply_action_btn").hide();
        $(".body_apply_right").show();
        $(".body_apply_left").hide();
        $("#btn_next").hide();
        $("#btn_previous").show();
        $("#action_submit").show();
        $("#btn_description").show();
    }

    $scope.nextStep = nextStep;

    function previousStep(){
        $(".body_apply_right").hide();
        $(".body_apply_left").show();
        $("#btn_next").show();
        $("#btn_previous").hide();
        $("#action_submit").hide();
        $("#btn_description").hide();
    }

    $scope.previousStep = previousStep;

    function init_volume_slider(){
        $("#apply_volume_size").tooltip();
        var volume_slider = $("#apply_server_volume_size").slider({
            formatter: function (value) {
                return value;
            }
        });

        $("#apply_volume_size").change(function () {
            if ($("#apply_volume_size").val() < 20){
                $("#apply_volume_size").val('20');
            }
            $('#apply_server_volume_size').slider(
                "setValue", parseInt($("#apply_volume_size").val())
            );
        });

        $("#apply_volume_size").keyup(function () {
            $("#apply_volume_size").val($("#apply_volume_size").val().replace(/\D/g, ''));
            if (parseInt($("#apply_volume_size").val()) > 1024) {
                $("#apply_volume_size").val("1024");
            }
            $('#apply_server_volume_size').slider(
                "setValue", parseInt($("#apply_volume_size").val())
            );
        });

        $("#apply_volume_size").bind("paste", function (event) {
            $("#apply_volume_size").val($("#apply_volume_size").val().replace(/\D/g, ''));
            if (parseInt($("#apply_volume_size").val()) > 1024) {
                $("#apply_volume_size").val("1024");
            }
            $('#apply_server_volume_size').slider(
                "setValue", parseInt($("#apply_volume_size").val())
            );
        });

        $("#apply_server_volume_size").off("change").on("change", function(obj){
            $("#apply_volume_size").val(obj.value.newValue);
            $("#apply_show_disk").html(obj.value.newValue + "GB");
        });
        return volume_slider
    }

    function clear_modal_content() {
        $("#apply_server_name").val("");
        simulate_click_previous();
        $("span[type=create_server_navigator]").html("").removeClass("projection_image_style");
        $("[list_type=image_list]").each(function () {
            var bool = $(this).hasClass("warning_list");
            //console.log("clear warning list's bool is:" + bool);
            if ($(this).hasClass("warning_list")) {
                console.log("clear warning list");
                $(this).removeClass("warning_list");
                return false;
            }
        });
        $("#apply_show_vcpus").removeAttr("flavor_id");
        $("#apply_show_network").removeAttr("network_id");
        $("#apply_server_volume_size").slider('setValue', 20);
        $("#apply_volume_size").val(20);
        $("#apply_description").val("");


        $("#create_volume_name").val("");
        $("#create_description").val("");
        $("#apply_server_volume_size").slider('setValue', 1);
    }

    function simulate_click_previous() {
        $("#apply_previous_step").click();
    }

    function get_images() {
        var path = project_url + "/images";
        $.ajax({
            type: "get",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                render_image_list(data);
                select_image();
            },
            error: function (e) {
                SAlert.showError(e)
            }
        });
    }

    function render_image_list(images) {
        /*
        var $image_list_container = $("[type=image_list_container]");
        $image_list_container.html("");
        //console.log(images);
        for (var index = 0; index < images.length; index++) {
            var $imageList = $('<div class="btn_list"></div>');
            $imageList.html(images[index].name);
            $imageList.attr('image_id', images[index].id);
            $imageList.attr('list_type', "image_list");
            $image_list_container.append($imageList);
        }
        */

        $("#apply_server_image").html("<option value=''>--请选择--</option>")
        for(var i=0;i<images.length;i++){
            var unit = "MB";
            var size = images[i].size;
            if(size>1024){
                size = (size/1024).toFixed(1);
                unit = "GB";
            }
            var op = "<option value='" + images[i].id + "'>" + images[i].name + "  (" + size + unit + ")" + "</option>";
            $("#apply_server_image").append(op);
        }
    }

    function select_image() {
        /*
        $("[list_type=image_list]").click(function () {
            var image_id = $(this).attr("image_id");
            var image_name = $(this).html();
            console.log(image_id + " " + image_name);
            $(this).addClass("warning_list").siblings().removeClass("warning_list");
            $("#apply_show_image_name").removeClass("projection_image_style").html(image_name).attr("image_id", image_id);
        })
        */

        $("#apply_server_image").click(function(){
            var image_id = $(this).val();
            var image_name = $(this).find("option:selected").text();
            //$(this).addClass("warning_list").siblings().removeClass("warning_list");
            $("#apply_show_image_name").removeClass("projection_image_style").html(image_name).attr("image_id", image_id);
        });
    }

    function get_flavors() {
        var path =project_url +  "/flavors";
        $.ajax({
            type: "get",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                flavor_module(data);
                render_flavor_list(data);
                select_flavor();
                simulate_flavor_select();
                simulate_flavor_checkbox_click();
            },
            error: function (e) {
                SAlert.showError(e)
            }
        });
    }

    function flavor_module(data) {
        var flavor_map = format_flavor_by_cpu(data);
        render_flavor_template(flavor_map);
        init_flavor_button(flavor_map);
    }

    function sort_by_ram(a, b) {
        return a.ram - b.ram
    }

    function format_flavor_by_cpu(flavors) {
        var flavor_map = {};
        for (var index = 0; index < flavors.length; index++) {
            if (flavor_map[flavors[index].vcpus]) {
                flavor_map[flavors[index].vcpus].push(flavors[index])
            } else {
                flavor_map[flavors[index].vcpus] = [];
                flavor_map[flavors[index].vcpus].push(flavors[index])
            }
        }

        for (var index = 0; index < flavors.length; index++) {
            flavor_map[flavors[index].vcpus].sort(sort_by_ram)
        }

        return flavor_map;
    }

    function render_flavor_template(flavor_map) {
        var $cpu_container = $("#apply_cpu_container");
        var $ram_container = $("#apply_ram_container");
        $cpu_container.html("");
        $ram_container.html("");
        for (var index in flavor_map) {
            var flavors = flavor_map[index];
            var $cpu_item = $('<div class="table_button  general_button"></div>');
            $cpu_item.html(index + "核").attr("cpu_number", index);
            $cpu_container.append($cpu_item);
            for (var flavor in flavors) {
                var flavor_item = flavors[flavor];
                var $ram_item = $('<div class="table_button  general_button hide_ram_button"></div>');
                $ram_item.attr("flavor_id", flavor_item.id);
                $ram_item.attr("ram", flavor_item.ram);
                $ram_item.html(flavor_item.ram / 1024 + "G")
                $ram_container.append($ram_item);
            }
        }
    }

    function init_flavor_button(flavor_map) {
        click_cpu_button(flavor_map);
        click_ram_button();
    }

    function click_cpu_button(flavor_map) {
        $("#apply_cpu_container").children().click(function () {
            //clear content with every click
            $("#apply_ram_container").children().each(function () {
                $(this).addClass("hide_ram_button");
            });

            $(this).addClass("selected").siblings().removeClass("selected");
            var cpu_number = $(this).attr("cpu_number");
            var flavors = flavor_map[cpu_number];
            for (var i = 0; i < flavors.length; i++) {
                $("#apply_ram_container").children().each(function () {
                    if ($(this).attr("flavor_id") == flavors[i].id) {
                        $(this).removeClass("hide_ram_button");
                    }
                });
            }
        })
    }

    function click_ram_button() {
        $("#apply_ram_container").children().click(function () {
            $(this).addClass("selected").siblings().removeClass("selected");
        })
    }

    function render_flavor_list(flavors) {
        var $flavor_container = $("#apply_flavor_select_container");
        $flavor_container.html("");
        $flavor_container.append($('<option clear_flavor="true" selected="selected">请选择：</option>'))
        for (var index=0;index<flavors.length;index++) {
            var $flavorOptions = $('<option></option>');
            $flavorOptions.attr('vcpus', flavors[index].vcpus);
            $flavorOptions.attr('ram', flavors[index].ram);
            $flavorOptions.attr('flavor_id', flavors[index].id);
            $flavorOptions.attr('list_type', "flavor_select");
            $flavorOptions.html(flavors[index].name + "(" + flavors[index].vcpus + "核 /" + flavors[index].ram / 1024 + "G)");
            $flavor_container.append($flavorOptions);
        }
    }

    function select_flavor() {
        $("#apply_flavor_select_container").click(function () {
            var $this = $(this).children('option:selected');
            if ($this.attr('clear_flavor') == 'true') {
                $("#apply_show_vcpus").removeAttr("flavor_id").removeClass("projection_image_style").html("");
                $("#apply_show_ram").removeClass("projection_image_style").html("");
                $("#apply_cpu_container, #apply_ram_container").children("div.selected").removeClass("selected");
            } else {
                var flavor_id = $this.attr("flavor_id");
                $("#apply_show_vcpus").removeClass("projection_image_style").html($this.attr("vcpus") + "核").attr('flavor_id', flavor_id);
                $("#apply_show_ram").removeClass("projection_image_style").html(Number($this.attr("ram")) / 1024 + 'G');
            }
        });
    }

    function simulate_flavor_select() {
        $("#apply_flavor_select_container").click(function () {
            var $this = $(this).children('option:selected');
            if ($this.attr('list_type') == 'flavor_select') {
                var flavor_id = $this.attr("flavor_id");
                var cpu_number = $this.attr("vcpus");
                $("#apply_cpu_container").children().each(function () {
                    var cpu = $(this).attr("cpu_number");
                    if (cpu == cpu_number) {
                        $(this).click();
                    }
                });

                $("div#ram_container:visible").children().each(function () {
                    var _flavor_id = $(this).attr("flavor_id");
                    if (_flavor_id == flavor_id) {
                        $(this).click();
                    }
                });
            }
        })
    }

    function simulate_flavor_checkbox_click() {
        $("#apply_cpu_container").children().bind("click", container_click);
        $("#apply_ram_container").children().bind("click", container_click);
    }

    function container_click() {
        console.log("enter container click");
        console.log("cpu.length>0 " + $("#cpu_container").children(":visible").hasClass("selected"));
        console.log("ram.length>0 " + $("#ram_container").children(":visible").hasClass("selected"));

        if ($("#apply_cpu_container").children(":visible").hasClass("selected") &&
            $("#apply_ram_container").children(":visible").hasClass("selected")) {
            var flavor_id = $("#apply_ram_container").children(":visible.selected").attr("flavor_id");
            console.log("container.click flavor_id is " + flavor_id);
            $("[list_type=flavor_select]").each(function () {
                if ($(this).attr("flavor_id") == flavor_id) {
                    console.log("flavor_name " + $(this).html());
                    $("#apply_flavor_select_container").val($(this).html());
                    $("#apply_show_ram").removeClass("projection_image_style").html($(this).attr("ram") / 1024 + "G");
                    $("#apply_show_vcpus").removeClass("projection_image_style").html($(this).attr("vcpus") + "核").attr("flavor_id", flavor_id);
                }
            })
        } else {
            console.log("enter else branch");
            var select_val = $("#flavor_select_container").children("[clear_flavor=true]").val();
            console.log("select val is " + select_val)
            $("#flavor_select_container").val(select_val);
            $("#show_vcpus").removeClass("projection_image_style").html("").removeAttr("flavor_id");
            $("#show_ram").removeClass("projection_image_style").html("");
        }
    }


    function get_network() {
        var path = project_url + "/networks";
        var params = {
            "router:external": 0
        };

        $.ajax({
            type: "get",
            url: path,
            data: params,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                render_network_list(data);
                select_network();
            },
            error: function (e) {
                SAlert.showError(e)
            }
        });
    }

    function render_network_list(networks) {
        var $network_container = $("#apply_network_select_container");
        $network_container.html("");
        $network_container.append($('<option clean_content="true" selected="selected">请选择：</option>'));
        //console.log("networks:"+networks);
        for (var index=0;index<networks.length;index++) {
            var $networkOptions = $('<option></option>');
            $networkOptions.attr('list_type', "network_select");
            $networkOptions.attr('network_id', networks[index].network_id);
            $networkOptions.attr('network_name', networks[index].network_name);
            $networkOptions.attr('cidr', networks[index].cidr);
            $networkOptions.html(networks[index].network_name + "(" + networks[index].cidr + ")");
            $network_container.append($networkOptions);
        }
    }

    function select_network() {
        $("#apply_network_select_container").change(function () {
            console.log("Enter select network,and this is " + this);
            var $this = $(this).children('option:selected');
            if ($this.attr('clean_content') != undefined) {
                $("#apply_show_network").removeAttr("network_id").removeClass("projection_image_style").html("");
            } else {
                var network_id = $this.attr("network_id");
                var network_name = $this.attr("network_name");
                var cidr = $this.attr("cidr");
                $("#apply_show_network").removeClass("projection_image_style").html(network_name + "(" + cidr + ")")
                    .attr('network_id', network_id);
            }
        });
    }

    function register_apply_action() {
        $("#action_submit").unbind("click");
        $("#action_submit").click(function () {
            create_server();
        });

        $(".apply_action_btn").unbind("click");
        $(".apply_action_btn").click(function(){
            //可能需要进一步校验
            var operation = "";
            switch($(this).attr("id")){
                case "action_approve":
                    operation="approve";
                    break;
                case "action_cancel":
                    operation="cancel";
                    break;
                case "action_submit":
                    operation="submit";
                    break;
                case "action_reject":
                    operation="reject";
                    break;
            }
            var request_id =  $("#apply_detail_id").html();
            if(request_id==""){
                if(operation=="submit"){
                    create_resource();
                }
            }else{
                var request_data = {};
                request_data.operation = operation;
                request_data.description = $("#apply_description").val();
                $.ajax({
                    type: "PUT",
                    url: project_url + "/requests/" + request_id,
                    data: JSON.stringify(request_data),
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function () {
                        getDonelist();
                        getWorkinglist();
                    },
                    error: function (e) {
                        //alert("创建虚拟机请求失败！")
                        SAlert.showError(e);
                    }, complete: function () {
                        $("#apply_server_modal").modal('hide');
                    }
                });
            }
        });
    }

    function create_resource() {
        if ($("#apply_server_enable").prop("checked") && check_create_params()) {
            var name = $("#apply_show_server_name").html();
            var image_id = $("#apply_show_image_name").attr("image_id");
            var flavor_id = $("#apply_show_vcpus").attr("flavor_id");
            var network_id = $("#apply_show_network").attr("network_id");
            var source_id = image_id;
            var count = $("#apply_server_number").val();
            var volume_slider = $("#apply_server_volume_size").slider();
            var volume_size = volume_slider.slider("getValue");
            var description = $("#apply_description").val();

            var request_data = {
                "resource":"server",
                "parameters":{
                    "name":name,
                    "description":'',
                    "source_type":'image_volume',
                    "source_id":source_id,
                    "flavor_id":flavor_id,
                    "network_id":network_id,
                    "max_count":count,
                    "volume_size":volume_size,
                    "delete_on_termination":"true"
                },
                "description":description
            };

            $.ajax({
                type: "POST",
                url:project_url +  "/requests",
                data: JSON.stringify(request_data),
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function () {
                    console.log("Request send success!");
                    getDonelist();
                    getWorkinglist();
                },
                error: function (e) {
                    //alert("创建虚拟机请求失败！")
                    SAlert.showError(e);
                }, complete: function () {
                    $("#apply_server_modal").modal('hide');
                }
            });
        }

        var data = getFormObject("#create_volume_form");
        if($("#apply_volume_enable").prop("checked") && check_create_volume_vaild(data)){
            var name = $("#apply_show_volume_name").attr("volume_name");
            var description = $("#apply_show_volume_description").attr("volume_description");
            var size = $("#apply_show_volume_size").attr("volume_size");

            var request_data = {
                "resource":"volume",
                "parameters":{
                    "name":name,
                    "description":description,
                    "size":size
                }
            };

            if(!check_create_volume_vaild(data)){
                return;
            }
            data.size = volume_size;
            $.ajax({
                type:"POST",
                url:project_url + "/requests",
                data: JSON.stringify(request_data),
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    getDonelist();
                    getWorkinglist();
                },
                error:function(e){
                    SAlert.showError(e)
                },
                complete: function () {
                    $("#apply_server_modal").modal('hide');
                }
            });
        }
    }

    function check_create_params(volume_slider) {
        var flavor_id = $("#apply_show_vcpus").attr("flavor_id");
        var network_id = $("#apply_show_network").attr("network_id");
        var server_number = $("#apply_show_server_number").html();
        var apply_server_image = $("#apply_show_image_name").html();
        console.log(apply_server_image);
        if(apply_server_image==""|apply_server_image=="--请选择--"){
            return false;
        }
        if (!(flavor_id && network_id && server_number)) {
            if (!flavor_id) {
                $("#apply_show_vcpus").html("*请选择合适的配置！*").addClass("projection_image_style");
                $("#show_ram").html("*请选择合适的配置！*").addClass("projection_image_style");
            }

            if (!network_id) {
                $("#apply_show_network").html("*请选择合适的网络！*").addClass("projection_image_style");
            }

            if (!server_number) {
                $("#apply_show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
            }
            return false;
        } else {
            var server_num = Number(server_number);
            console.log("Server number" + server_num);
            if (!(server_num && server_num > 0 && server_num < 11)) {
                $("#apply_show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
                return false
            }
            return true;
        }
    }

    /*
    function next_step() {
        $("#apply_next_step").click(function () {
            if (check_params_on_next()) {
                $("#apply_select_image_li").removeClass('active').attr('aria-expanded', 'false').children().removeClass('active_tab');
                $("#apply_select_conf_li").addClass('active').attr('aria-expanded', 'true').children().addClass('active_tab');
                if (!$("#apply_apply_show_server_number").html()) {

                }
            }
            else {
                return false
            }
        });
        simulate_tab_click();
    }

    function check_params_on_next() {
        var image_name = $("#apply_show_image_name").html();
        var server_name = $("#apply_show_server_name").html();
        if (!image_name || !server_name || image_name == "*请选择镜像！*" || server_name == "*请输入名称！*") {
            console.log("can't be pass to next");
            if (!image_name) {
                $("#apply_show_image_name").html("*请选择镜像！*").addClass("projection_image_style");
            }
            if (!server_name) {
                $("#apply_show_server_name").html("*请输入名称！*").addClass("projection_image_style");
            }
            return false
        }
        else {
            return true
        }
    }

    function previous_step() {
        $("#apply_previous_step").click(function () {
            $("#apply_select_conf_li").removeClass('active').attr('aria-expanded', 'false').children().removeClass('active_tab');
            $("#apply_select_image_li").addClass('active').attr('aria-expanded', 'true').children().addClass('active_tab');
        });
    }
    */

    function register_create_info() {
        get_server_name();
    }

    function get_server_name() {
        $("#apply_server_name").blur(function () {
            var server_name = $("#apply_server_name").val();
            $("#apply_show_server_name").removeClass("projection_image_style").html(server_name);
        });
    }

    function render_server_number() {
        $("#apply_server_number").val(1);
        $("#apply_show_server_number").html(1);
    }

    function register_server_number(){
        $("#apply_server_number").change(function () {
            var server_number = $("#apply_server_number").val();
            if (server_number <= 10 && server_number > 0) {
                $("#apply_show_server_number").html($("#apply_server_number").val()).removeClass("projection_image_style");
            } else {
                $("#apply_show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
            }
        });
    }

    /*
    function simulate_tab_click() {
        $("#apply_select_conf_li").click(function () {
            if (!$("#apply_select_conf_li").hasClass("active")) {
                if (check_params_on_next()) {
                    $("#apply_next_page").click();
                } else {
                    return false;
                }

            }
        });

        $("#apply_select_conf_li").click(function () {
            if (!$("#apply_select_conf_li").hasClass("active")) {
                console.log("click image li")
                $("#apply_last_page").click();
            }
        });
    }
    */

    function initWorkinglist(){
        $(document).on("click","#workinglist tr",function(){
            var this_id = $(this).attr("id");
            var this_para = $(this).attr("para");
            init_request_log(this_id);
            var status = $(this).attr("status");
            var resource = $(this).attr("resource");
            show_apply_server_modal(resource,status,this_para,this_id,true);
        });
    }

    function initDonelist(){
        $(document).on("click","#doneList tr",function(){
            var this_id = $(this).attr("id");
            var this_para = $(this).attr("para");
            init_request_log(this_id);
            var status = $(this).attr("status");
            var resource = $(this).attr("resource");
            show_apply_server_modal(resource,status,this_para,this_id,false);
        });
    }

    //以下为与接口的交互
    function getWorkinglist(){
        var path = project_url + "/requests_todo";
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                workinglist_pagination(data.requests);
            },
            error: function (e) {
                SAlert.showError(e);
            }
        });
    }

    function workinglist_pagination(data) {
        if(data.length){
            $("#workingList_span").show();
            $("#workingList_span").html(data.length);
        }
        else{
            $("#workingList_span").hide();
        }
        var page_num = 12;
        var data_length = data.length;
        if (!data_length || data_length <= page_num) {
            renderWorkinglist(data);
            $("#workinglist_pagination").hide();
            return;
        }
        $("#workinglist_pagination").show();
        //加入分页的绑定
        $("#workinglist_pagination").pagination(data_length, {
            callback: pageselectCallback,
            prev_text: '< 上一页',
            next_text: '下一页 >',
            items_per_page: page_num,
            num_display_entries: 4,
            current_page: 0,
            num_edge_entries: 1
        });
        //这个事件是在翻页时候用的
        function pageselectCallback(page_id, jq) {
            var start = page_id * page_num;
            var end = start + page_num;
            if (end > data_length) {
                end = start + data_length % page_num;
            }
            renderWorkinglist(data.slice(start, end));
        }
    }

    function renderWorkinglist(data){
        var $workinglist = $("#workinglist");
        $workinglist.html("");
        if(data.length){
            for(var i=0;i<data.length;i++){
                for(var i=0;i<data.length;i++){
                    var $table_tr = $("<tr></tr>");
                    $table_tr.attr("id", data[i].id);
                    $table_tr.attr("status",data[i].status);
                    $table_tr.attr("para",data[i].parameters);
                    $table_tr.attr("resource",data[i].resource);
                    var process = getProcess(data[i].status);
                    var user_name = (data[i].user_name==""||data[i].user_name==null)?"已删除":data[i].user_name;
                    var department_name = (data[i].department_name==""||data[i].department_name==null)?"已删除":data[i].department_name;
                    var table_body =
                        '<td><input type="checkbox"></td>' +
                        '<td>' + data[i].create_time + '</td>' +
                        '<td>' + data[i].resource + '</td>' +
                        '<td>' + user_name + '</td>' +
                        '<td>' + department_name + '</td>' +
                        '<td><span class="label label-' + process.style + '">' + process.zh_cn + '</span></td>' +
                        '<td>' + process.process + '</td>';
                    $table_tr.append(table_body);
                    $workinglist.append($table_tr);
                }
            }
        }
        else{
            var $table_tr = $("<tr></tr>");
            $table_tr.append("<td colspan='7'>没有记录</td>");
            $workinglist.append($table_tr);
        }
    }


    function getDonelist(){
        var path = project_url + "/requests_related";
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                done_pagination(data.requests);
            },
            error: function (e) {
                SAlert.showError(e);
            }
        });
    }

    function done_pagination(data) {
        if(data.length){
            $("#doneList_span").show();
            $("#doneList_span").html(data.length);
        }
        else{
            $("#doneList_span").hide();
        }
        var page_num = 12;
        var data_length = data.length;
        if (!data_length || data_length <= page_num) {
            renderDonelist(data);
            $("#donelist_pagination").hide();
            return;
        }
        $("#donelist_pagination").show();
        //加入分页的绑定
        $("#donelist_pagination").pagination(data_length, {
            callback: pageselectCallback,
            prev_text: '< 上一页',
            next_text: '下一页 >',
            items_per_page: page_num,
            num_display_entries: 4,
            current_page: 0,
            num_edge_entries: 1
        });
        //这个事件是在翻页时候用的
        function pageselectCallback(page_id, jq) {
            var start = page_id * page_num;
            var end = start + page_num;
            if (end > data_length) {
                end = start + data_length % page_num;
            }
            renderDonelist(data.slice(start, end));
        }
    }

    function renderDonelist(data){
        var $donelist = $("#doneList");
        $donelist.html("");
        if(data.length){
            for(var i=0;i<data.length;i++){
                for(var i=0;i<data.length;i++){
                    var $table_tr = $("<tr></tr>");
                    $table_tr.attr("id", data[i].id);
                    $table_tr.attr("para",data[i].parameters);
                    $table_tr.attr("status",data[i].status);
                    $table_tr.attr("resource",data[i].resource);
                    var process = getProcess(data[i].status);
                    var user_name = (data[i].user_name==""||data[i].user_name==null)?"已删除":data[i].user_name;
                    var department_name = (data[i].department_name==""||data[i].department_name==null)?"已删除":data[i].department_name;
                    var table_body =
                        '<td><input type="checkbox"></td>' +
                        '<td>' + data[i].create_time + '</td>' +
                        '<td>' + data[i].resource + '</td>' +
                        '<td>' + user_name + '</td>' +
                        '<td>' + department_name + '</td>' +
                        '<td><span class="label label-' + process.style + '">' + process.zh_cn + '</span></td>' +
                        '<td>' + process.process + '</td>';
                        '<td>' + '' + '</td>';
                    $table_tr.append(table_body);
                    $donelist.append($table_tr);
                }
            }
        }
        else{
            var $table_tr = $("<tr></tr>");
            $table_tr.append("<td colspan='7'>没有记录</td>");
            $donelist.append($table_tr);
        }

    }

    function init_request_log(id){
        var path = project_url + "/requests/" + id;
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                render_log_table(data.request_flows);
            },
            error: function (e) {
                SAlert.showError(e);
            }
        });
    }

    function render_log_table(data){
        /*
          "user_id": "d8f80121-bf57-11e5-870d-faf0b0f5bec5",
          "description": "ok",
          "request_id": "3865ba5e-0b7c-11e6-8f1b-68f7287ac8b2",
          "operate_time": "2016-04-27 13:55:42",
          "operation": "reject",
          "department_name": "系统管理",
          "user_name": "admin",
          "id": 4,
          "department_id": "262dffb0-d909-11e5-9325-faf0b0f5bec5"
        */


        /*
        var $request_log = $("#request_log_tbody");
        $request_log.html("");
        for(var i=0;i<data.length;i++){
            var $table_tr = $("<tr></tr>");
            $table_tr.attr("id", data[i].id);
            var department_name = (data[i].department_name==""||data[i].department_name==null)?"已删除":data[i].department_name;
            var user_name = (data[i].user_name==""||data[i].user_name==null)?"已删除":data[i].user_name;

            var table_body =
                '<td>' + data[i].operate_time + '</td>' +
                '<td>' + department_name + '</td>' +
                '<td>' + user_name + '</td>' +
                '<td>' + getActionName(data[i].operation).name + '</td>' +
                '<td>' + (data[i].description==null?"":data[i].description) + '</td>';
            $table_tr.append(table_body);
            $request_log.append($table_tr);
        }
        */


        data = data.reverse();

        $("#process-blocks").html("");
        //长度>3,分多行进行渲染，每行3个
        var current_line;
        var render_length = data.length<3?3:data.length;
        for(var i=0;i<render_length;i++){
            if(i%3==0){
                //新的一行
                current_line = $('<div class="process-margin"></div>');
            }

            var no = i%3;   //0开头 1中间 2结尾
            var op = "";
            var department_name = "";
            var user_name = "";
            var action_name = "";
            var operate_time = "";
            var description = "";
            var tail_class = "";
            if(i<data.length){
                //绿色或红色
                op=getActionName(data[i].operation).color;
                department_name = (data[i].department_name==""||data[i].department_name==null)?"已删除":data[i].department_name;
                user_name = (data[i].user_name==""||data[i].user_name==null)?"已删除":data[i].user_name;
                action_name = getActionName(data[i].operation).name;
                operate_time = data[i].operate_time;
                description = data[i].description==null?"":data[i].description;
            }
            else{
                //灰色
                op="grey";
            }
            var head = '<div class="process-head-' + op + '"></div>';
            var tail = '<div class="process-tail-' + op + '"></div>';
            if(i%3==0){
                head = '';
            }
            if(i%3==2){
                tail = '';
                tail_class = 'process-margin-right';
            }

            var body = '<div class="process-body-' + op + '">'
                            + '<div class="process-circle-' + op + ' ' + tail_class + '">' + (i+1) + '</div>'
                            + '<div class="process-body-text">'
                                + '<p><b>部门：' + department_name + '</b></p>'
                                + '<p>申请人：' + user_name + '</p>'
                                + '<p>操作：' + action_name + '</p>'
                                + '<p>时间：' + operate_time + '</p>'
                                + '<p>附言:<a title="' + description + '">' + (description.length>10?(description.substring(0,10) + '...'):description) + '</a></p>'
                            + '</div>'
                        + '</div>';
            current_line.append(head).append(body).append(tail);
            if(i%3==2||i==(render_length-1)){
                //每行结尾，或者最后一项
                $("#process-blocks").append(current_line);
            }


        }









    }


    //以下为volume云盘
    function init_slider(){
        $('#create_volume_slider').slider({
                formatter: function(value) {
                   return value;
                }
        });

        $('#extend_volume_slider').slider({
                formatter: function(value) {
                   return value;
                }
        });

        $('#create_volume_slider').change(function(obj){
            $("#create_size").val(obj.value.newValue);
        });

        $('#extend_volume_slider').change(function(obj){
            $("#extend_size").val(obj.value.newValue);
        });

        $("#create_size").change(function(){
           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#create_size").keyup(function(){

            $("#create_size").val($("#create_size").val().replace(/\D/g,''));

            if(parseInt($("#create_size").val())> 2000){
                $("#create_size").val("2000");
            }else if(parseInt($("#create_size").val())<1){
                $("#create_size").val("1");
            }

           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#create_size").bind("paste", function(event){

            $("#create_size").val($("#create_size").val().replace(/\D/g,''));

            console.log($("#create_size").val());
            if(parseInt($("#create_size").val())> 2000){
                $("#create_size").val("2000");
            }else if(parseInt($("#create_size").val())<1){
                $("#create_size").val("1");
            }

           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#extend_size").change(function(){
           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

        $("#extend_size").keyup(function(){

            $("#extend_size").val($("#extend_size").val().replace(/\D/g,''));

            if(parseInt($("#extend_size").val())> 2000){
                $("#extend_size").val("2000");
            }else if(parseInt($("#extend_size").val())<1){
                $("#extend_size").val("1");
            }

           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

        $("#extend_size").bind("paste", function(event){

            $("#extend_size").val($("#extend_size").val().replace(/\D/g,''));

            console.log($("#extend_size").val());
            if(parseInt($("#extend_size").val())> 2000){
                $("#extend_size").val("2000");
            }else if(parseInt($("#extend_size").val())<1){
                $("#extend_size").val("1");
            }

           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

    }

    function check_create_volume_vaild(data){
        var name_check = check_name_vaild(data.name, "#create_volume_name_div");
        var desc_check = check_description_vaild(data.description, "#create_volume_description_div");
        var volume_size = $("#create_size").val();
        if(!volume_size){
            display_check_info("#create_size_div", false, "不能为空");
            return false;
        }
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_name_vaild(name, name_div){
        if(name){
            if(name.length>=1 && name.length<=60){
                if(check_name_format(name)){
                    return display_check_info(name_div, true, "")
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
        if(desc.length>255){
            return display_check_info(desc_div, false, "长度范围为0-255个字符");
        }else{
            return display_check_info(desc_div, true, "");
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
            if(name.length>=1 && name.length<=60){
                if(check_name_format(name)){
                    return display_check_info(name_div, true, "")
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

    function check_name_format(name){
        return true;
    }


}]);
