/**
 * Created by shmily on 2017/2/15.
 */
    
app.controller('RequestController',['$scope','$http','SAlert','PermitStatus',function ($scope,$http,SAlert,PermitStatus) {
    $(function () {
    set_navigator();
    initWorkinglist();
    getWorkinglist();
    initTimer();

    //server
    init_volume_slider();
    //volume
    init_slider();

    registerSubmit();
    registerTab();
    registerCategory();
    $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});
});

function registerTab(){
    $("[type='radio'][name='requestType']").change(function(){
        $("#tab_type2").hide();
        $("#tab_type3").hide();
        $("#" + $("[type='radio'][name='requestType']:checked").val()).show();
    });

    $("[type='radio'][name='resourceType']").change(function(){
        $("#resource_type1").hide();
        $("#resource_type2").hide();
        $("#" + $("[type='radio'][name='resourceType']:checked").val()).show();
    });
}

function registerSubmit(){
    if($("#apply_requster").length){
        $.ajax({
            type:"GET",
            url:project_url + "/users",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success:function(d){
                var data = JSON.parse(d);
                $("#apply_requster").html("<option value=''>自己</option>");
                for(var i=0;i<data.length;i++){
                    var op = "<option value='" + data[i].id + "'>" + data[i].user_name + "</option>";
                    $("#apply_requster").append(op);
                }
            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                $("#apply_server_modal").modal('hide');
            }
        });
    }

    function readServerInput(request_data){
        request_data.payload.image_name=$("#apply_server_image").find("option:selected").text();
        request_data.payload.cpu=$("#apply_show_vcpus").html();
        request_data.payload.memory=$("#apply_show_ram").html();
        var network_name_cidr = $("#apply_network_select_container").find("option:selected");
        request_data.payload.network_name=network_name_cidr.attr("network_name");
        request_data.payload.cidr=network_name_cidr.attr("cidr");
        request_data.resource = "server";

        var name = $("#apply_server_name").val();
        var image_id = $("#apply_server_image").val();
        var flavor_id = $("#apply_show_vcpus").attr("flavor_id");
        var network_id = $("#apply_network_select_container").find("option:selected").attr("network_id");
        var source_id = image_id;
        var count = $("#apply_server_number").val();
        var volume_slider = $("#apply_server_volume_size").slider();
        var volume_size = volume_slider.slider("getValue");
        var description = $("#apply_server_description").val();

        request_data.parameters={
                "name":name,
                "description":description,
                "source_type":'image_volume',
                "source_id":source_id,
                "flavor_id":flavor_id,
                "network_id":network_id,
                "max_count":count,
                "volume_size":volume_size,
                "delete_on_termination":"true"
            };
    }

    function readVolumeInput(request_data){
        request_data.resource="volume";

        var name = $("#create_volume_name").val();
        var description = $("#create_volume_description").val();
        var size = $("#create_volume_size").val();

        request_data.parameters={
                "name":name,
                "descritpion":description,
                "size":size
            };
    }

    function readAccidentInput(request_data){
        request_data.payload.category=$("#create_problem_category").find("option:selected").text();
        request_data.payload.subcategory=$("#create_problem_subcategory").find("option:selected").text();
        request_data.payload.item=$("#create_problem_item").find("option:selected").text();
    }

    $("#action_submit").click(function(){
        var request_data = {};
        request_data.payload={};
        request_data.payload.priority = $("#apply_priority").val();
        request_data.payload.subject = $("#apply_subject").val();
        request_data.payload.description = $("#apply_description").val();
        if(request_data.subject==""){
            alert("请填写主题!");
            return;
        }
        if($("#apply_requster").length){
            request_data.payload.requester = $("#apply_requster").val();
        }
        var request_type = $("[type='radio'][name='requestType']:checked").val();
        var resource_type =  $("[type='radio'][name='resourceType']:checked").val();
        switch(request_type){
            case "tab_type2":
                switch(resource_type){
                    case "resource_type0":
                        request_data.request_type="common";
                        break;
                    case "resource_type1":
                        request_data.request_type="resource";
                        readServerInput(request_data);
                        break;
                    case "resource_type2":
                        request_data.request_type="resource";
                        readVolumeInput(request_data);
                        break;
                    default :
                        request_data.request_type="common";
                        break;
                }
                break;
            case "tab_type3":
                request_data.request_type="accident";
                readAccidentInput(request_data);
                break;
            default :
                alert("请选择请求类型");
                return;
                break;
        }

        $.ajax({
            type:"POST",
            url:project_url + "/sdp_requests",
            data:JSON.stringify(request_data),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success:function(){

            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                getWorkinglist();
                $("#apply_server_modal").modal('hide');
            }
        });
    });
}

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
    $(".navbar-words").html("管理 > 请求");
}

var timer;
function initTimer(){
    if(timer){
        clearInterval(timer);
    }
    timer = setInterval(function(){
        getWorkinglist();
    },20000);

}

