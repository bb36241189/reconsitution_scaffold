/**
 * Created by lenovn on 2015/12/24.
 */

undefined){

    $scope.click_show_hardware = click_show_hardware;
    /********************老代码************************************/
    $(function () {
    disabled_button();

    init_host_table("");
    //get_init_data();

    click_add_host();
    click_edit_host();
    click_delete_host();
    click_restart_host();
    click_start_host();
    click_stop_host();
    click_refresh_host();

    keyup_search_volume();
    click_search_volume();

    room_select_change();

    click_submit_start_host();
    click_submit_restart_host();
    click_submit_stop_host();
    click_submit_create_host();
    click_submit_delete_host();
    click_submit_edit_host();

    set_navigator();
    set_export_href();
});

function set_export_href() {
    var export_url = project_url + "/export/export_host/";
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
        $(".navbar-words").html("基础设施 > 物理服务器");
    }
}

//这个事件是在翻页时候用的
function table_pagination(data) {
    var data_length = data.length;
    if (!data_length) {
        $("#table_num").hide();
    }
    $("#total_num").html(data_length);
    var page_num = 10;
    if (!data_length || data_length <= page_num) {
        render_host_table(data);
        return;
    }
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
        render_host_table(data.slice(start, end));
    }
}

function click_host_table_tr() {
    $("#host_table tbody tr").click(function () {
        //console.log("click");
        if ($(this).hasClass("table_body_tr_change")) {

            $(this).removeClass("table_body_tr_change");
            //$(this).children("td").eq(0).find("input").css('display','none');
            $(this).children("td").eq(0).find("input").prop("checked", false);

            //clear_table_body("#cabinet_host_tbody");
            //$("#bottom_title_content").html("");

        }
        else {

            var checked_trs = $("#host_table tbody tr");
            //console.log(checked_rooms);
            checked_trs.each(function () {
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });

            $(this).addClass("table_body_tr_change");
            //$(this).children("td").eq(0).find("input").css('display','block');
            $(this).children("td").eq(0).find("input").prop("checked", true);

            //console.log($(this).attr("id"));
            //set_cabinet_host($(this).attr("id"))

            //create_detail_data($(this).children("td"));
            get_host_data($(this).attr("id"));

            //$("#bottom_title_content").html($(this).children("td").eq(1).text());

        }

        if (checked_table_tr("#host_table")) {
            recover_button();
        }
        else {
            disabled_button();
        }

    });
}

