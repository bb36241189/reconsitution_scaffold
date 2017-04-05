/**
 * Created by shmily on 2017/3/23.
 */
app.controller('serverController',['$scope','SAlert','$q','PermitStatus','$timeout','ServerService','UtilService','PermitStatus',function ($scope,SAlert,$q,PermitStatus,$timeout,ServerService,UtilService,PermitStatus) {

    $scope.data = {
        PermitStatus : PermitStatus
    };
    var server_interval = [];
var server_handle_status = ["创建中", "删除中", "重启中", "开机中", "关机中", "挂起中", "暂停中",
    "挂起恢复中", "暂停恢复中", "冷迁移中", "热迁移中", "确认中", "修改配置中", "调整中", "磁盘准备中",
    "克隆中"];
var server_static_status = {"active":"server_on","stopped":"server_off","error":"server_error", "suspended":"suspended"};
var server_status = {
    'active': "运行中",
    'building': "创建中",
    'spawning': "创建中",
    'error': "错误",
    'deleting': "删除中",
    'reboot_started_hard': "硬重启中",
    'reboot_started': "软重启中",
    'stopped': "关机",
    'suspending': "挂起中",
    'suspended': "已挂起",
    'resuming': "挂起恢复中",
    'pausing': "暂停中",
    'paused': "已暂停",
    'unpausing': "暂停恢复中",
    'powering-on': "开机中",
    'powering-off': "关机中",
    'offline_migrating': "冷迁移中",
    'migrating': "热迁移中",
    'resize_prep': '调整中',
    'resize_migrating': '调整中',
    'resize_migrated': '调整中',
    'resize_finish': '调整中',
    'resized': '确认中',
    'verify_resize': "确认中",
    'resizing': "修改配置中",
    'block_device_mapping': "磁盘准备中",
    'cloning': "克隆中",
    'rebooting': "重启中"
};

var permission_action = {
    "delete":["all"],
    "edit":["all"],
    "reboot":["active","stopped"],
    "console":["active"],
    "resize":["active","stopped"],
    "start":["stopped"],
    "stop":["active"],
    "suspend":["active"],
    "resume":["suspended"]
}

var confirm_array = [];

/*
 Register get_all_servers to render server list tables
 */

$(function () {
    get_all_servers("");
    register_init_edit_server();
    disabled_button();

    set_navigator();

    click_search_server();
    keyup_search_server();
    registerTagButton();
    click_bind_tag();
    click_clone_server();
    click_backup_server();
    getTags();
    click_tag_dropdown();
    submit_clone_server();
    submit_backup_server();
    set_export_href();

    registerServerAuthority();
    registerCloneAuthority();
});

function set_export_href() {
    var export_url = project_url + "/export/export_server/";
    $("#export_record").attr("href", export_url);
}

function set_navigator() {
    if ($("#compute_resource").hasClass('active')) {
        var lis = $('#demo1').children("li");
        lis.each(function () {
            $(this).addClass('active');
            $(this).removeClass('dhbg');
        })
        //console.log("has");
        $("#compute_resource").removeClass('active');
        $("#compute_resource").addClass('dhbg');
        //console.log($('#demo1:not(this)').children("li"));
    }
    $(".navbar-words").html("计算资源 > 虚拟机管理");

    //$("#compute_resource .sub-menu").css("display", "block");
}

//这个事件是在翻页时候用的
function table_pagination(data) {
    //console.log(data);
    var data_length = data.length;
    var page_num = 10;
    if (!data_length || data_length <= page_num) {
        render_server_list(data);
        $("#Pagination").hide();
        return;
    }
    $("#Pagination").show();
    //加入分页的绑定
    $("#Pagination").pagination(data_length, {
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
        render_server_list(data.slice(start, end));
    }
}

function set_server_default_checked() {
    $("#server_list").find("tr:eq(0)").addClass("table_body_tr_change");
    var tr_id = $("#server_list").find("tr:eq(0)").attr("id");

    $("#server_list").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);
    //console.log(tr_id);
    enabled_button();
}

var public_server_list = [];
function get_all_servers(search_name) {
    $.ajax({
        type: "GET",
        url: project_url + "/servers" + "?name=" + search_name,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            public_server_list = data.servers;
            table_pagination(data.servers);

        },
        error: function (e) {
            console.log("error");
            alert_error(e);
        }
    });
}

function render_server_list(data) {
    disabled_button();

    var $servers = $("#server_list");
    $servers.html("");
    if (data.length) {
        var servers = data;
        //console.log(servers);
        for (var i = 0, l = servers.length; i < l; i++) {
            var $table_tr = $("<tr></tr>");
            $table_tr.attr("id", servers[i].id);

            //标签
            var span = '<br/>';
            for(var j=0;j<servers[i].tags.length;j++){
                span += '<span class="' + servers[i].tags[j].color + '_bg span_color">'+servers[i].tags[j].name+'</span> ';
                $table_tr.addClass("_tag_" + servers[i].tags[j].id);
            }

            var status;
            if(servers[i].status == "error"){
                status = servers[i].status
            }else if(servers[i].task_state){
                status = servers[i].task_state
            }else{
                status = servers[i].status
            }

            var current_status = server_status[status];
            var loading = current_status;
            if ($.inArray(current_status, server_handle_status) >= 0) {
                loading = '<div class="loading_gif">' +
                    '<img src="' + project_url + '/static/images/loading.gif" />' + " " + current_status + '</div>';
            }
            if(server_static_status[status]!=undefined){
                loading = '<img title="' + current_status + '" src="' + project_url + '/static/images/single/' + server_static_status[status] + '.png"/>';
            }

            var host_name = "暂无";
            if (servers[i].host_name) {
                host_name = servers[i].host_name;
                $table_tr.attr("host_name", host_name)
            }

            var virtulization_type = "暂无";
            if (servers[i].type) {
                virtulization_type = servers[i].type;
            }

            var image_name = "暂无";
            if (servers[i].image_name) {
                image_name = servers[i].image_name;
            }

            $table_tr.attr("status",servers[i].status);
            var server_ip = format_server_ip(servers[i]);
            var ram = servers[i]['ram'] / 1024.0;
            var os_img = "";
            switch(servers[i].os_type){
                case "linux":
                    os_img = "linux.png";
                    break;
                case "windows":
                    os_img = "windows.png";
                    break;
                default:
                    os_img = "unknown.png";
                    break;
            }
            var table_body =
                '<td><input type="checkbox"/></td>' +
                '<td item_tag= "server_name">' + '<a class="load_content" href="' + project_url + '/app/server/' + servers[i].id + '">' +
                servers[i].name + '</a>' + span + '</td>' +
                '<td vcpu=\"' + servers[i].vcpus + '\" ' + 'title=\"' + servers[i].vcpus +
                '核\"' + '>' + servers[i].vcpus + '核' + '</td>' +
                '<td ram=\"' + servers[i]['ram'] + '\" ' + 'title=\"' + ram +
                'G\"' + '>' + ram + 'G' + '</td>' +
                '<td title="' + server_ip.text + '">' + server_ip.html + '</td>' +
                '<td title=' + image_name + '><img width="20px" height="20px" src="' + project_url + '/static/images/operation_system/'+ os_img + '"/> ' + image_name + '</td>' +
                '<td title=' + host_name + '>' + host_name + '</td>' +
                '<td title' + virtulization_type + '>' + virtulization_type + '</td>' +
                '<td title' + servers[i].department_name + '>' + servers[i].department_name + '</td>' +
                '<td title=' + current_status + '>' + loading + '</td>';
            $table_tr.append(table_body).attr("vcpu", servers[i].vcpus).attr("ram", servers[i].ram).attr("disk", servers[i].disk)
                                        .attr("tenant_id", servers[i].tenant_id);
            $servers.append($table_tr);
        }
        //$("#current_num").html(data.length);
        click_server_table_tr();

        //set_server_default_checked();
        if (server_interval.length == 0) {
            var handle = setInterval(check_server_status, 5000);
            //console.log("server create handle:"+handle);
            server_interval.push(handle);
        }
        //console.log("server interval array:"+server_interval);
        //register_async();
    }
    else {
        var table_tr = '<tr><td colspan="10">没有虚拟机</td></tr>';
        $servers.append(table_tr);
    }
}

function format_server_ip(server){
    var fsi = {};
    fsi.html = "";
    fsi.text = "";
    if(server.network_info){
        var networks = JSON.parse(server.network_info);
        //console.log(networks);
        for(var i=0; i<networks.length;i++){
            var network = networks[i];
            //console.log(network);
            for(var j in network){
                var ip = "";
                if (network[j].fixed_ip){
                    ip += ''+network[j].fixed_ip+'';
                }
                if (network[j].fixed_ip && network[j].floating_ip){
                    ip += ">";
                }
                if(network[j].floating_ip){
                    ip += ''+network[j].floating_ip+'';
                }
                fsi.html += '<li>' + ip + '</li>';
                fsi.text += ip + "\r\n";
            }
        }
        return fsi;
    }else{
        return "暂无"
    }
}

function click_server_table_tr() {
    $("#server_table tbody tr").unbind("click").bind("click", function () {
        //console.log("click a tbody row");
        if ($(this).hasClass("table_body_tr_change")) {
            $(this).removeClass("table_body_tr_change");
            //$(this).children("td").eq(0).find("input").css('display', 'none');
            $(this).children("td").eq(0).find("input").prop("checked", false);
        }
        else {
            var checked_trs = $("#server_table tbody tr");
            checked_trs.each(function () {
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });

            $(this).addClass("table_body_tr_change");
            //$(this).children("td").eq(0).find("input").css('display', 'block');
            $(this).children("td").eq(0).find("input").prop("checked", true);

        }

        //console.log("whether been checked: " + $("#server_table tbody tr input:checked").length);
        if ($("#server_table tbody tr input:checked").length) {
            enabled_button($(this).attr("status"));
        }
        else {
            disabled_button();
        }

    });
}

function register_init_edit_server() {
    $("#edit_server_modal").off('show.bs.modal').on('show.bs.modal', function () {
        var $servers_td = $("#server_table tbody tr input:checked");
        var server_id = $servers_td.closest('tr').attr('id');
        init_server_detail(server_id)
    })
}

function init_server_detail(server_id) {
    var root_path = project_url + "/servers/";
    var query_path = root_path + server_id;
    $.ajax({
        type: "GET",
        url: query_path,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            $("#machine_name").val(data.server.name);
            $("#server_description").val(data.server.description);
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

/*
 Register button click event
 */
$(function () {
    register_server_action();
    register_refresh_list();
    register_delete_servers();
    register_edit_server();
    register_migrate_server();
    register_choose_migrate_type();
});

function register_server_action() {
    $("[action-type=server_action]").unbind("click").bind('click', function () {
        var $servers_td = $("#server_table tbody tr input:checked");
        for (var i = 0; i < $servers_td.length; i++) {
            //console.log("Server action is " + $(this).attr("action"));
            //console.log("Server ID is " + $($servers_td[i]).closest('tr').attr('id'));
            serverAction($(this).attr("action"), $($servers_td[i]).closest('tr').attr('id'))
        }
    })
}

function serverAction(action, server_id) {

    var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
    var state = $server_tr.children().eq(8).html();
    var name = $server_tr.children().eq(1).html();

    if (action == "start" && state == "运行中") {
        SAlert.alertError("虚拟机：" + name + "已经处于运行状态！")
    } else if (action == "stop" && state == "关机") {
        SAlert.alertError("虚拟机：" + name + "已经处于关机状态！")
    } else {
        var action_map = {
            'start': "start",
            'console': "get_vnc_console",
            'stop': "stop",
            'hard_reboot': "reboot",
            'suspend': "suspend",
            'resume': "resume"
        };
        var request_data = {
            "id": server_id,
            "action": action_map[action]
        };

        if (action == "console") {
            request_data['type'] = 'novnc';
        }

        if (action == "hard_reboot") {
            request_data['type'] = "HARD"
        }

        if (action == "soft_reboot") {
            request_data['type'] = "SOFT"
        }

        ServerService.postActionServers(request_data).success(function (data) {
            //console.log("in success");
            if (action == 'console') {
                render_vnc_url(data);
                refresh_server_list();
            }
        }).error(function (e) {
            SAlert.showError(e)
        });
    }
}

function render_vnc_url(data) {
    var url = data.console.url;
    $("#vnc_console_display").attr("href", url).attr("target", "_blank");
    document.getElementById('vnc_console_display').click();
    $("#vnc_console_display").removeAttr("href").removeAttr("target");
}

function register_refresh_list() {
    $("#refresh_web").click(function () {
        get_all_servers("");
        disabled_button();
    })
}

function register_delete_servers() {
    $("[action-type=server_life_circle][action=delete]").click(function () {
        delete_servers();
    })
}

function delete_servers() {
    var root_path = project_url + "/servers/";
    var $servers_td = $("#server_table tbody tr input:checked");
    for (var i = 0; i < $servers_td.length; i++) {
        //console.log("Delete servers id is :  " + $($servers_td[i]).closest('tr').attr('id'));
        var server_id = $($servers_td[i]).closest('tr').attr('id');
        var query_path = root_path + server_id;
        //console.log("Server delete query_path is " + query_path);
        $.ajax({
            type: "DELETE",
            url: query_path,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                refresh_server_list()
            },
            error: function (e) {
                alert_error(e)
            }
        });
    }
}

function refresh_server_list() {
    $("#refresh_web").click();
}

/*
 Define button init click status
 */
function disabled_button() {
    $('#startup_server').attr('disabled', "disabled");
    $("#startup_server").css("cursor", "not-allowed");
    $("#startup_server").addClass("disabled_button");
    $("#startup_server").removeClass("general_button");

    $('#console_server').attr('disabled', "disabled");
    $("#console_server").css("cursor", "not-allowed");
    $("#console_server").addClass("disabled_button");
    $("#console_server").removeClass("general_button");


    $('#delete_server').removeAttr('data-target');
    $('#delete_server').addClass("disabled_li");
    $("#delete_server").removeClass("danger_li");

    $('#tag_server').removeAttr('data-target');
    $("#tag_server").addClass("disabled_li");
    $("#tag_server").removeClass("dropmenu_li");

    $('#edit_server').removeAttr('data-target');
    $("#edit_server").addClass("disabled_li");
    $("#edit_server").removeClass("dropmenu_li");

    $('#stop_server').removeAttr('data-target');
    $("#stop_server").addClass("disabled_li");
    $("#stop_server").removeClass("dropmenu_li");

    $('#restart_server').removeAttr('data-target');
    $("#restart_server").addClass("disabled_li");
    $("#restart_server").removeClass("dropmenu_li");

    $('#migrate_server').removeAttr('data-target');
    $("#migrate_server").addClass("disabled_li");
    $("#migrate_server").removeClass("dropmenu_li");

    $('#config_server').removeAttr('data-target');
    $("#config_server").addClass("disabled_li");
    $("#config_server").removeClass("dropmenu_li");

    $('#server_interface').removeAttr('data-target');
    $("#server_interface").addClass("disabled_li");
    $("#server_interface").removeClass("dropmenu_li");

    $('#floating_ip').removeAttr('data-target');
    $("#floating_ip").addClass("disabled_li");
    $("#floating_ip").removeClass("dropmenu_li");

    $('#snapshot').removeAttr('data-target');
    $("#snapshot").addClass("disabled_li");
    $("#snapshot").removeClass("dropmenu_li");

    $('#clone').removeAttr('data-target');
    $("#clone").addClass("disabled_li");
    $("#clone").removeClass("dropmenu_li");

    $('#backup').removeAttr('data-target');
    $("#backup").addClass("disabled_li");
    $("#backup").removeClass("dropmenu_li");

    $('#resume_server').removeAttr('data-target');
    $("#resume_server").addClass("disabled_li");
    $("#resume_server").removeClass("dropmenu_li");

    $('#suspend_server').removeAttr('data-target');
    $("#suspend_server").addClass("disabled_li");
    $("#suspend_server").removeClass("dropmenu_li");
}

Array.prototype.contains = function(item){
    for(i=0;i<this.length;i++){
        if(this[i]==item){return true;}
    }
    return false;
};

function checkPermissionAction(actionName,status){
    if(permission_action[actionName]==undefined){
        //没做限制，则默认允许
        return true;
    }
    if(permission_action[actionName].contains(status)||permission_action[actionName].contains("all")){
        return true;
    }
    else{
        return false;
    }
}

function enabled_button(status) {
    if(checkPermissionAction("start",status)){
        $("#startup_server").removeAttr('disabled');
        $("#startup_server").css("cursor", "pointer");
        $("#startup_server").removeClass("disabled_button");
        $("#startup_server").addClass("general_button");
    }else{
        $('#startup_server').attr('disabled', "disabled");
        $("#startup_server").css("cursor", "not-allowed");
        $("#startup_server").addClass("disabled_button");
        $("#startup_server").removeClass("general_button");
    }

    if(checkPermissionAction("console",status)){
        $("#console_server").removeAttr('disabled');
        $("#console_server").css("cursor", "pointer");
        $("#console_server").removeClass("disabled_button");
        $("#console_server").addClass("general_button");
    }else{
        $('#console_server').attr('disabled', "disabled");
        $("#console_server").css("cursor", "not-allowed");
        $("#console_server").addClass("disabled_button");
        $("#console_server").removeClass("general_button");
    }

    if(checkPermissionAction("delete",status)){
        $("#delete_server").attr('data-target', "#delete_server_modal");
        $("#delete_server").addClass("danger_li");
        $("#delete_server").removeClass("disabled_li");
    }else{
        $('#delete_server').removeAttr('data-target');
        $('#delete_server').addClass("disabled_li");
        $("#delete_server").removeClass("danger_li");
    }

    if (checkPermissionAction("suspend", status)) {
        $("#suspend_server").attr('data-target', "#suspend_server_modal");
        $("#suspend_server").addClass("dropmenu_li");
        $("#suspend_server").removeClass("disabled_li");
    } else {
        $('#suspend_server').removeAttr('data-target');
        $('#suspend_server').addClass("disabled_li");
        $("#suspend_server").removeClass("dropmenu_li");
    }

  if (checkPermissionAction("resume", status)) {
        $("#resume_server").attr('data-target', "#resume_server_modal");
        $("#resume_server").addClass("dropmenu_li");
        $("#resume_server").removeClass("disabled_li");
    } else {
        $('#resume_server').removeAttr('data-target');
        $('#resume_server').addClass("disabled_li");
        $("#resume_server").removeClass("dropmenu_li");
    }

    $("#tag_server").attr('data-target', "#tag_server_modal");
    $("#tag_server").addClass("dropmenu_li");
    $("#tag_server").removeClass("disabled_li");

    if(checkPermissionAction("edit",status)){
        $("#edit_server").attr('data-target', "#edit_server_modal");
        $("#edit_server").addClass("dropmenu_li");
        $("#edit_server").removeClass("disabled_li");
    }else{
        $('#edit_server').removeAttr('data-target');
        $("#edit_server").addClass("disabled_li");
        $("#edit_server").removeClass("dropmenu_li");
    }

    if(checkPermissionAction("stop",status)){
        $("#stop_server").attr('data-target', "#stop_server_modal");
        $("#stop_server").addClass("dropmenu_li");
        $("#stop_server").removeClass("disabled_li");
    }else{
        $('#stop_server').removeAttr('data-target');
        $("#stop_server").addClass("disabled_li");
        $("#stop_server").removeClass("dropmenu_li");
    }

//
//    $("#stop_server").attr('data-target', "#stop_server_modal");
//    $("#stop_server").addClass("dropmenu_li");
//    $("#stop_server").removeClass("disabled_li");

    if(checkPermissionAction("reboot",status)){
        $("#restart_server").attr('data-target', "#restart_server_modal");
        $("#restart_server").addClass("dropmenu_li");
        $("#restart_server").removeClass("disabled_li");
    }
    else{
        $('#restart_server').removeAttr('data-target');
        $("#restart_server").addClass("disabled_li");
        $("#restart_server").removeClass("dropmenu_li");
    }


    $("#migrate_server").attr('data-target', "#migrate_server_modal");
    $("#migrate_server").addClass("dropmenu_li");
    $("#migrate_server").removeClass("disabled_li");

    if(checkPermissionAction("resize",status)){
        $('#config_server').attr('data-target', "#config_server_modal");
        $("#config_server").addClass("dropmenu_li");
        $("#config_server").removeClass("disabled_li");
    }else{
        $('#config_server').removeAttr('data-target');
        $("#config_server").addClass("disabled_li");
        $("#config_server").removeClass("dropmenu_li");
    }

    $('#server_interface').attr('data-target', "#server_interface_modal");
    $("#server_interface").addClass("dropmenu_li");
    $("#server_interface").removeClass("disabled_li");

    $('#floating_ip').attr('data-target', "#floating_ip_modal");
    $("#floating_ip").addClass("dropmenu_li");
    $("#floating_ip").removeClass("disabled_li");

    $('#snapshot').attr('data-target', "#snapshot_modal");
    $("#snapshot").addClass("dropmenu_li");
    $("#snapshot").removeClass("disabled_li");

    $('#clone').attr('data-target', "#clone_modal");
    $("#clone").addClass("dropmenu_li");
    $("#clone").removeClass("disabled_li");

    $('#backup').attr('data-target', "#backup_server_modal");
    $("#backup").addClass("dropmenu_li");
    $("#backup").removeClass("disabled_li");
}


/*
 Modal hook function
 */
$(function () {
    $('[button_type=close_button]').click(function () {
        refresh_server_list();
    });
});

/*
 Create server model relative function
 */

$('#create_server_modal').off('show.bs.modal').on('show.bs.modal', function () {
    init_volume_slider();
    clear_modal_content();
    get_images();
    get_flavors();
    get_network();
    get_billPolicy();
    get_keypair();
    get_availability_zone();
    register_create_server();
});

function init_volume_slider(){
    $("#volume_size").tooltip();
    var volume_slider = $("#server_volume_size").slider({
        formatter: function (value) {
            return value;
        }
    });

    $("#volume_size").change(function () {
        if ($("#volume_size").val() < 20){
            $("#volume_size").val('20');
        }
        $('#server_volume_size').slider(
            "setValue", parseInt($("#volume_size").val())
        );
    });

    $("#volume_size").keyup(function () {
        $("#volume_size").val($("#volume_size").val().replace(/\D/g, ''));
        if (parseInt($("#volume_size").val()) > 1024) {
            $("#volume_size").val("1024");
        }
        $('#server_volume_size').slider(
            "setValue", parseInt($("#volume_size").val())
        );
    });

    $("#volume_size").bind("paste", function (event) {
        $("#volume_size").val($("#volume_size").val().replace(/\D/g, ''));
        if (parseInt($("#volume_size").val()) > 1024) {
            $("#volume_size").val("1024");
        }
        $('#server_volume_size').slider(
            "setValue", parseInt($("#volume_size").val())
        );
    });


    $("#server_volume_size").off("change").on("change", function(obj){
        $("#volume_size").val(obj.value.newValue);
        $("#show_disk").html(obj.value.newValue + "GB");
        var prices = JSON.parse($("#create_server_modal").attr("prices"));
        var this_price = 0;
        for(var i=0;i<prices.length;i++){
            if(prices[i].type=="system"){
                this_price = prices[i].price;
                break;
            }
        }
        $("#show_disk_bill").html((parseFloat(this_price)*obj.value.newValue).toFixed(3) + "元/时");
        calculateSumBill();
    });

    return volume_slider
}

function calculateSumBill(){
    var flavor_bill = $("#show_flavor_bill").html()==""?0:parseFloat($("#show_flavor_bill").html());
    var disk_bill = $("#show_disk_bill").html()==""?0:parseFloat($("#show_disk_bill").html());
    $("#show_sum_bill").html((flavor_bill+disk_bill).toFixed(3) + "元/时");
}

function clear_modal_content() {
    $("#server_name").val("");
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
    $("#show_vcpus").removeAttr("flavor_id");
    $("#show_network").removeAttr("network_id");

    $("#server_volume_size").slider('setValue', 20);
    $("#volume_size").val(20);
}

function initVolumeBill(prices){
    var volume_slider = $("#server_volume_size").slider();
    var volume_size = volume_slider.slider("getValue");
    for(var i=0;i<prices.length;i++){
        if(prices[i].type=="system"){
            this_price = prices[i].price;
            break;
        }
    }
    $("#show_disk").html(volume_size + "GB");
    $("#show_disk_bill").html((parseFloat(this_price)*volume_size).toFixed(3) + "元/时");
}

function simulate_click_previous() {
    $("#previous_step").click();
}

//1 get images' info
function get_images() {
    $.ajax({
        type: "get",
        url: project_url +  "/images",
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
    var $image_list_container = $("[type=image_list_container]");
    $image_list_container.html("");
    //console.log(images);
    for (var index = 0; index < images.length; index++) {
        switch(images[index].os_type){
            case "linux":
                os_img = "linux.png";
                break;
            case "windows":
                os_img = "windows.png";
                break;
            default:
                os_img = "unknown.png";
                break;
        }

        var unit = "MB";
        var size = images[index].size;
        if(size>1024){
            size = (size/1024).toFixed(1);
            unit = "GB";
        }

        var $imageList = $('<div class="btn_list"></div>');
        $imageList.append('<img width="20px" height="20px" src="' + project_url + '/static/images/operation_system/'+ os_img + '"/>');
        $imageList.append(images[index].name + " (" + size + unit + ")");
        $imageList.attr('image_id', images[index].id);
        $imageList.attr('list_type', "image_list");
        $image_list_container.append($imageList);
    }
}

//2 get flavors' info
function get_flavors() {
    $.ajax({
        type: "get",
        url: project_url + "/flavors",
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

function sort_by_ram(a, b) {
    return a.ram - b.ram
}

function render_flavor_template(flavor_map) {
    var $cpu_container = $("#cpu_container");
    var $ram_container = $("#ram_container");
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
    $("#cpu_container").children().click(function () {
        //clear content with every click
        $("#ram_container").children().each(function () {
            $(this).addClass("hide_ram_button");
        });

        $(this).addClass("selected").siblings().removeClass("selected");
        var cpu_number = $(this).attr("cpu_number");
        var flavors = flavor_map[cpu_number];
        for (var i = 0; i < flavors.length; i++) {
            $("#ram_container").children().each(function () {
                if ($(this).attr("flavor_id") == flavors[i].id) {
                    $(this).removeClass("hide_ram_button");
                }
            });
        }
    })
}

function click_ram_button() {
    $("#ram_container").children().click(function () {
        $(this).addClass("selected").siblings().removeClass("selected");
    })
}

function simulate_flavor_select() {
    $("#flavor_select_container").click(function () {
        var $this = $(this).children('option:selected');
        if ($this.attr('list_type') == 'flavor_select') {
            var flavor_id = $this.attr("flavor_id");
            var cpu_number = $this.attr("vcpus");
            $("#cpu_container").children().each(function () {
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
    $("#cpu_container").children().bind("click", container_click);
    $("#ram_container").children().bind("click", container_click);
}

function container_click() {
    console.log("enter container click");
    console.log("cpu.length>0 " + $("#cpu_container").children(":visible").hasClass("selected"));
    console.log("ram.length>0 " + $("#ram_container").children(":visible").hasClass("selected"));

    if ($("#cpu_container").children(":visible").hasClass("selected") &&
        $("#ram_container").children(":visible").hasClass("selected")) {
        var flavor_id = $("#ram_container").children(":visible.selected").attr("flavor_id");
        console.log("container.click flavor_id is " + flavor_id);
        $("[list_type=flavor_select]").each(function () {
            if ($(this).attr("flavor_id") == flavor_id) {
                $("#flavor_select_container").val($(this).html());
                $("#show_ram").removeClass("projection_image_style").html($(this).attr("ram") / 1024 + "G");
                $("#show_vcpus").removeClass("projection_image_style").html($(this).attr("vcpus") + "核").attr("flavor_id", flavor_id);
                var prices = JSON.parse($("#create_server_modal").attr("prices"));
                var this_price = 0;
                for(var i=0;i<prices.length;i++){
                    if(prices[i].flavor_id==$(this).attr("flavor_id")){
                        this_price = prices[i].price;
                        break;
                    }
                }
                $("#show_flavor_bill").html(parseFloat(this_price) + "元/时");
                calculateSumBill();
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


function render_flavor_list(flavors) {
    var $flavor_container = $("#flavor_select_container");
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
    $("#flavor_select_container").click(function () {
        var $this = $(this).children('option:selected');
        if ($this.attr('clear_flavor') == 'true') {
            $("#show_vcpus").removeAttr("flavor_id").removeClass("projection_image_style").html("");
            $("#show_ram").removeClass("projection_image_style").html("");
            $("#cpu_container, #ram_container").children("div.selected").removeClass("selected");
        } else {
            var flavor_id = $this.attr("flavor_id");
            console.log("Flavor id is " + flavor_id);
            $("#show_vcpus").removeClass("projection_image_style").html($this.attr("vcpus") + "核").attr('flavor_id', flavor_id);
            $("#show_ram").removeClass("projection_image_style").html(Number($this.attr("ram")) / 1024 + 'G');
        }
    });
}

//3 get network's info
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
    var $network_container = $("#network_select_container");
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
    $("#network_select_container").change(function () {
        console.log("Enter select network,and this is " + this);
        var $this = $(this).children('option:selected');
        if ($this.attr('clean_content') != undefined) {
            $("#show_network").removeAttr("network_id").removeClass("projection_image_style").html("");
        } else {
            var network_id = $this.attr("network_id");
            var network_name = $this.attr("network_name");
            var cidr = $this.attr("cidr");
            console.log("Subnet" + network_name + " id is " + network_id);
            $("#show_network").removeClass("projection_image_style").html(network_name + "(" + cidr + ")")
                .attr('network_id', network_id);
        }
    });
}

//render NUMBER of server
function render_server_number() {
    $("#server_number").val(1);
    $("#show_server_number").html(1);
    $("#server_number").change(function () {
        var server_number = $("#server_number").val();
        if (server_number <= 10 && server_number > 0) {
            $("#show_server_number").html($("#server_number").val()).removeClass("projection_image_style");
        } else {
            $("#show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
        }
    })
}

//create server navigator bar function
$(function () {
    next_step();
    previous_step();
    register_create_info();
    simulate_tab_click();
});

function next_step() {
    $("#next_step").click(function () {
        if (check_params_on_next()) {
            $("#select_image_li").removeClass('active').attr('aria-expanded', 'false').children().removeClass('active_tab');
            $("#select_conf_li").addClass('active').attr('aria-expanded', 'true').children().addClass('active_tab');
            if (!$("#show_server_number").html()) {
                render_server_number();
            }
        }
        else {
            return false
        }
    });
    simulate_tab_click();
}

function check_params_on_next() {
    var image_name = $("#show_image_name").html();
    var server_name = $("#show_server_name").html();
    if (!image_name || !server_name || image_name == "*请选择镜像！*" || server_name == "*请输入名称！*") {
        console.log("can't be pass to next");
        if (!image_name) {
            $("#show_image_name").html("*请选择镜像！*").addClass("projection_image_style");
        }
        if (!server_name) {
            $("#show_server_name").html("*请输入名称！*").addClass("projection_image_style");
        }
        return false
    }
    else {
        return true
    }
}

function previous_step() {
    $("#previous_step").click(function () {
        $("#select_conf_li").removeClass('active').attr('aria-expanded', 'false').children().removeClass('active_tab');
        $("#select_image_li").addClass('active').attr('aria-expanded', 'true').children().addClass('active_tab');
    });
}

function register_create_info() {
    get_server_name();
}

function simulate_tab_click() {
    $("#select_conf_li").click(function () {
        if (!$("#select_conf_li").hasClass("active")) {
            if (check_params_on_next()) {
                $("#next_page").click();
            } else {
                return false;
            }

        }
    });

    $("#select_image_li").click(function () {
        if (!$("#select_image_li").hasClass("active")) {
            console.log("click image li")
            $("#last_page").click();
        }
    });
}

function get_server_name() {
    $("#server_name").blur(function () {
        var server_name = $("#server_name").val();
        console.log("server name: " + server_name);
        $("#show_server_name").removeClass("projection_image_style").html(server_name);
    });
}

function select_image() {
    $("[list_type=image_list]").click(function () {
        var image_id = $(this).attr("image_id");
        var image_name = $(this).html();
        console.log(image_id + " " + image_name);
        $(this).addClass("warning_list").siblings().removeClass("warning_list");
        $("#show_image_name").removeClass("projection_image_style").html(image_name).attr("image_id", image_id);
    })
}


/*
 Create server
 */
function register_create_server() {
    $("#create_server_action").unbind("click");
    $("#create_server_action").click(function () {
        create_server();
    });
}

function create_server() {
    if (check_create_params()) {
        $("#create_server_action").attr("disabled", "disabled").css("cursor", "pointer");
        var name = $("#show_server_name").html();
        var image_id = $("#show_image_name").attr("image_id");
        var flavor_id = $("#show_vcpus").attr("flavor_id");
        var network_id = $("#show_network").attr("network_id");
        var source_id = image_id;
        var count = $("#server_number").val();
        var volume_slider = $("#server_volume_size").slider();
        var volume_size = volume_slider.slider("getValue");
        var authority_type = $("#create_server_authority").val();
        var keypair = $("#create_server_keypair").val();
        var username = $("#create_server_username").val();
        var password = $("#create_server_passwd").val();
        var availability_zone = $("#create_server_availability_zone").val();


        var request_data = {
            "name": name,
            "image_id": image_id,
            "flavor_id": flavor_id,
            "network_id": network_id,
            "source_id": source_id,
            "max_count": count,
            "volume_size": volume_size,
            "availability_zone": availability_zone
        };

        if(authority_type=="密钥"){
            request_data.key_name = keypair;
        }else{
            request_data.user_name = username;
            request_data.password = password;
        }

        $.ajax({
            type: "POST",
            url: project_url + "/servers",
            data: JSON.stringify(request_data),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.log("Request send success!");
                location.reload();
            },
            error: function (e) {
                //alert("创建虚拟机请求失败！")
                alert_error(e);
                console.log(e);
            }, complete: function () {
                $("#create_server_action").removeAttr("disabled");
                $("#create_server_modal").modal('hide');
            }
        });
    }
}

function check_create_params(volume_slider) {
    var flavor_id = $("#show_vcpus").attr("flavor_id");
    var network_id = $("#show_network").attr("network_id");
    var server_number = $("#show_server_number").html();
    if (!(flavor_id && network_id && server_number)) {
        if (!flavor_id) {
            $("#show_vcpus").html("*请选择合适的配置！*").addClass("projection_image_style");
            $("#show_ram").html("*请选择合适的配置！*").addClass("projection_image_style");
        }

        if (!network_id) {
            $("#show_network").html("*请选择合适的网络！*").addClass("projection_image_style");
        }

        if (!server_number) {
            $("#show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
        }
        return false;
    } else {
        var server_num = Number(server_number);
        console.log("Server number" + server_num);
        if (!(server_num && server_num > 0 && server_num < 11)) {
            $("#show_server_number").html("*请选择1到10之间的数字！*").addClass("projection_image_style");
            return false
        }
        return true;
    }
}


/*
 Edit server info
 */
function register_edit_server() {
    $("#submit_edit_user").click(function () {
        edit_server();
    })
}

function edit_server() {
    var server_name = $("#machine_name").val();
    var description = $("#server_description").val();
    console.log("description is" + description);
    var $servers_td = $("#server_table tbody tr input:checked");
    var server_id = $($servers_td[0]).closest('tr').attr('id');
    var request_data = {
        name: server_name,
        description: description
    };
    $.ajax({
        type: "PUT",
        url: project_url + "/servers/" + server_id,
        data: JSON.stringify(request_data),
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function () {
            console.log("Request send success!");
            refresh_server_list();
        },
        error: function (e) {
            //alert("编辑虚拟机信息失败！")
            alert_error(e)
        },
        complete: function () {
            $("#edit_server_modal").modal('hide');
        }
    });
}

/*
 Register migrate server
 */

$('#migrate_server_modal').off('show.bs.modal').on('show.bs.modal', function () {
    clean_migrate_modal();
    init_migration_table();
    register_refresh_server_list();
});

function register_refresh_server_list(){
    $("#migrate_server_modal").on('hidden.bs.modal',function(){
        if($("#submit_migrate_server").attr("disabled") == "disabled"){
            refresh_server_list()
        }
    })
}

function register_migrate_server() {
    $("#submit_migrate_server").click(function () {
        migrate_server();
    });
    register_clean_warnning();
}

function register_clean_warnning() {
    $("#id_destination_host").focusin(function () {
        $(this).removeClass("warning_border")
    })
}

function migrate_server() {
    var _params = $("#migrate_server_form").serializeArray();
    //console.log("params is ", _params);
    var params = format_migration_data(_params);
    var server_id = params["id"];
    if (params['action'] == "live_migrate") {
        if (check_params_on_migration(params)) {
            $("#submit_migrate_server").attr("disabled", true).css("cursor", "pointer");

            $.ajax({
                type: "POST",
                url: project_url + "/servers/" + server_id + "/action",
                data: JSON.stringify(params),
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function () {
                    console.log("Request send success!");
                    refresh_server_list();
                },
                error: function (e) {
                    //alert("热迁移虚拟机失败！")
                    console.debug("ERROR；", e)
                    alert_error(e)
                },
                complete: function () {
                    $("#submit_migrate_server").removeAttr("disabled");
                    $("#migrate_server_modal").modal('hide');
                }
            });
            console.log("final params: " + JSON.stringify(params))
        }
    } else {
        $("#submit_migrate_server").attr("disabled", true).css("cursor", "pointer");
        $.ajax({
            type: "POST",
            url: project_url + "/servers/" + server_id + "/action",
            data: JSON.stringify(params),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.log("Request send success!");
                refresh_server_list();
            },
            error: function (e) {
                //alert("冷迁移虚拟机失败！")
                alert_error(e)
            },
            complete: function () {
                $("#submit_migrate_server").removeAttr("disabled");
                $("#migrate_server_modal").modal('hide');
            }
        });
        console.log("final params: " + JSON.stringify(params))
    }
}

function confirm_action(server_id) {
    var params = {
        'id': server_id,
        'action': "action_confirm"
    };
    $.ajax({
        type: "POST",
        url: project_url + "/servers/" + server_id + "/action",
        data: JSON.stringify(params),
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function () {
            console.log("Confirm Request send success!");
        },
        error: function (e) {
            //alert("编辑虚拟机配置或冷迁移失败！")
            alert_error(e)
        }
    });
}

function check_params_on_migration(params) {
    if (params['host'] == "default") {
        $("#id_destination_host").addClass("warning_border");
        return false;
    }
    return true;
}

function format_migration_data(params) {
    var json_params = {};
    for (var i = 0; i < params.length; i++) {
        json_params[params[i].name] = params[i].value
    }
    json_params["id"] = get_id_of_server();
    var action = json_params["migration_type"];
    json_params["action"] = action;
    json_params["migration_type"] = undefined;
    if (action == 'live_migrate') {
        var over_commit = json_params['disk_over_commit'];
        over_commit == 'on' ? json_params['disk_over_commit'] = 'true' : json_params['disk_over_commit'] = 'false';
        var block_migration = json_params['block_migration'];
        block_migration == 'on' ? json_params['block_migration'] = 'true' : json_params['block_migration'] = 'false';
    }
    //console.log("Json params is here: ", JSON.stringify(json_params));
    return json_params
}

function clean_migrate_modal() {
    $("#migration_type").val("live_migrate");
    $("#id_over_quota").attr("checked", false);
    $("#id_block_migration").attr("checked", false);

    $("#on_line_migration_block").removeClass("hide_block");
    var $element = $(".on_line");
    $element.each(function () {
        $(this).removeAttr("disabled")
    });

    $("#id_destination_host").html("").removeClass("warning_border").val("default");
}

function register_choose_migrate_type() {
    $("#migration_type").change(function () {
        if ($(this).val() == "live_migrate") {
            $("#on_line_migration_block").removeClass("hide_block");
            var $element = $(".on_line")
            console.log("element is : ", $element);
            $element.each(function () {
                $(this).removeAttr("disabled")
            })
        } else {
            $("#on_line_migration_block").addClass("hide_block");
            $(".on_line").each(function () {
                $(this).attr("disabled", "disabled")
            })
        }
    })
}

function init_migration_table() {
    var host_name = get_host_of_server();
    $("#current_host").val(host_name)
    render_migration_table(host_name);
}

function get_host_of_server() {
    var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
    var host_name = $server_tr.attr("host_name");
    return host_name
}

function get_id_of_server() {
    var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
    var server_id = $server_tr.attr("id");
    return server_id
}

function render_migration_table(origin_host_name) {
    $.ajax({
        type: "get",
        url: project_url + "/availability-zones?need_ag=0",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_host_table(data, origin_host_name)
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_host_table(data, origin_host_name) {
    //console.debug("Available data", data,"Origin host name", origin_host_name)
    var az = data.availabilityZoneInfo;
    var hosts = [];
    for (var i = 0; i < az.length; i++) {
        var host_list = az[i].hosts;
        if (host_list.indexOf(origin_host_name) != -1) {
            hosts = host_list;
        }
    }
    var index = hosts.indexOf(origin_host_name);
    hosts.splice(index, 1);
    var $default_option = $("<option value='default'>请选择将要迁移到的主机：</option>");
    $("#id_destination_host").append($default_option);
    for (var i = 0; i < hosts.length; i++) {
        var $option = $("<option value=" + hosts[i] + ">" + hosts[i] + "</option>");
        $("#id_destination_host").append($option)
    }
}


/*
 Update server js
 */
function update_server_row(row_id, col_id, data) {
    var tr = $("#server_list tr").eq(row_id);
    var status = server_status[data.task_state] ? server_status[data.task_state] : server_status[data.status];
    var ram = data.ram;
    var cpu = data.vcpus;
    console.log("Update server :" + status + " ,Origin status is:" + data.status);
    var host_name = "";
    if (data.host_name) {
        host_name = data.host_name;
        $(tr).attr("host_name", host_name)
    }

    var ip_address = "暂无"
    if(data.network_info){
        ip_address = ""
        var net_info = JSON.parse(data.network_info);
        for(var i=0;i<net_info.length;i++){
            for(var item in net_info[i]){
                ip_address += net_info[i][item].fixed_ip + '\n'
            }
        }
    }

    var type = "暂无"
    if (data.type) {
        type = data.type
    }

    var status_div = '<div class="loading_gif">' +
        '<img src="' + project_url + '/static/images/loading.gif" /> 确认中</div>';
    var status_td = $(tr).children().eq(col_id);
    var hostname_td = $(tr).children().eq(col_id - 3);
    var type_td = $(tr).children().eq(col_id - 2);
    var cpu_td = $(tr).children().eq(col_id - 7);
    var ram_td = $(tr).children().eq(col_id - 6);
    var network_td = $(tr).children().eq(col_id - 5);
    if (status == "确认中" || ($.inArray(status, server_handle_status) < 0)) {
        if (status == "确认中") {
            $(status_td).html(status_div).attr("title", status);
        } else {
            $(status_td).html(status).attr("title", status);
        }
        $(tr).attr("vcpu", cpu).attr("ram", ram);
        $(hostname_td).html(host_name).attr("title", host_name);
        $(type_td).html(type).attr("title", type);
        $(cpu_td).html(cpu + "核").attr("title", cpu + "核").attr("vcpu", cpu);
        $(ram_td).html((ram / 1024) + "G").attr("title", (ram / 1024) + "G").attr("ram", ram);
        $(network_td).html(ip_address).attr("title", ip_address).attr("ip_address", ip_address);
    }
}

function check_server_status() {
    var server_trs = $("#server_list tr");
    var num = 0;
    if (server_trs.length) {
        var col_id = 9;
        server_trs.each(function () {
            var server_id = $(this).attr("id");
            var status = $.trim($(this).find('td').eq(col_id).text());
            //console.log(status);
            if ($.inArray(status, server_handle_status) >= 0) {
                //console.log(status);
                //console.log("in array");
                num += 1;
                //console.log($(this).index());
                update_server_status($(this).attr("id"), $(this).index(), col_id);
                //console.log("cow:"+$(this).index()+"col:"+col_id);
                if (status == "确认中" && $.inArray(server_id, confirm_array) == -1) {
                    confirm_array.push(server_id);
                    confirm_action(server_id);
                }
            }

            if (status == "运行中" && $.inArray(server_id, confirm_array) > -1) {
                var index = confirm_array.indexOf(server_id);
                console.log("confirm array", confirm_array);
                confirm_array.splice(index, 1);
                console.log("confirm array", confirm_array)
            }
        });
    }
    //console.log("server_num" + num);
    if (num == 0) {
        var handle = server_interval.pop();
        //console.log("server clear handle:"+handle);
        clearInterval(handle);
        //console.log("server clear array:"+server_interval);
    }
}

function update_server_status(server_id, row_id, col_id) {
    var root_path = project_url + "/servers/";
    var query_path = root_path + server_id;
    $.ajax({
        type: "GET",
        url: query_path,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            //console.log(data);
            update_server_row(row_id, col_id, data.server);
        },
        error: function (e) {
            if (e.status == 404) {
                $("#refresh_web").click()
            } else {
                alert_error(e)
            }
        }
    });
}

/*
 * Resize server relevant function
 */
$(function () {
    register_resize_server()
});

$('#config_server_modal').off('show.bs.modal').on('show.bs.modal', function () {
    init_config_table();
    clean_warnning_in_resize();
});

function init_config_table() {
    render_current_config();
    render_config_container();
}

function render_current_config() {
    var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
    var cpu = $server_tr.attr("vcpu");
    var ram = $server_tr.attr("ram");
    var $span = $("<span></span>");
    $span.attr("vcpu", cpu).attr("ram", ram).html(cpu + "核CPU / " + (ram / 1024) + "G 内存");
    $("#current_config").html("").append($span)
}

function render_config_container() {
    get_flavors_for_config()
}

function get_flavors_for_config() {
    $.ajax({
        type: "get",
        url: project_url + "/flavors",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            flavor_module_in_config(data);
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function flavor_module_in_config(data) {
    var flavor_map = format_flavor_by_cpu(data);
    console.log("Flavor map is: ", flavor_map)
    var default_cpu = render_flavor_container(flavor_map);
    init_flavor_button_in_config(flavor_map);
    default_choice(default_cpu)
}

function render_flavor_container(flavor_map) {
    var $cpu_container = $("#cpu_config_container");
    var $ram_container = $("#memory_config_container");
    $cpu_container.html("");
    $ram_container.html("");
    var default_cpu;
    for (var cpu in flavor_map) {
        if (default_cpu == undefined) {
            default_cpu = cpu;
        } else {
            if (cpu < default_cpu) {
                default_cpu = cpu;
            }
        }
        var flavors = flavor_map[cpu];
        var $cpu_item = $('<div class="btn_select_ram"></div>');
        $cpu_item.html(cpu + "核").attr("cpu_number", cpu);
        $cpu_container.append($cpu_item);
        for (var i = 0; i < flavors.length; i++) {
            var flavor_item = flavors[i];
            var $ram_item = $('<div class="btn_select_ram hide_ram_button"></div>');
            $ram_item.attr("flavor_id", flavor_item.id);
            $ram_item.attr("ram", flavor_item.ram);
            $ram_item.html(flavor_item.ram / 1024.0 + "G");
            $ram_container.append($ram_item);
        }
    }

    return default_cpu;
}

function init_flavor_button_in_config(flavor_map) {
    click_cpu_button_in_config(flavor_map);
    click_ram_button_in_config();
}


function click_cpu_button_in_config(flavor_map) {
    $("#cpu_config_container").children().click(function () {
        //clear content with every click
        $("#memory_config_container").children().each(function () {
            $(this).addClass("hide_ram_button");
        });
        $(this).addClass("selected").siblings().removeClass("selected");
        var cpu_number = $(this).attr("cpu_number");
        var flavors = flavor_map[cpu_number];
        for (var i = 0; i < flavors.length; i++) {
            $("#memory_config_container").children().each(function () {
                if ($(this).attr("flavor_id") == flavors[i].id) {
                    $(this).removeClass("hide_ram_button");
                }
            });
        }
        ;

        clean_warnning_in_resize();
    })
}

function click_ram_button_in_config() {
    $("#memory_config_container").children().click(function () {
        $(this).addClass("selected").siblings().removeClass("selected");
        clean_warnning_in_resize();
    })
}

function default_choice(default_cpu) {
    $("#cpu_config_container").children().each(function () {
        if ($(this).attr("cpu_number") == default_cpu) {
            $(this).click()
        }
    });
    $("#memory_config_container").children().eq(0).click()
}

function register_resize_server() {
    $("#submit_config_server").click(function () {
        resize_server();
    });
    register_clean_warnning_in_resize();
}

function resize_server() {
    var flavor_id = $("#memory_config_container").children(".selected:visible").attr("flavor_id");
    console.log("flavor_id is ", flavor_id);
    if (check_params_in_resize(flavor_id)) {
        $("#submit_config_server").attr("disabled", true).css("cursor", "pointer");
        var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
        var server_id = $server_tr.attr("id");
        var params = {
            'action': "resize",
            "id": server_id,
            "flavorRef": flavor_id,
        };
        $.ajax({
            type: "POST",
            url: project_url + "/servers/" + server_id + "/action",
            data: JSON.stringify(params),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.log("Request send success!");
                refresh_server_list();
            },
            error: function () {
                //alert("重置虚拟机配置失败！")
                alert_error(e)
            },
            complete: function () {
                $("#submit_config_server").removeAttr("disabled");
                $("#config_server_modal").modal('hide');
            }
        });
        console.log("final params: " + JSON.stringify(params))
    }
}

function check_params_in_resize(flavor_id) {
    if (flavor_id == undefined) {
        $("#config_warnning_tip").html("*请选择合适的配置！*");
        return false
    }
    var current_cpu = $("#current_config span").attr("vcpu");
    var current_ram = $("#current_config span").attr("ram");
    var ram = $("#memory_config_container .selected:visible").attr("ram");
    var cpu = $("#cpu_config_container .selected:visible").attr("cpu_number");
    if (current_cpu == cpu && current_ram == ram) {
        $("#config_warnning_tip").html("*当前选择与原配置一致，请重新选择！*");
        return false;
    }

    return true
}

function register_clean_warnning_in_resize() {
    $("#config_warnning_tip").click(function () {
        $(this).html("")
    })
}

function clean_warnning_in_resize() {
    $("#config_warnning_tip").click();
}

/*
 Modify server's interface
 */
$(function () {
    register_create_interface();
    register_clean_warnning();
});

$('#server_interface_modal').off('show.bs.modal').on('show.bs.modal', function () {
    init_interface_modal();
    clean_interface_warnning();
});

function clean_interface_warnning() {
    $("#interface_warnning_tip").html("")
}

function register_clean_warnning() {
    $("#interface_warnning_tip").click(function () {
        $("#interface_warnning_tip").html("")
    });

    $("#network_list_of_interface").focusin(function () {
        clean_interface_warnning();
    })
}

function init_interface_modal() {
    var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
    var server_id = $server_tr.attr("id");
    get_interface_detail(server_id);
}

function get_interface_detail(server_id) {
    var root_path = project_url + "/ports";
    var query_path = root_path + "?device_id=" + server_id;
    $.ajax({
        type: "GET",
        url: query_path,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_server_interface(data);
            get_network_list();
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_server_interface(data) {
    format_display_item(data);
    register_delete_interface();

}

function format_display_item(port_info) {
    $("#interface_list").html("");
    if (port_info.length != 0) {
        var $init_description = $("<div class=\"list_item\"><div class=\"row_title\"><label>当前网卡 :</label> </div> </div>")
        $("#interface_list").append($init_description);
        console.log("port_info", port_info)
        for (var i = 0; i < port_info.length; i++) {
            var index = i + 1;
            var $list_item = $("<div  class=\"list_item\"></div>");
            var $row_content = $("<div class=\"row_content\"></div>");
            var $row_title = $("<div class=\"row_title\"><label>网卡" + index + " :</label></div>");
            var $input_group = $("<div class=\"input-group\"></div>");
            var $input = $("<input type=\"text\" class=\"form-control\" disabled=\"disabled\"></div>");
            $input.val(port_info[i].network_name + "(" + port_info[i].ip_address + ")").attr("port_id", port_info[i].id)
                .css("cursor", "default").attr("title", port_info[i].network_name + "(" + port_info[i].ip_address + ")")
                .attr("network_id", port_info[i].network_id);
            var $span = $("<span class=\"input-group-btn\"></span>");
            var $button = $("<button class=\"btn btn-default btn-delete\" type=\"button\" btn-type=\"delete_interface\">删除</button>");
            $span.append($button);
            $input_group.append($input).append($span);
            $row_content.append($input_group);
            $list_item.append($row_title).append($row_content)
            $("#interface_list").append($list_item);
        }
    } else {
        var $init_description = $("<div class=\"list_item\"><div class=\"row_title\"><label>当前网卡 :</label> </div> </div>");
        var $list_item = $("<div  class=\"list_item\"></div>");
        var $row_content = $("<div class=\"row_content\"></div>");
        var $row_title = $("");
        var $tip = $("<span>该虚拟机没有网卡！</span>");
        $row_content.append($tip);
        $list_item.append($row_title).append($row_content);
        $("#interface_list").append($init_description).append($list_item);
    }
}

function get_network_list() {
    $.ajax({
        type: "get",
        url: project_url + "/networks",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_interface_network_list(data);
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_interface_network_list(networks) {
    var $network_container = $("#network_list_of_interface");
    $network_container.html("");
    $network_container.append($('<option selected="selected">请选择：</option>'));
    var network_list = get_network_id();
    //for(var index=0;index<networks.length;index++)

    for (var index in networks)
    {
        var net_id = networks[index].network_id;
        if ($.inArray(networks[index].network_id, network_list) == -1 && networks[index]['router:external'] == 0) {
            var $networkOptions = $('<option></option>');
            $networkOptions.attr('network_id', networks[index].network_id);
            $networkOptions.val(networks[index].network_id);
            $networkOptions.attr('title', networks[index].network_name + "(" + networks[index].cidr + ")");
            $networkOptions.html(networks[index].network_name + "(" + networks[index].cidr + ")");
            $network_container.append($networkOptions);
        }
    }
}

function get_network_id() {
    var network_list = [];
    $("#interface_list input").each(function () {
        var item = $(this).attr("network_id");
        network_list.push(item);
    });
    return network_list
}

function register_create_interface() {
    $("#add_interface").click(function () {
        var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
        var server_id = $server_tr.attr("id");
        var network_id = $("#network_list_of_interface").val();
        if (network_id == "请选择：") {
            $("#interface_warnning_tip").html("请选择创建网卡的网络!");
            return false;
        } else {
            create_interface(server_id, network_id)
        }
    })
}

function create_interface(server_id, network_id) {

    $("#add_interface").attr("disabled", true).css("cusor", "pointer")

    var request_data = {
        net_id: network_id
    };
    var query_path = project_url + "/servers/" + server_id + "/interface";

    $.ajax({
        type: "POST",
        url: query_path,
        data: JSON.stringify(request_data),
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function () {
            init_interface_modal();
        },
        complete: function () {
            $("#add_interface").removeAttr("disabled")
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function register_delete_interface() {
    console.log("Enter register delete", $("#interface_list [btn-type=delete_interface]"));
    $("#interface_list [btn-type=delete_interface]").unbind("click").bind("click", function () {
        console.log("Enter click event", $(this).parent().siblings("input"));
        var port_id = $(this).parent().siblings("input").attr("port_id");
        var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
        var server_id = $server_tr.attr("id");
        delete_interface(server_id, port_id);
    })
}

function delete_interface(server_id, port_id) {
    var query_path = project_url + "/servers/" + server_id + "/interface";
    var request_data = {
        'port_id': port_id
    };
    $.ajax({
        type: "DELETE",
        url: query_path,
        data: JSON.stringify(request_data),
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function () {
            console.log("Delete interface successfully")
        },
        error: function (e) {
            alert_error(e)
        },
        complete: function () {
            setTimeout("init_interface_modal()", 1000);
        }
    });
}

function keyup_search_server() {
    $("#search_server_input").keyup(function () {
        //console.log($("#search_server_input").val());
        get_all_servers($("#search_server_input").val());
    });
}

function click_search_server() {
    $("#search_server_img").click(function () {
        get_all_servers($("#search_server_input").val());
        clearTags();
    });
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

/*
 Floating IP relevant function
 */
$(function () {
    register_get_floatingip()
});

function register_get_floatingip() {
    $("#floating_ip").unbind("click").bind("click", function () {
        start_floatingip_flow()
    })

}

function start_floatingip_flow() {
    console.debug("Enter Start floatingip_flow...");
    init_form_data();
    choose_type();
    choose_interface();
    get_server_interface();
    bind_floating();
}

function init_form_data() {
    $("#ip_list_container").hide().attr("disabled", "disabled");
    $("#external_network_container").hide().attr("disabled", "disabled");
    $("#bind_type").val("directly_bind");
    //$("#floatingip_warnning").html("");
    render_danger_info("");
    $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span> 绑定").removeAttr("disabled")
}

function choose_type() {
    $("#bind_type").unbind("change").bind("change", function () {
        if ($(this).val() == "directly_bind") {
            $("#external_network_container").hide().attr("disabled", "disabled");
            $("#ip_list_container").show().removeAttr("disabled");
            $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span> 绑定");
            if ($("#server_interface_list").val() != "") {
                get_floatingips()
            } else {
                $("#ip_list_container").hide().attr("disabled", "disabled");
            }
        } else {
            $("#external_network_container").show().removeAttr("disabled");
            $("#ip_list_container").hide().attr("disabled", "disabled");
            $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span> 创建并绑定");
            if ($("#server_interface_list").val() != "") {
                get_ext_network();
            } else {
                $("#external_network_container").hide().attr("disabled", "disabled");
            }
        }
    })
}

function choose_interface() {

    $("#server_interface_list").unbind("change").bind("change", function () {
        var type = $("#bind_type").val();
        if (type == "directly_bind") {
            get_floatingips()
        } else if (type == "create_and_bind") {
            get_ext_network();
        }
    })
}


function get_floatingips() {
    var network_id = get_ext_network_id();

    if (network_id == null) {
        if ($("#bind_type").val() == 'directly_bind') {
            $("#ip_list_container").hide().attr("disabled", "disabled");
        } else {
            $("#external_network_container").hide().attr("disabled", "disabled");
        }
        //$("#floatingip_warnning").html("该内部网络没有连接到外部网络，无法绑定");
        render_danger_info("该内部网络没有连接到外部网络，无法绑定");

    } else {
        if ($("#bind_type").val() == 'directly_bind') {

            $("#ip_list_container").show().removeAttr("disabled");
            //$("#floatingip_warnning").html("");
            render_danger_info("");

            var tr = $("#server_list").find(".table_body_tr_change");
            var tenant_id = tr.eq(0).attr("tenant_id");
            var params = {
                "use": "false",
                "floating_network_id": network_id,
                "tenant_id": tenant_id
            };
            $.ajax({
                type: "get",
                url: project_url + "/floatingips",
                dataType: "json",
                data: params,
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_floatingip_list(data)
                },
                error: function (e) {
                    alert_error(e)
                }
            });
        } else {
            $("#external_network_container").show().removeAttr("disabled");
        }
    }
}

function get_ext_network_id() {
    var port_id = $("#server_interface_list").val()
    var data = undefined;
    $.ajax({
        type: "get",
        url: project_url + '/connect-network/' + port_id,
        dataType: "json",
        async: false,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (_data) {
            data = _data
        },
        error: function (e) {
            alert_error(e)
        }
    });
    console.debug("Fail reason:", data);
    if (data.fail_reason != null) {
        alert_error(data.fail_reason)
    }
    return data.external_network_id
}

function render_floatingip_list(data) {
    var $list = $("#floating_ip_list");
    $list.empty();
    console.debug("Floating ip list: ", data)
    if (data.length == 0) {
        var $option = $("<option></option>");
        $option.html("无空闲外部IP").val(null);
        $list.append($option)
    } else {
        for (var i = 0; i < data.length; i++) {
            var $option = $("<option></option>");
            $option.val(data[i].id);
            $option.html(data[i].floating_network_name + "(" + data[i].floating_ip_address + ")");
            $list.append($option)
        }
    }
}

function get_server_interface() {

    var $servers_td = $("#server_table tbody tr input:checked");
    var server_id = $servers_td.closest('tr').attr('id');

    var params = {
        "device_id": server_id
    };

    $.ajax({
        type: "get",
        url: project_url + "/ports",
        dataType: "json",
        data: params,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_server_ports(data)
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_server_ports(data) {
    var iface_map = devide_interface_by_floatingip(data);
    console.debug("Iface MAP: ", iface_map)
    var $list = $("#server_interface_list");
    $list.empty();
    var unbind_port = iface_map["unbind"];
    var bind_port = iface_map["bind"];

    if (unbind_port.length == 0) {
        var $option = $("<option></option>");
        $option.val("").html("不存在需要绑定的网卡");
        $list.append($option)
    } else {
        for (var i = 0; i < unbind_port.length; i++) {
            var $option = $("<option></option>");
            $option.val(unbind_port[i].id);
            $option.html(unbind_port[i].network_name + "(" + unbind_port[i].ip_address + ")");
            $list.append($option)
        }
        if ($("#bind_type").val() == "directly_bind") {
            get_floatingips();
        }
    }
    format_bind_ip(bind_port);
    register_delete_floatingip()
}

function format_bind_ip(port_info) {
    var $container = $("#already_bind_container").html("");
    if (port_info.length != 0) {
        var $init_description = $("<div class=\"list_item\"><div class=\"row_title\"><label>已绑定的外部IP :</label> </div> </div>");
        $container.append($init_description);
        console.log("port_info", port_info);
        for (var i = 0; i < port_info.length; i++) {
            var index = i + 1;
            var $list_item = $("<div  class=\"list_item\"></div>");
            var $row_content = $("<div class=\"row_content\"></div>");
            var $row_title = $("<div class=\"row_title\"><label>网卡" + index + " :</label></div>");
            var $input_group = $("<div class=\"input-group\"></div>");
            var $input = $("<input type=\"text\" class=\"form-control\" disabled=\"disabled\"></div>");
            $input.val(port_info[i].ip_address + "=>" + port_info[i].floating_ip_address).attr("port_id", port_info[i].id)
                .css("cursor", "default").attr("title", "内部IP: " + port_info[i].ip_address + " => 外部IP: " + port_info[i].floating_ip_address)
                .attr("network_id", port_info[i].network_id);
            var $span = $("<span class=\"input-group-btn\"></span>");
            var $button = $("<button class=\"btn btn-default btn-delete\" type=\"button\" btn-type=\"delete_floatingip\">解绑</button>");
            $button.attr("floatingip_id", port_info[i]["floating_ip_id"]);
            $span.append($button);
            $input_group.append($input).append($span);
            $row_content.append($input_group);
            $list_item.append($row_title).append($row_content);
            $container.append($list_item);
        }
    } else {
        var $init_description = $("<div class=\"list_item\"><div class=\"row_title\"><label>已绑定的外部IP :</label> </div> </div>");
        var $list_item = $("<div  class=\"list_item\"></div>");
        var $row_content = $("<div class=\"row_content\"></div>");
        var $row_title = $("<div></div>");
        var $tip = $("<span>该虚拟机没有绑定外部IP</span>");
        $row_content.append($tip);
        $list_item.append($row_title).append($row_content);
        $container.append($init_description).append($list_item);
    }
}

function devide_interface_by_floatingip(port_data) {
    var map = {
        "bind": [],
        "unbind": []
    };

    var port_data = get_floatingip_by_fixip(port_data);
    for (var i = 0; i < port_data.length; i++) {
        if (port_data[i]['floating_network_id'] != undefined) {
            map['bind'].push(port_data[i])
        } else {
            map['unbind'].push(port_data[i])
        }
    }

    return map
}

function get_floatingip_by_fixip(port_data) {
    var fix_ip = [];
    for (var i = 0; i < port_data.length; i++) {
        fix_ip.push(port_data[i].ip_address)
    }

    var path = project_url + "/floatingips?";

    for (var i = 0; i < fix_ip.length; i++) {
        if (i == 0) {
            path = path + "fixed_ip_address=" + fix_ip[i];
        } else {
            path = path + "&fixed_ip_address=" + fix_ip[i];
        }
    }

    var data = [];
    $.ajax({
        type: "get",
        url: path,
        dataType: "json",
        async: false,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (_data) {
            data = _data
        },
        error: function (e) {
            if (e.responseJSON.error.code != 404) {
                alert_error(e)
            }
        }
    });

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < port_data.length; j++) {
            if (data[i].port_id == port_data[j].id) {
                port_data[j]['floating_network_id'] = data[i]['floating_network_id'];
                port_data[j]['floating_ip_address'] = data[i]['floating_ip_address'];
                port_data[j]['floating_ip_id'] = data[i]['id'];
            }
        }
    }

    return port_data
}

function get_ext_network() {
    var network_id = get_ext_network_id();
    if (network_id) {
        $("#external_network_container").show().removeAttr("disabled")
        var params = {
            "router:external": 1,
            "id": network_id
        };
        $.ajax({
            type: "get",
            url: project_url + "/networks",
            dataType: "json",
            data: params,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                render_ext_net_list(data)
            },
            error: function (e) {
                alert_error(e)
            }
        });
    } else {
        //$("#floatingip_warnning").html("该内部网络没有连接到外部网络，无法绑定");
        render_danger_info("该内部网络没有连接到外部网络，无法绑定");
        $("#external_network_container").hide().attr("disabled", "disabled")
    }
}

function render_ext_net_list(data) {
    var $list = $("#external_network_list");
    $list.empty();
    if (data.length == 0) {
        var $option = $("<option></option>");
        $option.val("").html("无可用外部网络");
        $list.append($option);
    } else {
        for (var i = 0; i < data.length; i++) {
            var $option = $("<option></option>");
            $option.val(data[i].network_id);
            $option.html(data[i].network_name + "(" + data[i].cidr + ")");
            $list.append($option)
        }
    }
    $("#floatingip_warnning").html("");
    render_danger_info("");
}

function bind_floating() {
    $("#bind_floatingip_submit").unbind("click").bind("click", function () {
        var _params = $("#floating_ip_form").serializeArray();
        var params = reformat_data(_params);
        if (check_floating_data(params)) {
            sent_bind_request(params);
        }
    })
}

function reformat_data(params) {
    var params_json = {};
    for (var i = 0; i < params.length; i++) {
        params_json[params[i].name] = params[i].value
    }
    if (params_json.bind_type == "directly_bind") {
        delete params_json.external_network
    } else {
        delete params_json.floating_ip
    }

    return params_json
}

function check_floating_data(params) {
    console.debug("Check Params:", params);
    if ($("#floatingip_warnning").html() != "") {
        return false
    }

    if (params.server_interface == "") {
        //$("#floatingip_warnning").html("虚拟机没有需要绑定的网卡");
        render_danger_info("虚拟机没有需要绑定的网卡");
        return false
    }

    if (params.bind_type == "directly_bind") {
        if (params.floating_ip == "") {
            //$("#floatingip_warnning").html("暂无可用外部IP，请选择另一种方式");
            render_danger_info("暂无可用外部IP，请选择另一种方式");
            return false
        }
    } else {
        if (params.external_network == "") {
            //$("#floatingip_warnning").html("暂无可用外部网络，无法绑定");
            render_danger_info("暂无可用外部网络，无法绑定");
            return false
        }
    }
    return true
}

function sent_bind_request(_params) {
    var type = _params.bind_type;

    if (type == "directly_bind") {
        var floatingip_id = _params.floating_ip;
        var params = {
            'port_id': _params.server_interface
        };

        $("#bind_floatingip_submit").attr("disabled", "disabled")
        $.ajax({
            type: "PUT",
            url: project_url + "/floatingip/" + floatingip_id,
            data: JSON.stringify(params),
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {

                console.debug("directly bind")
            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                $("#bind_floatingip_submit").removeAttr("disabled");
                $("#floating_ip_modal").modal('hide');
            }
        })
    } else {
        var tr = $("#server_list").find(".table_body_tr_change");
        var tenant_id = tr.eq(0).attr("tenant_id");
        var params = {
            "port_id": _params.server_interface,
            "floating_network_id": _params.external_network,
            "tenant_id": tenant_id
        };
        console.debug("Paaaaaa", JSON.stringify(params));
        $.ajax({
            type: "POST",
            url: project_url + "/floatingips",
            data: JSON.stringify(params),
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.debug("create and bind")
            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                $("#bind_floatingip_submit").removeAttr("disabled");
                $("#floating_ip_modal").modal('hide');
            }
        })
    }
}

function register_delete_floatingip() {
    console.log("Enter register delete", $("#already_bind_container [btn-type=delete_floatingip]"));
    $("#already_bind_container [btn-type=delete_floatingip]").unbind("click").bind("click", function () {
        var floatingip_id = $(this).attr("floatingip_id");
        delete_floatingip(floatingip_id);
    })
}

function delete_floatingip(floatingip_id) {

    var params = {
        "port_id": null
    };

    $.ajax({
        type: "PUT",
        url: project_url + '/floatingip/' + floatingip_id,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        data: JSON.stringify(params),
        success: function () {
            start_floatingip_flow()
        },
        error: function (e) {
            alert_error(e)
        }
    });
}

function render_danger_info(msg) {
    if (msg == "") {
        $("#warnning_container").hide();
    } else {
        $("#warnning_container").show();
    }
    $("#floatingip_warnning").html(msg)
}

/*
 Snapshot function
 */
$('#snapshot_modal').off('show.bs.modal').on('show.bs.modal', function () {
    all_snapshot_flow()
});

function all_snapshot_flow(){
    clean_snapshot_modal();
    get_snapshot_list();
    register_select_snapshot();
    register_edit_snapshot();
    register_create_button();
    register_delete_snapshot();
    register_roll_back_snapshot();
}

function clean_snapshot_modal() {
    $("#delete_snapshot").hide();
    $("#rollback_snapshot").hide();
    $("#edit_snapshot_submit").hide();
    $.jstree.destroy();
    create_flow_set()
}

function get_snapshot_list() {
    var $servers_td = $("#server_table tbody tr input:checked");
    var server_id = $servers_td.closest('tr').attr('id');
    var query_path = project_url + "/servers/snapshots";

    var params = {
        "instance_id": server_id
    };

    $.ajax({
        type: "GET",
        data: params,
        url: query_path,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            console.debug("Enter snapshot function and callback success");
            render_snapshot_list(data);
        },
        error: function (e) {
            console.debug("Enter snapshot function and callback error");
            alert_error(e)
        }
    });

}
function render_snapshot_list(data) {
    var $servers_td = $("#server_table tbody tr input:checked");
    var server_id = $servers_td.closest('tr').attr('id');
    var server_name = $servers_td.closest('tr').children('[item_tag=server_name]').children("a").html();
    var tree_data = format_tree_data(data);

    $('#snapshot_tree').jstree({
        'core': {
            "animation": 200,
            "check_callback": true,
            "themes": {"stripes": true, "dots": true},
            "data": tree_data,
        },
        "plugins": ["types", "sort"],
        "types": {
            "server": {
                "valid_children": ["default"],
                "icon": "glyphicon glyphicon-modal-window",
            },
            "default": {
                "icon": "glyphicon glyphicon-camera",
                "valid_children": ["default"],
            },
            "location": {
                "icon": "glyphicon glyphicon-hand-right",
                "valid_children": [],
            }
        },
    });
}

function format_tree_data(data) {
    var $servers_td = $("#server_table tbody tr input:checked");
    var server_name = $servers_td.closest('tr').children('[item_tag=server_name]').children("a").html();
    var server_id = $servers_td.closest('tr').attr('id');

    var tree_json = {
        "id": server_id,
        "text": server_name,
        "type": "server",
        "state" : { "disabled" : true },
        "children": [],
    };

    var location = {
        "id": "location",
        "text": "您在此处",
        "type": "location",
        "state": {"selected": true},
        "children": []
    };

    function construct_tree(data, current_tree) {
        if (data.length == 0) {
            return
        }
        for (var i = 0; i < current_tree.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (data[j].previous_node == current_tree[i].id) {
                    var node = {
                        "id": data[j].id,
                        "text": data[j].name,
                        "children": [],
                    };
                    if (data[j].active_state == 1) {
                        node["children"].push(location)
                    }
                    current_tree[i]['children'].unshift(node);
                    data.splice(j, 1);
                    j--;
                }
            }
            var current_node = current_tree[i]['children'];
            construct_tree(data, current_node);
        }
    }

    if (data.length == 0) {
        tree_json.children.push(location)
    } else {
        var has_active = false;
        for (var i = 0; i < data.length; i++) {
            if(data[i].active_state == 1){
                has_active = true
            }
            if (!data[i].previous_node) {
                var snapshot_leaf = {
                    "id": data[i].id,
                    "text": data[i].name,
                    "children": [],
                };
                if (data[i].active_state == 1) {
                    snapshot_leaf["children"].push(location)
                }
                data.splice(i, 1);
                i--;
                tree_json["children"].unshift(snapshot_leaf);
            }
        }
        if(has_active == false){
            tree_json.children.push(location)
        }

        var tree = tree_json["children"];

        construct_tree(data, tree);

        tree_json["children"] = tree;
    }

    console.debug("Finish recursion and result: ", tree_json)
    return tree_json
}

function check_create_snapshot_params(params) {
    for (var key in params) {
        if (params[key] == "") {
            if (key == "name") {
                render_snapshot_danger_info("快照名称不能为空！")
                return false
            }
        }
    }
    render_snapshot_danger_info("");
    return true
}

function render_snapshot_danger_info(msg) {
    if (msg == "") {
        $("#snapshot_warnning_container").hide();
    } else {
        $("#snapshot_warnning_container").show();
    }
    $("#snapshot_warnning").html(msg)
}

function register_select_snapshot() {
    $("#snapshot_tree ").off("changed.jstree").on("changed.jstree", function (e, data) {
        console.debug("Event: ", e, "and data:", data);
        if (data.action == "select_node") {
            if (data.node.type == "default") {
                edit_flow_set();
                get_snapshot_info(data.node.id)
            } else if (data.node.type == "location") {
                create_flow_set()
            }
        }
    })
}

function get_snapshot_info(snpashot_id) {

    var $servers_td = $("#server_table tbody tr input:checked");
    var server_id = $servers_td.closest('tr').attr('id');

    $.ajax({
        type: "GET",
        url: project_url + "/servers/" + server_id + "/snapshot/" + snpashot_id,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            render_snapshot_info(data)
        },
        error: function (e) {
            alert_error(e);
        }
    });
}

function render_snapshot_info(data) {
    console.debug("Snapshot Data: ", data);
    $("#snapshot_name").val("").removeAttr("placeholder").attr("placeholder", data.name);
    $("#snapshot_description").val("").removeAttr("placeholder").attr("placeholder", data.description);
}

function create_flow_set() {
    $("#edit_snapshot_submit").hide();
    $("#create_snapshot_submit").attr("action-type", "create").html("<span class='glyphicon glyphicon-ok'></span> 创建");
    $("#action_type_label").html("创建快照 :")
    $("#snapshot_name").val("").removeAttr("placeholder");
    $("#delete_snapshot").hide();
    $("#rollback_snapshot").hide();
    $("#snapshot_description").val("").removeAttr("placeholder");
    $("#snapshot_warnning_container").hide();
    $("#snapshot_warnning").html("");
}

function edit_flow_set() {
    $("#edit_snapshot_submit").show();
    $("#create_snapshot_submit").attr("action-type", "link_to_create").html("<span class='glyphicon glyphicon-ok'></span> 转到创建");
    $("#action_type_label").html("编辑快照信息:");
    $("#delete_snapshot").show();
    $("#rollback_snapshot").show();
}

function register_create_button() {
    $("#create_snapshot_submit").off("click").on("click", function () {
        if ($("#create_snapshot_submit").attr("action-type") == "link_to_create") {
            create_flow_set()
            $.jstree.reference('#snapshot_tree').deselect_all();
            console.debug("JSTree ref", $.jstree.reference('#snapshot_tree'))
            $.jstree.reference('#snapshot_tree').select_node(["location"]);
        } else {
            var $servers_td = $("#server_table tbody tr input:checked");
            var server_id = $servers_td.closest('tr').attr('id');

            var snapshot_name = $("#snapshot_name").val();
            var description = $("#snapshot_description").val();

            var query_path = project_url + "/servers/snapshots";

            var request_data = {
                "name": snapshot_name,
                "force": true,
                "instance_id": server_id,
                "description": description,
            };

            if (check_create_snapshot_params(request_data)) {
                $("#create_snapshot_submit").attr("disabled", "disabled");

                $.ajax({
                    type: "POST",
                    url: query_path,
                    data: JSON.stringify(request_data),
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function (data) {
                        //console.log("create snapshot callback in success");
                    },
                    error: function (e) {
                        alert_error(e)
                    },
                    complete: function () {
                        $("#snapshot_modal").modal('hide');
                        $("#create_snapshot_submit").removeAttr("disabled")
                    }
                });
            }
        }
    })
}

function register_edit_snapshot() {
    $("#edit_snapshot_submit").off("click").on("click", function () {
        var name = $("#snapshot_name").val();
        var description = $("#snapshot_description").val();
        console.debug("descri", description);
        if (description == "") {
            description = $("#snapshot_description").attr("placeholder")
        }
        var query_path = project_url + "/servers/snapshots";

        var snapshot_list = $.jstree.reference('#snapshot_tree').get_selected();
        if (snapshot_list.length == 1) {
            var snapshot_id = snapshot_list[0]
            var params = {
                "name": name,
                "description": description,
                "snapshot_id": snapshot_id,
            };
            if (check_create_snapshot_params(params)) {

                $("#edit_snapshot_submit").attr("disabled");
                $("#create_snapshot_submit").attr("disabled");

                $.ajax({
                    type: "PUT",
                    url: query_path,
                    data: JSON.stringify(params),
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function () {
                        console.log("Edit snapshot info success");
                    },
                    error: function (e) {
                        alert_error(e)
                    },
                    complete: function () {
                        $("#edit_snapshot_submit").removeAttr("disabled");
                        $("#create_snapshot_submit").removeAttr("disabled");
                        $("#snapshot_modal").modal('hide');
                    }
                });
            }
        }
    })
}

function register_delete_snapshot() {
    $("#delete_snapshot").off("click").on("click", function () {
        var snapshot_id = $.jstree.reference('#snapshot_tree').get_selected()[0];
        var $servers_td = $("#server_table tbody tr input:checked");
        var server_id = $servers_td.closest('tr').attr('id');
        $("#delete_snapshot").attr("disabled", "disabled");
        $.ajax({
            type: "DELETE",
            url: project_url + "/servers/" + server_id + "/snapshot/" + snapshot_id,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.debug("Delete a snapshot success!")
            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                $("#delete_snapshot").removeAttr("disabled");
                all_snapshot_flow()
            }
        });
    })
}

function register_roll_back_snapshot() {
    $("#rollback_snapshot").off("click").on("click", function () {
        var snapshot_id = $.jstree.reference('#snapshot_tree').get_selected()[0];
        var $servers_td = $("#server_table tbody tr input:checked");
        var server_id = $servers_td.closest('tr').attr('id');

        $("#rollback_snapshot").attr("disabled", "disabled");
        $("#snapshot_tree").isLoading({
            text: "恢复中",
            position: "overlay",
        });

        $(".isloading-overlay").css("width", '53%');

        $.ajax({
            type: "POST",
            url: project_url + "/servers/" + server_id + "/snapshot/" + snapshot_id,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.debug("Roll back a snapshot success!")
            },
            error: function (e) {
                alert_error(e);
            },
            complete: function () {
                $("#rollback_snapshot").removeAttr("disabled");
                $("#snapshot_tree").isLoading("hide");
                all_snapshot_flow()
            }
        });
    })
}

function click_bind_tag(){
    $("#tag_server").on("click",function(){
        var $servers_td = $("#server_table tbody tr input:checked");
        var server_id = $($servers_td[0]).closest('tr').attr('id');
        var _tr = $($servers_td[0]).closest('tr');
        $("#tag_resource_id").val(server_id);
        getTags(_tr);
    });
}

function getTags(_tr){
    $.ajax({
        type: "GET",
        url: project_url + "/tags",
        async: true,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType:"json",
        success: function (data) {
            if(_tr!=undefined){
                renderTags(data.tags,_tr)
            }
            renderMultipleSelect(data.tags);
        },
        error: function (e) {
            alert_error(e);
        }
    });
}

function renderMultipleSelect(data){
    $("#tag_dropdown").html("<li>所有标签</li>");
    $("#tags_now").html("");
    for(var i=0;i<data.length;i++){
        var li = $("<li></li>");
        var content = '<span tag_id=' + data[i].id + ' class="' + data[i].color + '_bg label span_color">'+data[i].name+'</span>';
        li.html(content);
        li.attr("tag_id",data[i].id);
        $("#tag_dropdown").append(li);
        $("#tags_now").append(content);
    }
}

function click_tag_dropdown(){
    $(document).on("click","#tag_dropdown li",function(){
        if($(this).attr("tag_id")==null){
            clearTags();
        }
        else{
            //clearTags();
            $("#tags_now>span[tag_id=" + $(this).attr("tag_id") + "]").show();
            $("#tags_now>span[tag_id=" + $(this).attr("tag_id") + "]").addClass("open");
            var open_list = $("#tags_now>.open");


            //只显示特定的标签
            /*
            $("#server_list>tr").hide();
            for(var i=0;i<open_list.length;i++){
                $("._tag_" + open_list.eq(i).attr("tag_id")).show();
            }
            */

            var new_public_server_list = [];
            for(var i=0;i<public_server_list.length;i++){
                var match = false;
                for(var j=0;j<public_server_list[i].tags.length;j++){
                    for(var k=0;k<open_list.length;k++){
                        if(public_server_list[i].tags[j].id==open_list.eq(k).attr("tag_id")){
                            match = true;
                            break;
                        }
                    }
                    if(match){
                        break;
                    }
                }
                if(match){
                    new_public_server_list.push(public_server_list[i]);
                }
            }
            table_pagination(new_public_server_list);
        }
    });
    $(document).on("click","#tags_now>span",function(){
        $(this).hide();
        $(this).removeClass("open");

        //$("._tag_" + $(this).attr("tag_id")).hide();
        var open_list = $("#tags_now>.open");
        var new_public_server_list = [];
        for(var i=0;i<public_server_list.length;i++){
            var match = false;
            for(var j=0;j<public_server_list[i].tags.length;j++){
                for(var k=0;k<open_list.length;k++){
                    if(public_server_list[i].tags[j].id==open_list.eq(k).attr("tag_id")){
                        match = true;
                        break;
                    }
                }
                if(match){
                    break;
                }
            }
            if(match){
                new_public_server_list.push(public_server_list[i]);
            }
        }
        table_pagination(new_public_server_list);


        //是否全部隐藏
        var tags = $("#tags_now>span");
        for(var i=0;i<tags.length;i++){
            if(tags.eq(i).css("display")!="none"){
                return;
            }
        }
        clearTags();
    });
}

function clearTags(){
    //$("#server_list>tr").show();
    table_pagination(public_server_list);
    $("#tags_now>span").hide();
    $("#tags_now>span").removeClass("open");
}

function renderTags(data,_tr){
    $("#tag_tbody").html("");
    for(var i=0;i<data.length;i++){
        var tr = $("<tr></tr>");
        tr.attr("id",data[i].id);
        var _checked = false;
        if(_tr.hasClass("_tag_" + data[i].id)){
            _checked = true;
        }
        var tr_body = '<td style="width:50px;"><input type="checkbox" ' + (_checked?'checked="checked"':'') + '/></td>'+
                '<td style="width:150px;"><span class="' + data[i].color + '_bg label span_color">'+data[i].name+'</span></td>';
        tr.append(tr_body);
        $("#tag_tbody").append(tr);
    }
}

function registerTagButton(){
    $("#submit_tag").on("click",function(){
        var data = {};
        data.tag_list=[];
        data.resource_list=[];
        var tags = $("#tag_tbody tr input[type=checkbox]:checked");
        for(var i=0;i<tags.length;i++){
            data.tag_list.push(tags.eq(i).parents("tr").attr("id"));
            data.resource_list.push($("#tag_resource_id").val());
        }
        var undata = {};
        undata.tag_list=[];
        undata.resource_list=[];
        var untags = $("#tag_tbody tr input[type=checkbox]:not(:checked)");
        for(var i=0;i<untags.length;i++){
            undata.tag_list.push(untags.eq(i).parents("tr").attr("id"));
            undata.resource_list.push($("#tag_resource_id").val());
        }
        if(data.tag_list.length){
            $.ajax({
                type:"POST",
                url:project_url + "/tag_bind",
                data:JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(){
                    if(undata.tag_list.length){
                        $.ajax({
                            type:"DELETE",
                            url:project_url + "/tag_bind",
                            data:JSON.stringify(undata),
                            headers: {
                                'Content-Type': 'application/json',
                                "RC-Token": $.cookie("token_id")
                            },
                            success:function(){
                                location.reload();
                            },
                            error:function(e){
                                //console.log(e);
                                $("#tag_server_modal").modal("hide");
                                alert_error(e);
                            }
                        });
                    }
                    else{
                        location.reload();
                    }
                },
                error:function(e){
                    //console.log(e);
                    $("#tag_server_modal").modal("hide");
                    alert_error(e);
                }
            });
        }
        else{
            if(undata.tag_list.length){
                $.ajax({
                    type:"DELETE",
                    url:project_url + "/tag_bind",
                    data:JSON.stringify(undata),
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(){
                        location.reload();
                    },
                    error:function(e){
                        $("#tag_server_modal").modal("hide");
                        alert_error(e);
                    }
                });
            }
            else{
                location.reload();
            }
        }

    });
}

function click_clone_server(){
    $("#clone").click(function(){

        $("#submit_clone").addClass("form_general_button");
        $("#submit_clone").removeClass("disabled_button");
        $("#submit_clone").removeAttr("disabled");

        var get_flavors= function(){
            $.ajax({
                type: "get",
                url: project_url + "/flavors",
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_clone_flavor(data);
                },
                error: function (e) {
                    alert_error(e)
                }
            });
        };
        var get_networks = function(){
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
                    render_clone_network(data);
                },
                error: function (e) {
                    alert_error(e)
                }
            });
        };

        var get_keypairs = function(){
            $.ajax({
                type:"GET",
                url:project_url + "/keypairs",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                dataType:"json",
                success:function(data){
                    render_clone_keypair(data);
                },
                error: function (e) {
                    alert_error(e)
                }
            });
        };

        var get_clone_availability_zone = function ()
        {
            $.ajax({
                type: "get",
                url: project_url + "/availability-zones?need_ag=0",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (e) {
                    data = JSON.parse(e).availabilityZoneInfo;
                    $("#clone_server_availability_zone").html("");
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].zoneState['available']) {
                            var op = "<option value='" + data[i].zoneName + "'>" + data[i].zoneName + "</option>";
                            $("#clone_server_availability_zone").append(op);
                        }
                    }
                },
                error: function () {
                    alert_error(e)
                }
            });
        };

        get_flavors();
        get_networks();
        get_keypairs();
        get_clone_availability_zone();
    });
}

function render_clone_flavor(data){
    //console.log(data);
    var server_disk = $("#server_table tbody tr input:checked").parents("tr").attr("disk");
    //console.log(server_disk);
    $("#server_flavor").empty();
    var default_option = '<option selected="selected" value="">选择配置</option>';
    $("#server_flavor").append(default_option);

    for(var i=0,l=data.length;i<l;i++){
        if(data[i].disk <parseInt(server_disk)){
            //console.log(data[i].disk);
            continue;
        }
        var select_option = $("<option></option>");
        var mem = "";
        if(data[i].ram>1024){
            mem = data[i].ram /1024 + "GB";
        }else{
            mem = data[i].ram + "MB";
        }
        select_option.attr("value",data[i].id);
        select_option.text(data[i].name+"("+data[i].vcpus+"核"+"/"+mem+")");
        $("#server_flavor").append(select_option);
    }
}

function render_clone_network(data){
    //console.log(data);

    $("#server_network").empty();
    var default_option = '<option selected="selected" value="">选择网络</option>';
    $("#server_network").append(default_option);

    for(var i=0,l=data.length;i<l;i++){
        var select_option = $("<option></option>");

        select_option.attr("value",data[i].network_id);
        select_option.text(data[i].network_name+"("+data[i].cidr+")");
        $("#server_network").append(select_option);
    }
}

function render_clone_keypair(data){
    $("#server_keypair").html("");
    var default_option = '<option selected="selected" value="">选择密钥</option>';
    $("#server_keypair").append(default_option);
    for(var i=0,l=data.length;i<l;i++){
        var select_option = $("<option></option>");
        select_option.attr("value",data[i].name);
        select_option.text(data[i].name);
        $("#server_keypair").append(select_option);
    }

}

function submit_clone_server(){
    $("#submit_clone").click(function(){
        var data = {};
        var server_id = $("#server_table tbody tr input:checked").parents("tr").attr("id");
        //console.log(server_id);
        if(!submitValidation("clone_form")){
            return;
        }
        var name = $("#clone_name").val();
        var flavor_id = $("#server_flavor").val();
        var network_id = $("#server_network").val();
        var authority_type = $("#server_authority").val();
        var keypair = $("#server_keypair").val();
        var username = $("#server_username").val();
        var password = $("#server_password").val();
        var availability_zone = $("#clone_server_availability_zone").val();

        data.name = name;
        data.flavor_id = flavor_id;
        data.network_id = network_id;
        data.availability_zone = availability_zone;
        if(authority_type=="密钥"){
            data.key_name = keypair;
        }else{
            data.user_name = username;
            data.password = password;
        }


        $.ajax({
            type:"POST",
            url:project_url + "/server_clone/"+server_id,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                location.reload();
            },
            error:function(e){
                $("#clone_modal").modal('hide');
                alert_error(e);
            }
        });

        $("#submit_clone").addClass("disabled_button");
        $("#submit_clone").removeClass("form_general_button");
        $("#submit_clone").attr("disabled", "disabled");
    });
}

function click_backup_server(){
    $("#backup").click(function(){

        var $servers_td = $("#server_table tbody tr input:checked");
        var server_id = $servers_td.closest('tr').attr('id');

        $("#submit_backup").addClass("form_general_button");
        $("#submit_backup").removeClass("disabled_button");
        $("#submit_backup").removeAttr("disabled");

        var get_snapshots = function(){
            var params = {
                "instance_id": server_id
            };

            $.ajax({
                type: "get",
                url: project_url + "/servers/snapshots",
                data: params,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_backup_snapshot(data);
                },
                error: function (e) {
                    alert_error(e)
                }
            });
        };

        get_snapshots();
    });
}

function render_backup_snapshot(data){
    console.log(data);

    $("#server_snapshot").empty();
    var default_option = '<option selected="selected" value="">选择快照</option>';
    $("#server_snapshot").append(default_option);

    for(var i=0,l=data.length;i<l;i++){
        var select_option = $("<option></option>");

        select_option.attr("value",data[i].id);
        select_option.text(data[i].name+"("+data[i].description+")");
        $("#server_snapshot").append(select_option);
    }
}

function submit_backup_server(){
    $("#submit_backup").click(function(){
        var data = {};
        var server_id = $("#server_table tbody tr input:checked").parents("tr").attr("id");
        //console.log(server_id);
        if(!submitValidation("backup_server_form")){
            return;
        }
        var name = $("#backup_name").val();
        var snapshot_id = $("#server_snapshot").val();
        var format_raw_to_qcow2 = $("#format_raw_to_qcow2").val();

        data.name = name;
        data.snapshot_id = snapshot_id;
        data.format_raw_to_qcow2 = format_raw_to_qcow2;
        console.log("create server backup request data is:" + data);

        $.ajax({
            type:"POST",
            url:project_url + "/server_backups",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                location.reload();
            },
            error:function(e){
                $("#clone_modal").modal('hide');
                alert_error(e);
            }
        });

        $("#submit_backup").addClass("disabled_button");
        $("#submit_backup").removeClass("form_general_button");
        $("#submit_backup").attr("disabled", "disabled");
    });
}

function get_billPolicy(){
    $.ajax({
        type: "get",
        url: project_url + "/active_price_scheme",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            $("#create_server_modal").attr("prices",JSON.stringify(data.prices));
            initVolumeBill(data.prices);
        },
        error: function (e) {
            alert_error(e)
        }
    });
}


function get_keypair(){
    $.ajax({
        type: "get",
        url:project_url + "/keypairs",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success:function(e){
            data = JSON.parse(e);
            $("#create_server_keypair").html("");
            for(var i=0;i<data.length;i++){
                var op = "<option value='" + data[i].name + "'>" + data[i].name + "</option>";
                $("#create_server_keypair").append(op);
            }
        },
        error:function(){
            alert_error(e)
        }
    });
}

function get_availability_zone(){
    $.ajax({
        type: "get",
        url:project_url + "/availability-zones?need_ag=0",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success:function(e){
            data = JSON.parse(e).availabilityZoneInfo;
            $("#create_server_availability_zone").html("");
            for(var i=0;i<data.length;i++){
                if (data[i].zoneState['available']){
                    var op = "<option value='" + data[i].zoneName + "'>" + data[i].zoneName + "</option>";
                    $("#create_server_availability_zone").append(op);
                }
            }
        },
        error:function(){
            alert_error(e)
        }
    });
}

function registerServerAuthority(){
    $("#create_server_authority").change(function(){
        console.log($(this).val());
        if($(this).val()=="密钥"){
            $(".authority_1").show();
            $(".authority_2").hide();
        }else{
            $(".authority_2").show();
            $(".authority_1").hide();
        }
    });
    $("#create_server_authority").change();
}

function registerCloneAuthority(){
    $("#server_authority").change(function(){
        console.log($(this).val());
        if($(this).val()=="密钥"){
            $(".cl_au_1").show();
            $(".cl_au_2").hide();
        }else{
            $(".cl_au_2").show();
            $(".cl_au_1").hide();
        }
    });
    $("#server_authority").change();
}
}]);