function show_apply_server_modal(resource,status,para,attrs,operate){
    if(operate){
        clear_modal_content();
        get_images();
        get_flavors();
        get_network();
        render_server_number();
    }
    if(status==""){

    }
    else{

    }

    $("[type='radio'][name='requestType']").change();
    $("[type='radio'][name='resourceType']").change();

    $("#apply_server_modal").attr("status",status);
    $("#apply_server_modal").modal("show");
}

    $scope.show_apply_server_modal = show_apply_server_modal;

function init_volume_slider(){
    var volume_slider = $("#apply_server_volume_size").slider({
        formatter: function (value) {
            return value;
        }
    });

    $("#apply_server_volume_size").off("change").on("change", function(obj){
        $("#apply_volume_size").val(obj.value.newValue);
        $("#apply_show_disk").html(obj.value.newValue + "GB");
    });
    return volume_slider
}

function clear_modal_content() {
    $("#apply_server_name").val("");
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
    $("#create_volume_name").val("");
    $("#create_description").val("");
    $("#apply_server_volume_size").slider('setValue', 1);
}

function get_images() {
    $.ajax({
        type: "get",
        url: project_url + "/images",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_image_list(data);
            select_image();
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_image_list(images) {
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
    $("#apply_server_image").click(function(){
        var image_id = $(this).val();
        var image_name = $(this).find("option:selected").text();
        //$(this).addClass("warning_list").siblings().removeClass("warning_list");
        $("#apply_show_image_name").removeClass("projection_image_style").html(image_name).attr("image_id", image_id);
    });
}

function get_flavors() {
    $.ajax({
        type: "get",
        url: project_url +  "/flavors",
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
            alert_error(e)
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
    var params = {
        "router:external": 0
    };

    $.ajax({
        type: "get",
        url: project_url + "/networks",
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
            alert_error(e)
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
            console.log("Subnet" + network_name + " id is " + network_id);
            $("#apply_show_network").removeClass("projection_image_style").html(network_name + "(" + cidr + ")")
                .attr('network_id', network_id);
        }
    });
}

function render_server_number() {
    $("#apply_server_number").val(1);
}

function initWorkinglist(){
    $(document).on("click","#workinglist tr",function(){
        var this_id = $(this).attr("id");
        $.ajax({
            type: "GET",
            url: project_url + "/sdp_requests/" + this_id,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                var commonAttr = [
                    {"label":"模板","attr":"requesttemplate"},

                    {"label":"创建者","attr":"createdby"},
                    {"label":"创建日","attr":"createdtime"},
                    {"label":"状态","attr":"status"},
                    {"label":"优先级","attr":"priority"},
                    {"label":"工作组","attr":"group"},
                    {"label":"技术员","attr":"technician"}
                ];
                var specialAttr;
                var rc_server_attr = [
                    {"label":"云主机名称","attr":"云主机名称"},
                    {"label":"镜像名称","attr":"镜像名称"},
                    {"label":"cpu","attr":"cpu"},
                    {"label":"内存","attr":"内存"},
                    {"label":"系统盘大小","attr":"系统盘大小"},
                    {"label":"网络名称","attr":"网络名称"},
                    {"label":"网络地址段","attr":"网络地址段"},
                    {"label":"主机数","attr":"主机数"}
                ];
                var rc_volume_attr = [
                    {"label":"云盘名称","attr":"云盘名称"},
                    {"label":"云盘容量","attr":"云盘容量"}
                ];
                var Default_Request = [
                    {"label":"影响","attr":"impact"},
                    {"label":"级别","attr":"level"},
                    {"label":"紧急度","attr":"urgency"},
                    {"label":"分类","attr":"category"},
                    {"label":"子分类","attr":"subcategory"},
                    {"label":"条目","attr":"item"},
                    {"label":"解决的日期","attr":"resolvedtime"},
                    {"label":"请求人","attr":"requester"}
                ];
                var rc_common_attr = [];
                /*
                for(var i=0;i<commonAttr.length;i++){
                    $("#view_" + commonAttr[i].attr).html(data.request[commonAttr[i].attr]);
                }
                */
                $("#view_title").html("主题: " + data.request["subject"]);
                $("#view_description").html(data.request["description"]);

                switch(data.request["requesttemplate"]){
                    case "RC_server":
                        specialAttr = rc_server_attr;
                        $("#view_RC_server").show();
                        break;
                    case "RC_volume":
                        specialAttr = rc_volume_attr;
                        $("#view_RC_volume").show();
                        break;
                    case "RC_common":
                        specialAttr = rc_common_attr;
                        break;
                    case "Default Request":
                        specialAttr = Default_Request;
                        $("#view_default_request").show();
                        break;
                }
                function drawTable(tableName,array){
                    var first = true;
                    var tr;
                    $("#" + tableName).html("");
                    for(var i=0;i<array.length;i++){
                        if(first){
                            tr = $("<tr></tr>");
                            tr.append("<th>" + array[i].label + "</th><td>" + (data.request[array[i].attr]==undefined?"未指派":data.request[array[i].attr]) + "</td>");
                            if(i==array.length-1){
                                tr.append("<th></th><td></td>");
                                $("#" + tableName).append(tr);
                            }
                            first = false;
                        }
                        else{
                            tr.append("<th>" + array[i].label + "</th><td>" + (data.request[array[i].attr]==undefined?"未指派":data.request[array[i].attr]) + "</td>");
                            $("#" + tableName).append(tr);
                            first = true;
                        }
                    }
                }

                drawTable("view_table1",commonAttr);
                drawTable("view_table2",specialAttr);
                $("#view_apply_modal").modal("show");
            },
            error: function (e) {
                alert_error(e);
            }
        });
    });
}

//以下为与接口的交互
function getWorkinglist(){
    $.ajax({
        type: "GET",
        url: project_url + "/sdp_requests",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            workinglist_pagination(data.requests);
        },
        error: function (e) {
            alert_error(e);
        }
    });
}

var current_page = 0;
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
    current_page = data_length>(page_num*(current_page))?current_page:0;
    $("#workinglist_pagination").pagination(data_length, {
        callback: pageselectCallback,
        prev_text: '< 上一页',
        next_text: '下一页 >',
        items_per_page: page_num,
        num_display_entries: 4,
        current_page: current_page,
        num_edge_entries: 1
    });
    //这个事件是在翻页时候用的
    function pageselectCallback(page_id, jq) {
        current_page = page_id;
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
                var table_body =
                    '<td><input type="checkbox"></td>' +
                    '<td>' + data[i].id + '</td>' +
                    '<td>' + data[i].subject + '</td>' +
                    '<td>' + data[i].requester + '</td>' +
                    '<td>' + data[i].status + '</td>' +
                    '<td>' + data[i].create_time + '</td>' +
                    '<td>' + data[i].priority + '</td>' +


                    '<td>' + data[i].description + '</td>';
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
        $("#create_volume_size").val(obj.value.newValue);
    });

    $('#extend_volume_slider').change(function(obj){
        $("#extend_size").val(obj.value.newValue);
    });

    $("#create_volume_size").change(function(){
       $('#create_volume_slider').slider(
            "setValue", parseInt($("#create_volume_size").val())
        );
    });

    $("#create_volume_size").keyup(function(){

        $("#create_volume_size").val($("#create_volume_size").val().replace(/\D/g,''));

        if(parseInt($("#create_volume_size").val())> 2000){
            $("#create_volume_size").val("2000");
        }else if(parseInt($("#create_volume_size").val())<1){
            $("#create_volume_size").val("1");
        }

       $('#create_volume_slider').slider(
            "setValue", parseInt($("#create_volume_size").val())
        );
    });

    $("#create_volume_size").bind("paste", function(event){

        $("#create_volume_size").val($("#create_volume_size").val().replace(/\D/g,''));

        console.log($("#create_volume_size").val());
        if(parseInt($("#create_volume_size").val())> 2000){
            $("#create_volume_size").val("2000");
        }else if(parseInt($("#create_volume_size").val())<1){
            $("#create_volume_size").val("1");
        }

       $('#create_volume_slider').slider(
            "setValue", parseInt($("#create_volume_size").val())
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
    var volume_size = $("#create_volume_size").val();
    if(!volume_size){
        display_check_info("#create_volume_size_div", false, "不能为空");
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

function alert_error(e) {
    if (e.status == 401) {
        SAlert.alertError("登录超时");
        location.href = project_url + "/logout?next=" + project_url + "/app/server";
    } else if (e.status >= 400 && e.status < 500) {
        SAlert.alertError(e.responseJSON.error.message);
    }
    else {
        SAlert.alertError("服务器出错");
        //SAlert.alertError(e.responseJSON.error.message)
    }
}

function registerCategory(){
    var category_id = "create_problem_category";
    var subcategory_id = "create_problem_subcategory";
    var item_id = "create_problem_item";
    $.ajax({
        type: "get",
        url: project_url + "/sdp_category",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            for(var i=0;i<data.categories.length;i++){
                var op = "<option value='" + data.categories[i].id + "'>" + data.categories[i].name + "</option>";
                $("#" + category_id).append(op);
            }
        },
        error: function (e) {

        }
    });
    $("#" + category_id).change(function(){
        var _category = $(this).val();
        $("#" + subcategory_id).html("");
        $.ajax({
            type: "get",
            url: project_url + "/sdp_subcategory/category/" + _category,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                for(var i=0;i<data.subcategories.length;i++){
                    var op = "<option value='" + data.subcategories[i].id + "'>" + data.subcategories[i].name + "</option>";
                    $("#" + subcategory_id).append(op);
                }
                $("#" + subcategory_id).change();
            },
            error: function (e) {

            }
        });
    });
    $("#" + subcategory_id).change(function(){
        $("#" + item_id).html("");
        var _subcategory = $(this).val();
        if(_subcategory==null){
            return;
        }
        $.ajax({
            type: "get",
            url: project_url + "/sdp_item/subcategory/" + _subcategory,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                for(var i=0;i<data.items.length;i++){
                    var op = "<option value='" + data.items[i].id + "'>" + data.items[i].name + "</option>";
                    $("#" + item_id).append(op);
                }
            },
            error: function (e) {

            }
        });
    });
}





}]);