function set_host_default_checked() {
    $("#host_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
    var tr_id = $("#host_tbody").find("tr:eq(0)").attr("id");

    $("#host_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);

    recover_button();
    get_host_data(tr_id);
}

function render_host_table(data) {
    disabled_button();

    var hosts = $("#host_tbody");
    clear_table_body("#host_tbody");
    if (data.length) {
        for (var i = 0; i < data.length; i++) {
            var table_tr = $("<tr></tr>");
            table_tr.attr("id", data[i].id);

            var state = "";
            var style = "";
            if(data[i].openstack_node){
                if (data[i].state == "up") {
                    state = "运行";
                    style = "success";
                }
                else if (data[i].state == "down") {
                    state = "关机"
                    style = "danger";
                }
                else {
                    state = "未知"
                    style = "warning";
                }
            }else{
                if (data[i].status == 1) {
                    state = "运行";
                    style = "success";
                }
                else if (data[i].state == 0) {
                    state = "关机";
                    style = "danger";
                }
                else {
                    state = "未知";
                    style = "warning";
                }
            }
            //硬件事件处理
            var eventNum = -1;
            if(typeof (data[i].event_num)  != "undefined" ){
                eventNum = data[i].event_num == null || data[i].event_num == "" ? -1 : data[i].event_num;
            }
            var url =  data[i].ipmi_ip;
            var event_tr = '<td title="event_num"><a href="http://'+  url +'" target="_blank">' + eventNum + '</a></td>';
            if(eventNum == -1){
                event_tr = '<td title="event_num">IPMI不可达</td>';
            }
            //传感器处理
            var hardware = '<td title=show_hardware><a href="javaScript:void(0);" ng-click="click_show_hardware(\''+data[i].id+'\');">查看</a></td>';
            if(eventNum == -1){
                hardware = '<td title=show_hardware>--</a></td>';
            }

            var table_body = '<td><input type="checkbox" /></td>' +
                '<td title=' + data[i].hostname + '>' + '<a class="load_content" href="' + project_url + '/static/index.html#/app/host/' + data[i].id + '">' + data[i].hostname + '</td>' +
                '<td title=' + data[i].manage_ip + '>' + data[i].manage_ip + '</td>' +
                '<td title=' + data[i].cpu + '>' + (data[i].cpu==""?'':(data[i].cpu + '核')) + '</td>' +
                '<td title=' + data[i].mem + '>' + (data[i].mem==""?'': ((parseInt(data[i].mem)/1024).toFixed(0) + 'GB')) + '</td>' +
                '<td title=' + data[i].type + '>' + data[i].type + '</td>' +
               // '<td title=' + data[i].manager + '>' + data[i].manager + '</td>' +
                '<td title=' + state + '><span class="label label-' + style + '">' + state + '</span></td>'+ event_tr + hardware;

            table_tr.append(table_body);
            hosts.append(table_tr);
        }
        //$("#current_num").html(data.length);
        click_host_table_tr();

        //set_host_default_checked();

        //register_async();

    }
    else {
        var table_tr = '<tr><td colspan="8">没有物理服务器</td></tr>';
        hosts.append(table_tr);
    }
}

function init_host_table(search_name) {
    $.ajax({
        type: "GET",
        url: project_url + "/hosts"+"?hostname="+search_name,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType: "json",
        success: function (data) {
            //var host_data = JSON.parse(data);
            table_pagination(data);
                //render_host_table(host_data);
        },
        error: function (e) {
            SAlert.showError(e);
        }

    });
}

function clear_table_body(tbody_id) {
    $(tbody_id).html("");
}

function disabled_button() {
    $('#restart_host').attr('disabled', "disabled");
    $("#restart_host").css("cursor", "not-allowed");
    $("#restart_host").addClass("disabled_button");
    $("#restart_host").removeClass("general_button");

    $('#delete_host').removeAttr('data-target');
    $('#delete_host').addClass("disabled_li");
    $("#delete_host").removeClass("danger_li");

    //$("#delete_host").css("cursor", "not-allowed");
    //$("#delete_host").css("color", "red");

    $('#edit_host').removeAttr('data-target');
    //$("#edit_host").css("cursor", "not-allowed");
    $("#edit_host").addClass("disabled_li");
    $("#edit_host").removeClass("dropmenu_li");

    $('#stop_host').removeAttr('data-target');
    //$("#stop_host").css("cursor", "not-allowed");
    $("#stop_host").addClass("disabled_li");
    $("#stop_host").removeClass("dropmenu_li");

    $('#start_host').removeAttr('data-target');
    //$("#restart_host").css("cursor", "not-allowed");
    $("#start_host").addClass("disabled_li");
    $("#start_host").removeClass("dropmenu_li");

}

function recover_button() {
    $("#restart_host").removeAttr('disabled');
    $("#restart_host").css("cursor", "pointer");
    $("#restart_host").removeClass("disabled_button");
    $("#restart_host").addClass("general_button");

    $("#delete_host").attr('data-target', "#delete_host_modal");
    //$("#delete_host").css("cursor", "pointer");
    $("#delete_host").addClass("danger_li");
    $("#delete_host").removeClass("disabled_li");

    $("#edit_host").attr('data-target', "#edit_host_modal");
    //$("#edit_host").css("cursor", "pointer");
    $("#edit_host").addClass("dropmenu_li");
    $("#edit_host").removeClass("disabled_li");

    $("#stop_host").attr('data-target', "#stop_host_modal");
    //$("#stop_host").css("cursor", "pointer");
    $("#stop_host").addClass("dropmenu_li");
    $("#stop_host").removeClass("disabled_li");

    $("#start_host").attr('data-target', "#start_host_modal");
    $("#start_host").addClass("dropmenu_li");
    $("#start_host").removeClass("disabled_li");

}

function checked_table_tr(table_id) {
    var checked_tr = $(table_id + " tbody" + " tr" + " input[type=checkbox]:checked");
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

function get_host_data(host_id) {
    $.ajax({
        type: "GET",
        url: project_url + "/host/" + host_id,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        //dataType: "json",
        success: function (data) {
            if (data) {
                //console.log(data);
                var host_data = JSON.parse(data);
                init_host_edit_form(host_data);
            }

        },
        error: function (e) {
            //console.log("error");
            SAlert.showError(e);
        }

    });

}

function set_rooms_data(data) {
    $("#create_room_id").empty();
    var default_option = '<option selected="selected" value="">请选择机房</option>';
    $("#create_room_id").append(default_option);

    for (var i = 0, l = data.length; i < l; i++) {
        var room_option = $("<option></option>");
        //console.log(data[i].id);
        //console.log(data[i].name);
        room_option.attr("value", data[i].id);
        room_option.text(data[i].name);
        $("#create_room_id").append(room_option);
    }

    set_room_cabinets([], "#create_cabinet_id");
}

function room_select_change() {
    $("#create_room_id").change(function () {
        //console.log($(this).val());
        if (!$(this).val()) {
            set_room_cabinets([], "#create_cabinet_id");
            return;
        }
        $.ajax({
            type: "GET",
            url: project_url + "/room/" + $(this).val() + "/cabinets",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            dataType: "json",
            success: function (data) {
                    //var cabinet_data = JSON.parse(data);
                set_room_cabinets(data, "#create_cabinet_id");
            },
            error: function (e) {
                SAlert.showError(e);
            }

        });
        //console.log($(this).find("option:checked").text());
    })
    $("#edit_room_id").change(function () {
        //$("#edit_host_form .host-form-right select[name='room_id']").change(function() {
        //console.log($(this).val());
        $.ajax({
            type: "GET",
            url: project_url + "/room/" + $(this).val() + "/cabinets",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            dataType: "json",
            success: function (data) {

                //var cabinet_data = JSON.parse(data);
                set_room_cabinets(data, "#edit_cabinet_id");
            },
            error: function (e) {
                SAlert.showError(e);
            }

        });
        //console.log($(this).find("option:checked").text());
    })
}

function set_room_cabinets(data, jquery_select) {
    $(jquery_select).empty();
    var default_option = '<option selected="selected" value="">请选择机柜</option>';
    $("#create_cabinet_id").append(default_option);
    for (var i = 0, l = data.length; i < l; i++) {
        var cabinet_option = $("<option></option>");
        //console.log(data[i].id);
        //console.log(data[i].cabinet_name);
        cabinet_option.attr("value", data[i].id);
        cabinet_option.text(data[i].cabinet_name);
        $(jquery_select).append(cabinet_option);
    }
}

function click_submit_create_host() {
    $("#submit_create_host").click(function () {
        if(!submitValidation("create_host_form")){
            return;
        }
        var host_form = getFormObject("#create_host_form");



        $.ajax({
            type: "POST",
            url: project_url + "/hosts",
            data: JSON.stringify(host_form),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success: function (msg) {
                //$("#create_host_modal").modal('hide');
                location.reload()
            },
            error: function (e) {
                $("#create_host_modal").modal('hide');
                SAlert.showError(e);
            }
        });

        $("#submit_create_host").addClass("disabled_button");
        $("#submit_create_host").removeClass("form_general_button");
        $("#submit_create_host").attr("disabled", "disabled");
    });

}

function click_submit_delete_host() {
    $("#submit_delete_host").click(function () {
        var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        $.ajax({
            type: "DELETE",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            url: project_url + "/host/" + host_id,
            success: function (msg) {
                location.reload();
            },
            error: function (e) {
                $("#delete_host_modal").modal("hide");
                SAlert.showError(e);
                //console.log(e);
            }

        });

        $("#submit_delete_host").addClass("disabled_button");
        $("#submit_delete_host").removeClass("form_danger_button");
        $("#submit_delete_host").attr("disabled", "disabled");
    })
}

function click_submit_edit_host() {
    $("#submit_edit_host").click(function () {
        if(!submitValidation("edit_host_form")){
            return;
        }
        var host_form = getFormObject("#edit_host_form");
        var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        //console.log(host_form);
        host_form.manage_ip = $("#edit_manage_ip").val();
        //return;
        $.ajax({
            type: "PUT",
            url: project_url + "/host/" + host_id,
            data: JSON.stringify(host_form),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success: function (msg) {
                //$("#edit_host_modal").modal('hide');
                location.reload()
            },
            error: function (e) {
                $("#edit_host_modal").modal('hide');
                SAlert.showError(e);
                //console.log(e);
            }
        });

        $("#submit_edit_host").addClass("disabled_button");
        $("#submit_edit_host").removeClass("form_general_button");
        $("#submit_edit_host").attr("disabled", "disabled");

    });
}

function click_submit_start_host() {
    $("#submit_start_host").click(function () {
        var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        var host_action = {action: "on"};
        $.ajax({
            type: "POST",
            url: project_url + "/host/" + host_id + "/action",
            data: JSON.stringify(host_action),
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success: function (msg) {
                //$("#start_host_modal").modal('hide');
                location.reload();
            },
            error: function (e) {
                $("#stop_host_modal").modal('hide');
                SAlert.showError(e);
                //console.log(err);
            }
        });

        $("#submit_start_host").addClass("disabled_button");
        $("#submit_start_host").removeClass("form_danger_button");
        $("#submit_start_host").attr("disabled", "disabled");

    });
}

function click_submit_stop_host() {
    $("#submit_stop_host").click(function () {
        var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        var host_action = {action: "off"};
        $.ajax({
            type: "POST",
            url: project_url + "/host/" + host_id + "/action",
            data: JSON.stringify(host_action),
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success: function (msg) {
                //$("#stop_host_modal").modal('hide');
                location.reload();
            },
            error: function (e) {
                $("#stop_host_modal").modal('hide');
                SAlert.showError(e);
                //console.log(e);
            }
        });

        $("#submit_stop_host").addClass("disabled_button");
        $("#submit_stop_host").removeClass("form_danger_button");
        $("#submit_stop_host").attr("disabled", "disabled");
    });
}

function click_submit_restart_host() {
    $("#submit_restart_host").click(function () {
        var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        var host_action = {action: "reset"};
        $.ajax({
            type: "POST",
            url: project_url + "/host/" + host_id + "/action",
            data: JSON.stringify(host_action),
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success: function (msg) {
                //$("#restart_host_modal").modal('hide');
                location.reload();
            },
            error: function (e) {
                $("#restart_host_modal").modal('hide');
                SAlert.showError(e);
                //console.log(e);
            }
        });

        $("#submit_restart_host").addClass("disabled_button");
        $("#submit_restart_host").removeClass("form_danger_button");
        $("#submit_restart_host").attr("disabled", "disabled");
    });
}

function click_refresh_host() {
    $("#refresh_host").click(function () {
        init_host_table("");
        disabled_button();
    });
}

function click_add_host() {
    $("#add_host").click(function () {
        $("#submit_create_host").addClass("form_general_button");
        $("#submit_create_host").removeClass("disabled_button");
        $("#submit_create_host").removeAttr("disabled");

        clearFormObject("#create_host_form");

        $.ajax({
            type: "GET",
            url: project_url + "/infrastructure/rooms",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            dataType: "json",
            success: function (data) {
                set_rooms_data(data);
            },
            error: function (e) {
                SAlert.showError(e);
            }

        });
    })
}

function click_edit_host(){
    $("#edit_host").click(function(){
        $("#submit_edit_host").addClass("form_general_button");
        $("#submit_edit_host").removeClass("disabled_button");
        $("#submit_edit_host").removeAttr("disabled");
    });
}

function click_delete_host(){
    $("#delete_host").click(function(){
        $("#submit_delete_host").addClass("form_danger_button");
        $("#submit_delete_host").removeClass("disabled_button");
        $("#submit_delete_host").removeAttr("disabled");
    })
}

function click_restart_host(){
    $("#restart_host").click(function(){
        $("#submit_restart_host").addClass("form_danger_button");
        $("#submit_restart_host").removeClass("disabled_button");
        $("#submit_restart_host").removeAttr("disabled");
    })
}

function click_start_host(){
    $("#start_host").click(function(){
        $("#submit_start_host").addClass("form_danger_button");
        $("#submit_start_host").removeClass("disabled_button");
        $("#submit_start_host").removeAttr("disabled");
    })
}

function click_stop_host(){
    $("#stop_host").click(function(){
        $("#submit_stop_host").addClass("form_danger_button");
        $("#submit_stop_host").removeClass("disabled_button");
        $("#submit_stop_host").removeAttr("disabled");
    })
}

function init_host_edit_form(data) {
    $("#edit_user").val(data.user);
    $("#edit_manage_ip").val(data.manage_ip);
    $("#edit_ipmi_ip").val(data.ipmi_ip);
    $("#edit_ipmi_user").val(data.ipmi_user);
    $("#edit_description").val(data.description);
    $("#edit_location_from").val(data.start);
    $("#edit_location_to").val(data.end);

    set_edit_form_room(data.room_id, data.cabinet_id);
}

function set_edit_form_room(room_id, cabinet_id) {
    $.ajax({
        type: "GET",
        url: project_url + "/infrastructure/rooms",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType: "json",
        success: function (data) {
                //var room_data = JSON.parse(data);
            display_edit_form_room(data, room_id);
            display_edit_form_cabinet(room_id, cabinet_id);
        },
        error: function (e) {
            SAlert.showError(e);
        }

    });

}

function display_edit_form_room(data, room_id) {
    $("#edit_room_id").empty();
    //var default_option = '<option selected="selected" value="">请选择机房</option>';
    //$("#room_id").append(default_option);

    for (var i = 0, l = data.length; i < l; i++) {
        var room_option = $("<option></option>");
        room_option.attr("value", data[i].id);
        room_option.text(data[i].name);
        if (data[i].id == room_id) {
            room_option.attr("selected", "selected");
        }
        $("#edit_room_id").append(room_option);
    }
}

function display_edit_form_cabinet(room_id, cabinet_id) {
    var cabinet_room_id = "";
    if (room_id) {
        cabinet_room_id = room_id;
    }else{
        cabinet_room_id = $("#edit_room_id").val();
    }
    if(!cabinet_room_id){
        return;
    }
    //console.log(cabinet_room_id);
    var set_room_cabinet = function (data, cabinet_id) {
        $("#edit_cabinet_id").empty();
        //console.log(data);
        for (var i = 0, l = data.length; i < l; i++) {
            var cabinet_option = $("<option></option>");
            //console.log(data[i].id);
            //console.log(data[i].cabinet_name);
            cabinet_option.attr("value", data[i].id);
            cabinet_option.text(data[i].cabinet_name);

            if (data[i].id == cabinet_id) {
                cabinet_option.attr("selected", "selected");
            }
            $("#edit_cabinet_id").append(cabinet_option);
        }
    }
    $.ajax({
        type: "GET",
        url: project_url + "/room/" + cabinet_room_id + "/cabinets",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType: "json",
        success: function (data) {
            //console.log(data);
            //var cabinet_data = JSON.parse(data);
            set_room_cabinet(data, cabinet_id);
        },
        error: function (e) {
            SAlert.showError(e);
        }
    });
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

function click_show_hardware(id) {
    $.ajax({
        type: "GET",
        url: project_url + "/ipmi/" + id,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType: "json",
        success: function (data) {
            var updateTime = data.update_date;
            var hostName = data.host_name;
            $('#hardware_hostName').html('主机名：'+ hostName);
            $('#hardware_updateTime').html('更新时间：'+updateTime);
            var monitor = jQuery.parseJSON(data.monitor_data);
            initHardwareTable(monitor);
            console.log(JSON.stringify(monitor));
            $("#show_host_hardware").modal('show');
        },
        error: function (e) {

        }
    });
}
function initHardwareTable(monitor){
    var body = $('#hardware_tbody');
    clear_table_body("#hardware_tbody");
    if(monitor == null || monitor.length  ==0 || (typeof (monitor[0].sh) != "undefined" && monitor[0].sh!=null) ){
       return;
    }
    for (var i = 0; i < monitor.length; i++) {
         var table_tr = $("<tr></tr>");
         var _temp = monitor[i];
         for(var key in _temp){
             var table_body =  '<td title=' + key + '>' + key+ '</td>';
             var array = _temp[key].split(',');
             var value = array[0] == null || array[0] == 'na' || array[0] == "" ? '--' : array[0];
             table_body += '<td title=value >' + value + '</td>';
             var unit = array[1] == null || array[1] == 'na' || array[1] == "" ? '--' : array[1];
             table_body += '<td title=unit >' + unit + '</td>';
             var style = array[2] == "ok" ? 'success' : 'default';
             var status = array[2] == "na" ? '无' : array[2];
             table_body += '<td title=status ><span class="label label-' + style+ '">' + status + '</span></td>';
             table_tr.append(table_body);
             body.append(table_tr);
         }
     }
}

/*
 function click_edit_host(){
 $("#edit_host").click(function() {
 var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
 console.log(host_id);
 //init_host_edit_form(data);
 });
 }*/

/*
 function click_get_status_host(){
 $("#get_host_status").click(function () {
 var host_id = $("#host_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
 var host_action = {action: "status"};
 $.ajax({
 type:"POST",
 url:"/host/" + host_id + "/action",
 data: JSON.stringify(host_action),
 headers: {'Content-Type': 'application/json'},
 success:function(msg){
 //console.log("success");
 alert("success");
 console.log(msg);
 },
 error:function(err){
 //console.log("error");
 alert("error");
 console.log(err);
 }
 });
 });
 }
 */

/*
Discovery host module
*/
$(function (){
    register_sync_host()
});

function register_sync_host(){
    $("#submit_sync_host").click(function(){
        var path = project_url + "/hosts-discovery";
        $("#submit_sync_host").attr("disabled", "disabled");
        $.ajax({
            type: "get",
            url: path,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                //console.debug("Sync data finished!")
                $("#refresh_host").click()
            },
            complete: function(){
                $("#submit_sync_host").removeAttr("disabled");
                $("#sync_host_modal").modal('hide');
            },
            error: function(e){
                $("#sync_host_modal").modal('hide');
                SAlert.showError(e);
            }
        });
    })
}



function keyup_search_volume(){
    $("#search_host_input").keyup(function(){
        init_host_table($("#search_host_input").val());
    });
}

function click_search_volume(){
    $("#search_host_img").click(function(){
        init_host_table($("#search_host_input").val());
    });
}
});