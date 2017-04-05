/**
 * Created by shmily on 2017/2/14.
 */


app.factory("EventBus", function() {
    var eventMap = {};

    var EventBus = {
        on : function(eventType, handler) {
            //multiple event listener
            if (!eventMap[eventType]) {
                eventMap[eventType] = [];
            }
            eventMap[eventType].push(handler);
        },

        off : function(eventType, handler) {
            for (var i = 0; i < eventMap[eventType].length; i++) {
                if (eventMap[eventType][i] === handler) {
                    eventMap[eventType].splice(i, 1);
                    break;
                }
            }
        },

        fire : function(event) {
            var eventType = event.type;
            if (eventMap && eventMap[eventType]) {
                for (var i = 0; i < eventMap[eventType].length; i++) {
                    eventMap[eventType][i](event);
                }
            }
        }
    };
    return EventBus;
});


app.controller("pool",function($scope,$http,EventBus,SAlert,PermitStatus){
    var pool_transfer = {
        "ACTIVE":"可用",
        "INACTIVE":"不可用"
    };
    var pool_style={
        "ACTIVE":"success",
        "INACTIVE":"danger"
    };

    $scope.getPools = function(){
        $http({
            method:"GET",
            url:project_url + "/lb/pools",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.pool_table_pagination(data.pools);
        });
    };

    $scope.pool_table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderPools(data);
            $("#pools_pagination").hide();
            return;
        }
        $("#pools_pagination").show();
        //加入分页的绑定
        $("#pools_pagination").pagination(data_length, {
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

            if(jq.length>0){
                $scope.$apply(function(){
                    $scope.renderPools(data.slice(start, end));
                });
            }
            else{
                $scope.renderPools(data.slice(start, end));
            }
        }
    }

    $scope.renderPools = function(data){
        _.each(data,function(element,index,list){
            element["pool_style"] = pool_style[element.status];
            element["status_cn"] = pool_transfer[element.status];
        });
        if(data.length==0){
            $scope.loading_pool = "没有记录";
            $scope.bool_pools = false;
        }
        else{
            $scope.pools = data;
            $scope.bool_pools = true;
        }
    }

    $scope.row_click=function(e){
        var _list_name = "#pools_list tr";
        var _list_title = "#pools_list .animate_name";
        if(e.target.nodeName!="TD"){
            //点击了a标签
            var this_id = e.currentTarget.attributes["id"].value;
            var vip_id = e.currentTarget.attributes["vip_id"].value;
            EventBus.fire({
                type:"render_detail_event",
                data:{
                    this_id:this_id,
                    vip_id:vip_id
                }
            });
        }
        else{
            EventBus.fire({
               type:"hide_detail_event",
               data:{

               }
            });
        }

        if(e.target.nodeName=="TD" && $(e.currentTarget).hasClass("table_body_tr_change")){
            $(e.currentTarget).removeClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(e.currentTarget).addClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", true);
        }

        if ($("#pools_list tr input:checked").length) {
            enablePoolBtn(true);
            if($("#pools_list tr input:checked").eq(0).parent().parent().attr("vip_id")!=undefined && $("#pools_list tr input:checked").eq(0).parent().parent().attr("vip_id")!=""){
                enableFloatingIpBtn(true);
                enableVipBtn(false);
            }else{
                enableFloatingIpBtn(false);
                enableVipBtn(true);
            }
        }
        else {
            enablePoolBtn(false);
            enableFloatingIpBtn(false);
            disableVipBtn();
        }
    }

    function enablePoolBtn(bool){
        if(bool){
            $('#tool_delete_pool')
            .removeAttr('disabled')
            .removeClass("disabled_button");
            $('#tool_edit_pool,#tool_add_vip,#tool_link_health')
            .addClass('dropmenu_li')
            .removeClass("disabled_li");
            $('#tool_unlink_health')
            .addClass('danger_li')
            .removeClass("disabled_li");
        }
        else{
            $('#tool_delete_pool')
            .attr('disabled', "disabled")
            .addClass("disabled_button");
            $('#tool_edit_pool,#tool_add_vip,#tool_link_health')
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
            $('#tool_unlink_health')
            .addClass('disabled_li')
            .removeClass("danger_li");
        }
    }

    function enableVipBtn(bool){
        if(bool){
            $("#tool_add_vip")
            .addClass('dropmenu_li')
            .removeClass("disabled_li");
            $("#tool_delete_vip")
            .addClass('disabled_li')
            .removeClass("danger_li");
            $("#tool_edit_vip")
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
        }
        else{
            $("#tool_delete_vip")
            .addClass('danger_li')
            .removeClass("disabled_li");
            $("#tool_edit_vip")
            .addClass('dropmenu_li')
            .removeClass("disabled_li");
            $("#tool_add_vip")
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
        }
    }

    function disableVipBtn(){
        $("#tool_add_vip")
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
        $("#tool_delete_vip")
            .addClass('disabled_li')
            .removeClass("danger_li");
            $("#tool_edit_vip")
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
    }

    function enableFloatingIpBtn(bool){
        if(bool){
            $('#tool_floating_ip')
            .addClass('dropmenu_li')
            .removeClass("disabled_li");
        }
        else{
            $('#tool_floating_ip')
            .addClass('disabled_li')
            .removeClass("dropmenu_li");
        }
    }

    $scope.title_click=function(e){
        EventBus.fire({
            type:"show_detail_event",
            data:{}
        });
    }

    $scope.create_pool_click = function(){
        EventBus.fire({
            type:"create_pool_event",
            data:{}
        });
    }

    $scope.edit_pool_click = function(){
        EventBus.fire({
            type:"edit_pool_event",
            data:{}
        });
    }

    $scope.delete_pool_click = function(){
        EventBus.fire({
            type:"delete_pool_event",
            data:{}
        });
    }

    $scope.floating_ip_click = function(){
        EventBus.fire({
            type:"floating_ip_event",
            data:{}
        });
    }

    $scope.create_vip_click = function(){
        EventBus.fire({
            type:"create_vip_event",
            data:{}
        });
    }

    $scope.edit_vip_click = function(){
        EventBus.fire({
            type:"edit_vip_event",
            data:{}
        });
    }

    $scope.delete_vip_click = function(){
        EventBus.fire({
            type:"delete_vip_event",
            data:{}
        });
    }

    $scope.link_monitor_click = function(){
        EventBus.fire({
            type:"link_monitor_event",
            data:{}
        });
    }

    $scope.unlink_monitor_click = function(){
        EventBus.fire({
            type:"unlink_monitor_event",
            data:{}
        });
    }

    EventBus.on("getPools",function(e){
        $scope.getPools();
    });


    $scope.$watch('pools_change',function(){
       $scope.getPools();
        console.log("change");
    });

    EventBus.on("afterDeletePool",function(){
        enablePoolBtn(false);
        enableFloatingIpBtn(false);
        disableVipBtn();
    });

    $scope.loading_pool = "正在加载...";
    $scope.getPools();
    enablePoolBtn(false);
    enableFloatingIpBtn(false);
    disableVipBtn();
});

app.controller("pool_detail",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("render_detail_event",function(e){
        var vip_id = e.data.vip_id;
        var this_id = e.data.this_id;
        $scope.getPoolDetail(this_id);
        if(vip_id!=undefined&&vip_id!=""){
            $scope.get_vip_detail_data(vip_id);
            $scope.has_vip = true;
        }
        else{
            $scope.has_vip = false;
        }
    });

    EventBus.on("show_detail_event",function(e){
        $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
        }).animate({"right":"0px"});
    });

    EventBus.on("hide_detail_event",function(e){
        $scope.clear_pool_datail_data();
    });

    $scope.clear_pool_datail_data = function(){
        $(".operation_2").animate({"right":"-1000px"});
    }

    $scope.getPoolDetail=function(pool_id){
        $http({
            method:"GET",
            url:project_url + "/lb/pool/"+pool_id,
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            if (data) {
                $scope.render_pool_detail_data(data);
            }
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.render_pool_detail_data=function(data){
        $scope.id=data.id;
        $scope.name=data.name;
        $scope.description = data.description;
        $scope.vip_address = data.vip_address;
        $scope.vip_name = data.vip_name;
        $scope.subnet = data.subnet.cidr;
        $scope.protocol = data.protocol;
        $scope.lb_method = data.lb_method;
        $scope.status = data.status;

        $scope.loading_member = "正在加载...";
        if(data.members_addresses.length){
            $scope.members = data.members_addresses;
            $scope.has_members = true;
        }
        else{
            $scope.has_members = false;
            $scope.loading_member = "没有记录";
        }

        $scope.loading_monitor = "正在加载...";
        if(data.health_monitor_desc.length){
            $scope.monitors=data.health_monitor_desc;
            $scope.has_monitors =  true;
        }else{
            $scope.has_monitors = false;
            $scope.loading_monitor = "没有记录";
        }
    }

    $scope.get_vip_detail_data=function(vip_id){
        $http({
            method:"GET",
            url:project_url + "/lb/vip/"+vip_id,
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            if (data) {
                $scope.render_vip_detail_data(data);
            }
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.render_vip_detail_data = function(data){
        $scope.vip_status = data.status;
        $scope.vip_protocol = data.protocol;
        $scope.vip_protocol_port = data.protocol_port;
        $scope.vip_description = data.description;
    }
});

app.controller("member",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.getMember = function(){
        $http({
            method:"GET",
            url:project_url +  "/lb/members",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.member_table_pagination(data.members);
        });
    };

    $scope.member_table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderMemeber(data);
            $("#members_pagination").hide();
            return;
        }
        $("#members_pagination").show();
        //加入分页的绑定
        $("#members_pagination").pagination(data_length, {
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
            if(jq.length>0){
                $scope.$apply(function(){
                    $scope.renderMemeber(data.slice(start, end));
                });
            }
            else{
                $scope.renderMemeber(data.slice(start, end));
            }

        }
    }

    $scope.renderMemeber = function(data){
        _.each(data,function(element,index,list){
            element["member_style"] = member_style[element.status];
            element["member_status"] =  member_transfer[element.status];
        })
        if(data.length>0){
            $scope.hasMembers = true;
        }else{
            $scope.hasMembers = false;
            $scope.loading_member = "没有记录";
        }
        $scope.members = data;

    }

    $scope.clickMemberTableTr = function(e){
        var _list_name = "#members_list tr";
        if($(e.currentTarget).hasClass("table_body_tr_change")){
            $(e.currentTarget).removeClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(e.currentTarget).addClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", true);
            var this_id = $(e.currentTarget).attr("id");
        }

        if ($("#members_list tr input:checked").length) {
            $scope.enableMemberBtn(true);
        }
        else {
            $scope.enableMemberBtn(false);
        }
    }

    $scope.enableMemberBtn = function(bool){
        if(bool){
            $('#tool_edit_member,#tool_delete_member')
            .removeAttr('disabled')
            .removeClass("disabled_button");
        }
        else{
            $('#tool_edit_member,#tool_delete_member')
            .attr('disabled', "disabled")
            .addClass("disabled_button");
        }
    }

    EventBus.on("getMember",function(){
        $scope.getMember();
    });

    $scope.clickCreateMember = function(){
        EventBus.fire({
            type:"create_member_event",
            data:{}
        });
    }

    $scope.clickEditMember = function(){
        EventBus.fire({
            type:"edit_member_event",
            data:{}
        });
    }

    $scope.clickDeleteMember = function(){
        EventBus.fire({
            type:"delete_member_event",
            data:{}
        });
    }

    $scope.loading_member = "加载中...";
    $scope.getMember();
});

app.controller("monitor1",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("getMonitors",function(){
        $scope.getMonitor();
    });

    $scope.getMonitor = function(){
        $http({
            method:"GET",
            url:project_url +  "/lb/health_monitors",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.monitor_table_pagination(data.health_monitors)
        });
    }

    $scope.monitor_table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderMonitors(data);
            $("#monitors_pagination").hide();
            return;
        }
        $("#monitors_pagination").show();
        //加入分页的绑定
        $("#monitors_pagination").pagination(data_length, {
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
            if(jq.length>0){
                $scope.$apply(function(){
                    $scope.renderMonitors(data.slice(start, end));
                });
            }else{
                $scope.renderMonitors(data.slice(start, end));
            }
        }
    }

    $scope.renderMonitors = function(data){
        _.each(data,function(element,index,list){
            if(element.type=="PING"||element.type=="TCP"){
                element.detail = '-'
            }else{
                element.detail = element.http_method + " " + element.url_path + "=>" + element.expected_codes;
            }
        });
        if(data.length>0){
            $scope.has_monitors = true;
        }
        else{
            $scope.has_monitors = false;
            $scope.loading_monitor = "没有记录";
        }
        $scope.monitors = data;
    }

    $scope.clickMonitorsTableTr = function(e){
        var _list_name = "#monitors_list tr";
        if($(e.currentTarget).hasClass("table_body_tr_change")){
            $(e.currentTarget).removeClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(e.currentTarget).addClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", true);
            var this_id = $(e.currentTarget).attr("id");
        }
        if ($("#monitors_list tr input:checked").length) {
            $scope.enableHealthBtn(true);
        }
        else {
            $scope.enableHealthBtn(false);
        }
    }

    $scope.enableHealthBtn = function(bool){
        if(bool){
            $('#tool_edit_health,#tool_delete_health')
            .removeAttr('disabled')
            .removeClass("disabled_button");
        }
        else{
            $('#tool_edit_health,#tool_delete_health')
            .attr('disabled', "disabled")
            .addClass("disabled_button");
        }
    }


    $scope.clickCreateMonitor = function(){
        EventBus.fire({
            type:"create_monitor_event",
            data:{}
        });
    }

    $scope.clickEditMonitor = function(){
        EventBus.fire({
            type:"edit_monitor_event",
            data:{}
        });
    }

    $scope.clickDeleteMonitor = function(){
        EventBus.fire({
            type:"delete_monitor_event",
            data:{}
        });
    }

    $scope.loading_monitor = "加载中...";
    $scope.getMonitor();
});

app.controller("create_pool_modal",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("create_pool_event",function(e){
        $scope.clickCreatePool();
    })

    $scope.clickCreatePool = function(){
        $.ajax({
            type: "GET",
            url:project_url +  "/networks",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                    var target = $("#create_pool_subnet_id");
                    target.html("");
                    for(var i=0;i<data.length;i++)
                    {
                        var op = $("<option value='" + data[i].subnet_id + "'>" + data[i].cidr + " " + data[i].network_name + "</option>");
                        target.append(op);
                    }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
        clearFormObject("#form_create_pool");
        $('#modal_create_pool').modal('show');
    }

    $scope.clickSubmitCreatePool = function(){
        if(!submitValidation("form_create_pool")){
            return;
        }
        var data = getFormObject("#form_create_pool");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/pools",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                })
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_pool").modal('hide');
            }
        });
    }
});

app.controller("edit_pool",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("edit_pool_event",function(e){
        $scope.clickEditPool();
    })

    $scope.clickEditPool = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#form_edit_pool").attr("pool_id",tr.eq(0).attr("id"));
        $("#edit_pool_name").val(tr.eq(0).attr("pool_name"));
        $("#edit_pool_description").val(tr.eq(0).attr("description"));
        $("#edit_pool_lb_method").val(tr.eq(0).attr("lb_method"));
        $("#edit_pool_admin_state_up").val(tr.eq(0).attr("admin_state_up"));
        $('#modal_edit_pool').modal('show');
    }

    $scope.clickSubmitEditPool = function(){
        if(!submitValidation("form_edit_pool")){
            return;
        }
        var pool_id = $("#form_edit_pool").attr("pool_id");
        var data = getFormObject("#form_edit_pool");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/pools/" + pool_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_pool").modal('hide');
            }
        });
    }
});

app.controller("delete_pool",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("delete_pool_event",function(){
        $scope.clickDeletePool();
    });

    $scope.clickDeletePool = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#delete_pool_id").val(tr.eq(0).attr("id"));
        $("#delete_pool_modal").modal("show");
    }

    $scope.clickSubmitDeletePool = function(){
        var pool_id = $("#delete_pool_id").val();
        $.ajax({
            type:"DELETE",
            url:project_url + "/lb/pools/" + pool_id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_pool_modal").modal('hide');
                EventBus.fire({
                    type:"afterDeletePool",
                    data:{}
                });
            }
        });
    }
});

app.controller("create_member",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("create_member_event",function(){
        $scope.clickCreateMemeber();
    });

    $scope.clickCreateMemeber = function(){

        $.ajax({
            type: "GET",
            url: project_url + "/lb/pools",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(e){
                    var data = e.pools;
                    var target = $("#create_member_pool_id");
                    target.html("");
                    for(var i=0;i<data.length;i++)
                    {
                        var op = $("<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                        target.append(op);
                    }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
        clearFormObject("#form_create_member");
        $('#modal_create_member').modal('show');
    }

    $scope.clickSubmitCreateMember = function(){
        if(!submitValidation("form_create_member")){
            return;
        }
        var data = getFormObject("#form_create_member");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/members",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMember",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_member").modal('hide');
            }
        });
    }
});

app.controller("edit_member",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("edit_member_event",function(){
        $scope.clickEditMember();
    });

    $scope.clickEditMember = function(){
        var tr = $("#members_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#form_edit_member").attr("member_id",tr.eq(0).attr("id"));
        $("#edit_member_weight").val(tr.eq(0).attr("weight"));
        $scope.getEditMemberPool(tr.eq(0).attr('pool_id'));
        $('#modal_edit_member').modal('show');
    }

    $scope.getEditMemberPool = function(pool_id){
        $.ajax({
            type: "GET",
            url: project_url + "/lb/pools",
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                $("#edit_member_pool").html("");
                pools = data.pools;
                for(var i=0;i<pools.length;i++) {
                    if (pools[i].id == pool_id){
                        var op = "<option value='" + pools[i].id + "'" + "selected >" + pools[i].name + "</option>";
                    }else {
                        var op = "<option value='" + pools[i].id + "'>" + pools[i].name + "</option>";
                    }
                     $("#edit_member_pool").append(op);
                }
            },
            error: function (data) {
                SAlert.showError(data);
            }
        });
    }

    $scope.clickSubmitEditMember = function(){
        if(!submitValidation("form_edit_member")){
            return;
        }
        var member_id = $("#form_edit_member").attr("member_id");
        var data = getFormObject("#form_edit_member");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/members/" + member_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMember",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_member").modal('hide');
            }
        });
    }
});

app.controller("delete_member",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("delete_member_event",function(){
        $scope.clickDeleteMember();
    });

    $scope.clickDeleteMember = function(){
        var tr = $("#members_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#delete_member_id").val(tr.eq(0).attr("id"));
        $("#delete_member_modal").modal("show");
    }

    $scope.clickSubmitDeleteMember = function(){
        var _id = $("#delete_member_id").val();
        $.ajax({
            type:"DELETE",
            url:project_url + "/lb/members/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMember",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_member_modal").modal('hide');
                enableMemberBtn(false);
            }
        });
    }
});

app.controller("create_monitor",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("create_monitor_event",function(){
        $scope.clickCreateMonitor();
    })

    $scope.clickCreateMonitor = function(){
        clearFormObject("#form_create_monitor");
        $("#monitor_create_type").change();
        $('#modal_create_monitor').modal('show');
    }

    $scope.clickSubmitCreateMonitor = function(){
        if(!submitValidation("form_create_monitor")){
            console.log("not validate!")
            return;
        }
        var data = getFormObject("#form_create_monitor");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/health_monitors",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMonitors",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_monitor").modal('hide');
            }
        });
    }
});

app.controller("edit_monitor",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("edit_monitor_event",function(){
        $scope.clickEditMonitor();
    });

    $scope.clickEditMonitor = function(){
        var tr = $("#monitors_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#form_edit_monitor").attr("monitor_id",tr.eq(0).attr("id"));
        $("#edit_monitor_delay").val(tr.eq(0).attr("delay"));
        $("#edit_monitor_max_retries").val(tr.eq(0).attr("max_retries"));
        $("#edit_monitor_http_method").val(tr.eq(0).attr("http_method"));
        $("#edit_monitor_url_path").val(tr.eq(0).attr("url_path"));
        $("#edit_monitor_expected_codes").val(tr.eq(0).attr("expected_codes"));
        $("#edit_monitor_timeout").val(tr.eq(0).attr("timeout"));
        $("#edit_monitor_admin_state_up").val(tr.eq(0).attr("admin_state_up"));
        $('#modal_edit_monitor').modal('show');
    }

    $scope.clickSubmitEditMonitor = function(){
        if(!submitValidation("form_edit_monitor")){
            return;
        }
        var monitor_id = $("#form_edit_monitor").attr("monitor_id");
        var data = getFormObject("#form_edit_monitor");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/health_monitors/" + monitor_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMonitors",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_monitor").modal('hide');
            }
        });
    }
});

app.controller("delete_monitor",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("delete_monitor_event",function(){
       $scope.clickDeleteMonitor();
    });

    $scope.clickDeleteMonitor = function(){
        var tr = $("#monitors_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#delete_monitor_id").val(tr.eq(0).attr("id"));
        $("#delete_monitor_modal").modal("show");
    }

    $scope.clickSubmitDeleteMonitor = function(){
        var _id = $("#delete_monitor_id").val();
        $.ajax({
            type:"DELETE",
            url:project_url + "/lb/health_monitors/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getMonitors",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_monitor_modal").modal('hide');
                enableHealthBtn(false);
            }
        });
    }

});

app.controller("create_vip",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("create_vip_event",function(){
        $scope.clickCreateVip();
    });

    $scope.clickCreateVip = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
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
                    var target = $("#create_vip_subnet_id");
                    target.html("");
                    for(var i=0;i<data.length;i++)
                    {
                        var op = $("<option value='" + data[i].subnet_id + "'>" + data[i].cidr + " " + data[i].network_name + "</option>");
                        target.append(op);
                    }
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
        clearFormObject("#form_create_vip");
        $("#create_vip_session_persistence").change();
        $("#create_vip_pool_id").val(tr.eq(0).attr("id"));
        $('#modal_create_vip').modal('show');
    }

    $scope.clickSubmitCreateVip = function(){
        if(!submitValidation("form_create_vip")){
            return;
        }
        var data = getFormObject("#form_create_vip");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/vips",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_vip").modal('hide');
            }
        });
    }
});

app.controller("edit_vip",function($scope,$http,EventBus,SAlert,PermitStatus){

    EventBus.on("edit_vip_event",function(){
        $scope.clickEditVip();
    });

    $scope.clickEditVip = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        var vip_id = tr.eq(0).attr("vip_id");
        if(vip_id==null){
            SAlert.showMessage("此资源池没有vip");
        }
        else{
            $("#modal_edit_vip").attr("vip_id",vip_id);
            $.ajax({
                type: "GET",
                url: project_url + "/lb/pools",
                async: true,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function(data){
                        var target = $("#edit_vip_pool_id");
                        target.html("");
                        for(var i=0;i<data.pools.length;i++)
                        {
                            var op = $("<option value='" + data.pools[i].id + "'>" + data.pools[i].name + "</option>");
                            target.append(op);
                        }

                        //继续进行数据绑定
                        $.ajax({
                            type: "GET",
                            url: project_url + "/lb/vip/"+vip_id,
                            async: true,
                            headers:{
                                "RC-Token": $.cookie("token_id")
                            },
                            success: function(data){
                                if (data) {
                                    var vip_data = JSON.parse(data);
                                    $("#form_edit_vip [name='name']").val(vip_data.name);
                                    $("#form_edit_vip [name='description']").val(vip_data.description);
                                    $("#edit_vip_pool_id").val(vip_data.pool_id);
                                    $("#form_edit_vip [name='session_persistence']").val(vip_data.session_persistence.type);
                                    $("#form_edit_vip [name='connection_limit']").val(vip_data.connection_limit);
                                    $("#form_edit_vip [name='cookie_name']").val(vip_data.cookie_name);
                                    $("#form_edit_vip [name='admin_state_up']").val(vip_data.admin_state_up.toString());
                                }
                            },
                            error: function(e){
                                //console.log(e);
                                SAlert.showError(e)
                            }
                        });



                },
                error: function(e){
                    //console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#modal_edit_vip").modal("show");
        }
    }

    $scope.clickSubmitEditVip = function(){
        if(!submitValidation("form_edit_vip")){
            return;
        }
        var data = getFormObject("#form_edit_vip");
        var vip_id = $("#modal_edit_vip").attr("vip_id");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/vips/" + vip_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_vip").modal('hide');
            }
        });
    }
});

app.controller("delete_vip",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("delete_vip_event",function(){
        $scope.clickDeleteVip();
    });

    $scope.clickDeleteVip = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        if(tr.eq(0).attr("vip_id")==null){
            SAlert.showMessage("此资源池没有vip");
        }
        else{
            $("#delete_vip_id").val(tr.eq(0).attr("vip_id"));
            $("#modal_delete_vip").modal("show");
        }
    }

    $scope.clickSubmitDeleteVip = function(){
        var _id = $("#delete_vip_id").val();
        $.ajax({
            type:"DELETE",
            url:project_url + "/lb/vips/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_delete_vip").modal('hide');
            }
        });
    }
});

app.controller("link_control",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("link_monitor_event",function(){
        $scope.clickLinkMonitor();
    });

    $scope.clickLinkMonitor = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#form_link_monitor").attr("pool_id",tr.eq(0).attr("id"));
        var str_health_monitors = tr.eq(0).attr("health_monitors");
        var health_monitors = [];
        if(str_health_monitors!=""){
            health_monitors = tr.eq(0).attr("health_monitors").split(',');
        }

        //获取health_monitors列表，取差集
        $.ajax({
            type: "GET",
            url: project_url + "/lb/health_monitors",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                var all_monitors = (data.health_monitors);
                $("#link_monitor_id").html("");
                for(var j=0;j<all_monitors.length;j++){
                    var _match = false;
                    for(var i=0;i<health_monitors.length;i++){
                        if(all_monitors[j].id==health_monitors[i]){
                            _match = true;
                            break;
                        }
                    }
                    if(_match){
                        continue;
                    }
                    var monitor_detail = all_monitors[j];
                    var display_info = "";
                    if(monitor_detail.type=="PING"||monitor_detail.type=="TCP"){
                        display_info = monitor_detail.type + ": 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                    }
                    else{
                        display_info = monitor_detail.type + ": url:" + monitor_detail.url_path + " 方法:" + monitor_detail.http_method + " 指令:" + monitor_detail.expected_codes + " 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                    }
                    var op = "<option value='" + all_monitors[j].id + "'>" + display_info + "</option>";
                    $("#link_monitor_id").append(op);
                }
                clearFormObject("#form_link_monitor");
                $('#modal_link_control').modal('show');
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    $scope.clickSubmitLinkMonitor = function(){
        if(!submitValidation("form_link_monitor")){
            return;
        }
        var data = getFormObject("#form_link_monitor");
        var pool_id = $("#form_link_monitor").attr("pool_id");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/pools/" + pool_id + "/health_monitors",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_link_control").modal('hide');
            }
        });
    }
});

app.controller("unlink_control",function($scope,$http,EventBus,SAlert,PermitStatus){
    EventBus.on("unlink_monitor_event",function(){
        $scope.clickUnlinkMonitor();
    });

    $scope.clickUnlinkMonitor = function(){
        var tr = $("#pools_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $("#unlink_pool_id").val(tr.eq(0).attr("id"));
        var str_health_monitors = tr.eq(0).attr("health_monitors");
        var health_monitors = [];
        if(str_health_monitors!=""){
            health_monitors = JSON.parse(tr.eq(0).attr("health_monitors"));
        }
        else{
            SAlert.showMessage("该资源池还未关联监控");
            return;
        }
        //获取health_monitors列表，取交集
        $.ajax({
            type: "GET",
            url:project_url +  "/lb/health_monitors",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                var all_monitors = (data.health_monitors);
                $("#unlink_control_id").html("");
                for(var i=0;i<health_monitors.length;i++){
                    var monitor_detail;
                    for(var j=0;j<all_monitors.length;j++){
                        if(all_monitors[j].id==health_monitors[i]){
                            monitor_detail = all_monitors[j];
                            break;
                        }
                    }
                    var display_info = "";
                    if(monitor_detail.type=="PING"||monitor_detail.type=="TCP"){
                        display_info = monitor_detail.type + ": 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                    }
                    else{
                        display_info = monitor_detail.type + ": url:" + monitor_detail.url_path + " 方法:" + monitor_detail.http_method + " 指令:" + monitor_detail.expected_codes + " 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                    }
                    var op = "<option value='" + health_monitors[i] + "'>" + display_info + "</option>";
                    $("#unlink_control_id").append(op);
                }
                $('#modal_unlink_control').modal('show');
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    $scope.clickSubmitUnlinkMonitor = function(){
        var pool_id = $("#unlink_pool_id").val();
        var control_id = $("#unlink_control_id").val();
        var data = {"health_monitor_id": control_id};
        $.ajax({
            type:"DELETE",
            url:project_url + "/lb/pools/" + pool_id + "/health_monitors",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                EventBus.fire({
                    type:"getPools",
                    data:{}
                });
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_unlink_control").modal('hide');
            }
        });
    }
});

app.controller("floating_ip",function($scope,$http,EventBus,PermitStatus){

});
















$(function(){
    set_navigator();
    initFormEvent()
    //getPools();
    //getMemeber();
    //getMonitor();

    //clickPoolTableTr();
    //clickSubmitCreatePool();
    //clickSubmitEditPool();
    //enablePoolBtn(false);
    //enableFloatingIpBtn(false);
    //disableVipBtn();

    //clickMemeberTableTr();
    //clickSubmitCreateMember();
    //clickSubmitEditMember();
    enableMemberBtn(false);

    //clickMonitorsTableTr();
    //clickSubmitCreateMonitor();
    //clickSubmitEditMonitor();
    enableHealthBtn(false);

    //clickSubmitCreateVip();
    //clickSubmitEditVip();

    //clickSubmitLinkMonitor();
});



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

function set_navigator(){
    if ($("#network_resource").hasClass('active')) {
        var lis = $('#demo1').children("li");
        lis.each(function () {
            $(this).addClass('active');
            $(this).removeClass('dhbg');
        })
        $("#network_resource").removeClass('active');
        $("#network_resource").addClass('dhbg');
    }
    $(".navbar-words").html("网络资源 > 负载均衡");
}
















var member_transfer = {
    "ACTIVE":"可用",
    "INACTIVE":"不可用"
};

var member_style={
    "ACTIVE":"success",
    "INACTIVE":"danger"
};

function initFormEvent(){
    $("#monitor_create_type").change(function(){
        if($(this).val()=="PING"||$(this).val()=="TCP"){
            $(".http-extend").hide();
        }
        else{
            $(".http-extend").show();
        }
        $("#monitor_create_url").val("/");
        $("#monitor_create_codes").val("200")
    });
    $("#create_vip_session_persistence").change(function(){
        if($(this).val()=="APP_COOKIE"){
            $(".cookie-extend").show();
        }
        else{
            $(".cookie-extend").hide();
        }
    })

    $("#btn_close_detail").click(function(){clear_pool_datail_data();});
}
/*

function getPools(){
    $.ajax({
        type: "GET",
        url:project_url +  "/lb/pools",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
                pool_table_pagination(data.pools);
        },
        error: function(e){
            SAlert.showError(e);
        }
    });

    function pool_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            renderPools(data);
            $("#pools_pagination").hide();
            return;
        }
        $("#pools_pagination").show();
        //加入分页的绑定
        $("#pools_pagination").pagination(data_length, {
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
            renderPools(data.slice(start, end));
            //render_image_list(data.slice(start, end));
        }
    }

    function renderPools(pools){
        $("#pools_list").html("");
        for(var i=0;i<pools.length;i++){
            var tr = $("<tr></tr>");
            tr.attr("id",pools[i].id);
            tr.attr("pool_name",pools[i].name);
            tr.attr("description",pools[i].description);
            tr.attr("lb_method",pools[i].lb_method);
            tr.attr("admin_state_up",pools[i].admin_state_up);
            tr.attr("vip_id",pools[i].vip_id);
            tr.attr("health_monitors",pools[i].health_monitors);
            tr.attr("vip_floating_ip",pools[i].vip_floating_ip);
            var tr_body = '<td><input type="checkbox" /></td>'+
                '<td><a class="animate_name">' + pools[i].name + '</a></td>'+
                '<td>' + pools[i].description + '</td>'+
                '<td>' + pools[i].provider + '</td>'+
                '<td>' + pools[i].subnet_cidr + '<br/>' + pools[i].network_name + '</td>'+
                '<td>' + pools[i].protocol + '</td>'+
                '<td><span class="label label-' + pool_style[pools[i].status] + '">' + pool_transfer[pools[i].status] + '</span></td>'+
                '<td>' + pools[i].vip_fixed_ip + '<br/>' + pools[i].vip_floating_ip + '</td>';
            tr.append(tr_body);
            $("#pools_list").append(tr);
        }
    }
}



function clickPoolTableTr(){
    var _list_name = "#pools_list tr";
    var _list_title = "#pools_list .animate_name";

    $(document).on("click",_list_title,function(){
        var this_id = $(this).parent().parent().attr("id");
        $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
        }).animate({"right":"0px"});
    });
    $(document).on("click",_list_name,function(e){
        if(e.target.tagName!="TD"){
            //点击了a标签
            var this_id = $(this).attr("id");
            var vip_id = $(this).attr("vip_id");
            get_pool_detail_data(this_id);
            if(vip_id!=undefined && vip_id!=""){
                get_vip_detail_data(vip_id);
            }

        }
        else{
            clear_pool_datail_data();
        }

        if(e.target.tagName=="TD" && $(this).hasClass("table_body_tr_change")){
            $(this).removeClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(this).addClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", true);
        }

        if ($("#pools_list tr input:checked").length) {
            enablePoolBtn(true);
            if($("#pools_list tr input:checked").eq(0).parent().parent().attr("vip_id")!=undefined && $("#pools_list tr input:checked").eq(0).parent().parent().attr("vip_id")!=""){
                enableFloatingIpBtn(true);
                enableVipBtn(false);
            }else{
                enableFloatingIpBtn(false);
                enableVipBtn(true);
            }
        }
        else {
            enablePoolBtn(false);
            enableFloatingIpBtn(false);
            disableVipBtn();
        }
    });
}



function render_pool_detail_data(data){
    $(".pool_detail_content td[name='id']").text(data.id);
    $(".pool_detail_content td[name='name']").text(data.name);
    $(".pool_detail_content td[name='description']").text(data.description);
    $(".pool_detail_content td[name='vip_address']").text(data.vip_address);
    $(".pool_detail_content td[name='vip_name']").text(data.vip_name);
    $(".pool_detail_content td[name='subnet']").text(data.subnet.cidr);
    $(".pool_detail_content td[name='protocol']").text(data.protocol);
    $(".pool_detail_content td[name='lb_method']").text(data.lb_method);
    $(".pool_detail_content td[name='status']").text(data.status);
    $("#member_interface_tbody").html("");
    if(!data.members_addresses.length){
        $("#member_interface_tbody").html("<tr><td>无</td></tr>");
    }
    for(var i=0;i<data.members_addresses.length;i++){
        var $tr = $("<tr></tr>");
        $tr.attr("id",data.members_addresses[i].id);
        $tr.append("<td>" + data.members_addresses[i].member_address + "</td>");
        $("#member_interface_tbody").append($tr);
    }
    $("#health_interface_table").html("");
    if(!data.health_monitor_desc.length){
        $("#health_interface_table").html("<tr><td>无</td></tr>");
    }
    for(var i=0;i<data.health_monitor_desc.length;i++){
        var $tr = $("<tr></tr>");
        $tr.attr("id",data.health_monitor_desc[i].id);
        $tr.append("<td>" + data.health_monitor_desc[i].desc + "</td>");
        $("#health_interface_table").append($tr);
    }
}

function render_vip_detail_data(data){
    $(".pool_detail_content td[name='vip_status']").text(data.status);
    $(".pool_detail_content td[name='vip_protocol']").text(data.protocol);
    $(".pool_detail_content td[name='vip_protocol_port']").text(data.protocol_port);
    $(".pool_detail_content td[name='vip_description']").text(data.description);
}

function clear_pool_datail_data(){
    $(".operation_2").animate({"right":"-1000px"});
}



function get_pool_detail_data(pool_id){
    $.ajax({
        type: "GET",
        url: project_url + "/lb/pool/"+pool_id,
        async: true,
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
            if (data) {
                var pool_data = JSON.parse(data);
                render_pool_detail_data(pool_data);
            }
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e)
        }

    });
}

function get_vip_detail_data(vip_id){
    $.ajax({
        type: "GET",
        url: project_url + "/lb/vip/"+vip_id,
        async: true,
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
            if (data) {
                var vip_data = JSON.parse(data);
                render_vip_detail_data(vip_data);
            }
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e)
        }

    });
}



function clickCreatePool(){
    $.ajax({
        type: "GET",
        url:project_url +  "/networks",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
                var target = $("#create_pool_subnet_id");
                target.html("");
                for(var i=0;i<data.length;i++)
                {
                    var op = $("<option value='" + data[i].subnet_id + "'>" + data[i].cidr + " " + data[i].network_name + "</option>");
                    target.append(op);
                }
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
    clearFormObject("#form_create_pool");
    $('#modal_create_pool').modal('show');
}

function clickSubmitCreatePool(){
    $("#submit_create_pool").click(function(){
        if(!submitValidation("form_create_pool")){
            return;
        }
        var data = getFormObject("#form_create_pool");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/pools",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_pool").modal('hide');
            }
        });
    });
}

function clickEditPool(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#form_edit_pool").attr("pool_id",tr.eq(0).attr("id"));
    $("#edit_pool_name").val(tr.eq(0).attr("pool_name"));
    $("#edit_pool_description").val(tr.eq(0).attr("description"));
    $("#edit_pool_lb_method").val(tr.eq(0).attr("lb_method"));
    $("#edit_pool_admin_state_up").val(tr.eq(0).attr("admin_state_up"));
    $('#modal_edit_pool').modal('show');
}

function clickSubmitEditPool(){
    $("#submit_edit_pool").click(function(){
        if(!submitValidation("form_edit_pool")){
            return;
        }
        var pool_id = $("#form_edit_pool").attr("pool_id");
        var data = getFormObject("#form_edit_pool");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/pools/" + pool_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_pool").modal('hide');
            }
        });
    });
}

function clickDeletePool(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#delete_pool_id").val(tr.eq(0).attr("id"));
    $("#delete_pool_modal").modal("show");
}

function clickSubmitDeletePool(){
    var pool_id = $("#delete_pool_id").val();
    $.ajax({
            type:"DELETE",
            url:project_url + "/lb/pools/" + pool_id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_pool_modal").modal('hide');
                enablePoolBtn(false);
                enableFloatingIpBtn(false);
                disableVipBtn();
            }
        });
}

function getMemeber(){
    $.ajax({
        type: "GET",
        url:project_url +  "/lb/members",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
                member_table_pagination(data.members);
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
}

function member_table_pagination(data){
    var page_num=10;
    var data_length=data.length;
    if(!data_length || data_length<=page_num){
        renderMemeber(data);
        $("#members_pagination").hide();
        return;
    }
    $("#members_pagination").show();
    //加入分页的绑定
    $("#members_pagination").pagination(data_length, {
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
        renderMemeber(data.slice(start, end));
        //render_image_list(data.slice(start, end));
    }
}

function renderMemeber(data){
    $("#members_list").html("");
    for(var i=0;i<data.length;i++){
        var tr = $("<tr></tr>");
        tr.attr("id",data[i].id);
        tr.attr("pool_id",data[i].pool_id);
        tr.attr("weight",data[i].weight);
        var tr_body = '<td><input type="checkbox" /></td>'+
            '<td>' + data[i].address + '</td>'+
            '<td>' + data[i].protocol_port + '</td>'+
            '<td>' + data[i].weight + '</td>'+
            '<td>' + data[i].pool_name + '</td>'+
            '<td><span class="label label-'+ member_style[data[i].status] + '">' + member_transfer[data[i].status] + '</span></td>';
        tr.append(tr_body);
        $("#members_list").append(tr);
    }
}

function clickMemeberTableTr(){
    var _list_name = "#members_list tr";
    $(document).on("click",_list_name,function(){
        if($(this).hasClass("table_body_tr_change")){
            $(this).removeClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(this).addClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", true);
            var this_id = $(this).attr("id");
        }

        if ($("#members_list tr input:checked").length) {
            enableMemberBtn(true);
        }
        else {
            enableMemberBtn(false);
        }
    });
}


function clickCreateMemeber(){
    $.ajax({
        type: "GET",
        url: project_url + "/lb/pools",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(e){
                var data = e.pools;
                var target = $("#create_member_pool_id");
                target.html("");
                for(var i=0;i<data.length;i++)
                {
                    var op = $("<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                    target.append(op);
                }
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
    clearFormObject("#form_create_member");
    $('#modal_create_member').modal('show');
}

function clickSubmitCreateMember(){
    $("#submit_create_member").click(function(){
        if(!submitValidation("form_create_member")){
            return;
        }
        var data = getFormObject("#form_create_member");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/members",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMemeber();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_member").modal('hide');
            }
        });
    });
}

function clickEditMember(){
    var tr = $("#members_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#form_edit_member").attr("member_id",tr.eq(0).attr("id"));
    $("#edit_member_weight").val(tr.eq(0).attr("weight"));
    getEditMemberPool(tr.eq(0).attr('pool_id'));
    $('#modal_edit_member').modal('show');
}

function getEditMemberPool(pool_id) {
    $.ajax({
        type: "GET",
        url: project_url + "/lb/pools",
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
            $("#edit_member_pool").html("");
            pools = data.pools;
            for(var i=0;i<pools.length;i++) {
                if (pools[i].id == pool_id){
                    var op = "<option value='" + pools[i].id + "'" + "selected >" + pools[i].name + "</option>";
                }else {
                    var op = "<option value='" + pools[i].id + "'>" + pools[i].name + "</option>";
                }
                 $("#edit_member_pool").append(op);
            }
        },
        error: function (data) {
            SAlert.showError(data);
        }
    });
}

function clickSubmitEditMember(){
    $("#submit_edit_member").click(function(){
        if(!submitValidation("form_edit_member")){
            return;
        }
        var member_id = $("#form_edit_member").attr("member_id");
        var data = getFormObject("#form_edit_member");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/members/" + member_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMemeber();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_member").modal('hide');
            }
        });
    });
}

function clickDeleteMember(){
    var tr = $("#members_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#delete_member_id").val(tr.eq(0).attr("id"));
    $("#delete_member_modal").modal("show");
}

function clickSubmitDeleteMember(){
    var _id = $("#delete_member_id").val();
    $.ajax({
            type:"DELETE",
            url:project_url + "/lb/members/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMemeber();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_member_modal").modal('hide');
                enableMemberBtn(false);
            }
        });
}

function getMonitor(){
    $.ajax({
        type: "GET",
        url:project_url +  "/lb/health_monitors",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
                monitor_table_pagination(data.health_monitors);
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });

    function monitor_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            renderMonitors(data);
            $("#monitors_pagination").hide();
            return;
        }
        $("#monitors_pagination").show();
        //加入分页的绑定
        $("#monitors_pagination").pagination(data_length, {
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
            renderMonitors(data.slice(start, end));
            //render_image_list(data.slice(start, end));
        }
    }

    function renderMonitors(data){
        $("#monitors_list").html("");
        for(var i=0;i<data.length;i++){
            var tr = $("<tr></tr>");
            tr.attr("id",data[i].id);
            tr.attr("delay",data[i].delay);
            tr.attr("timeout",data[i].timeout);
            tr.attr("max_retries",data[i].max_retries);
            tr.attr("http_method",data[i].http_method);
            tr.attr("url_path",data[i].url_path);
            tr.attr("expected_codes",data[i].expected_codes);
            tr.attr("admin_state_up",data[i].admin_state_up);
            var detail = "";
            if(data[i].type=="PING"||data[i].type=="TCP"){
                detail = '-'
            }else{
                detail = data[i].http_method + " " + data[i].url_path + "=>" + data[i].expected_codes;
            }

            var tr_body = '<td><input type="checkbox" /></td>'+
                '<td>' + data[i].type + '</td>'+
                '<td>' + data[i].delay + '</td>'+
                '<td>' + data[i].timeout + '</td>'+
                '<td>' + data[i].max_retries + '</td>'+
                '<td>' + detail + '</td>';
            tr.append(tr_body);
            $("#monitors_list").append(tr);
        }
    }
}

function clickMonitorsTableTr(){
    var _list_name = "#monitors_list tr";
    $(document).on("click",_list_name,function(){
        if($(this).hasClass("table_body_tr_change")){
            $(this).removeClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(this).addClass("table_body_tr_change");
            $(this).children("td").eq(0).find("input").prop("checked", true);
            var this_id = $(this).attr("id");
        }
        if ($("#monitors_list tr input:checked").length) {
            enableHealthBtn(true);
        }
        else {
            enableHealthBtn(false);
        }
    });
}


function clickCreateMonitor(){
    clearFormObject("#form_create_monitor");

    $("#monitor_create_type").change();
    $('#modal_create_monitor').modal('show');
}

function clickSubmitCreateMonitor(){
    $("#submit_create_monitor").click(function(){
        if(!submitValidation("form_create_monitor")){
            console.log("not validate!")
            return;
        }
        var data = getFormObject("#form_create_monitor");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/health_monitors",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMonitor();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_monitor").modal('hide');
            }
        });
    });
}

function clickEditMonitor(){
    var tr = $("#monitors_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#form_edit_monitor").attr("monitor_id",tr.eq(0).attr("id"));
    $("#edit_monitor_delay").val(tr.eq(0).attr("delay"));
    $("#edit_monitor_max_retries").val(tr.eq(0).attr("max_retries"));
    $("#edit_monitor_http_method").val(tr.eq(0).attr("http_method"));
    $("#edit_monitor_url_path").val(tr.eq(0).attr("url_path"));
    $("#edit_monitor_expected_codes").val(tr.eq(0).attr("expected_codes"));
    $("#edit_monitor_timeout").val(tr.eq(0).attr("timeout"));
    $("#edit_monitor_admin_state_up").val(tr.eq(0).attr("admin_state_up"));
    $('#modal_edit_monitor').modal('show');
}


function clickSubmitEditMonitor(){
    $("#submit_edit_monitor").click(function(){
        if(!submitValidation("form_edit_monitor")){
            return;
        }
        var monitor_id = $("#form_edit_monitor").attr("monitor_id");
        var data = getFormObject("#form_edit_monitor");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/health_monitors/" + monitor_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMonitor();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_monitor").modal('hide');
            }
        });
    });
}

function clickDeleteMonitor(){
    var tr = $("#monitors_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#delete_monitor_id").val(tr.eq(0).attr("id"));
    $("#delete_monitor_modal").modal("show");
}

function clickSubmitDeleteMonitor(){
    var _id = $("#delete_monitor_id").val();
    $.ajax({
            type:"DELETE",
            url:project_url + "/lb/health_monitors/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getMonitor();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#delete_monitor_modal").modal('hide');
                enableHealthBtn(false);
            }
        });
}

function clickCreateVip(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
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
                var target = $("#create_vip_subnet_id");
                target.html("");
                for(var i=0;i<data.length;i++)
                {
                    var op = $("<option value='" + data[i].subnet_id + "'>" + data[i].cidr + " " + data[i].network_name + "</option>");
                    target.append(op);
                }
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
    clearFormObject("#form_create_vip");
    $("#create_vip_session_persistence").change();
    $("#create_vip_pool_id").val(tr.eq(0).attr("id"));
    $('#modal_create_vip').modal('show');
}

function clickSubmitCreateVip(){
    $("#submit_create_vip").click(function(){
        if(!submitValidation("form_create_vip")){
            return;
        }
        var data = getFormObject("#form_create_vip");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/vips",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_create_vip").modal('hide');
            }
        });
    });
}

function clickEditVip(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    var vip_id = tr.eq(0).attr("vip_id");
    if(vip_id==null){
        SAlert.showMessage("此资源池没有vip");
    }
    else{
        $("#modal_edit_vip").attr("vip_id",vip_id);
        $.ajax({
            type: "GET",
            url: project_url + "/lb/pools",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                    var target = $("#edit_vip_pool_id");
                    target.html("");
                    for(var i=0;i<data.pools.length;i++)
                    {
                        var op = $("<option value='" + data.pools[i].id + "'>" + data.pools[i].name + "</option>");
                        target.append(op);
                    }

                    //继续进行数据绑定
                    $.ajax({
                        type: "GET",
                        url: project_url + "/lb/vip/"+vip_id,
                        async: true,
                        headers:{
                            "RC-Token": $.cookie("token_id")
                        },
                        success: function(data){
                            if (data) {
                                var vip_data = JSON.parse(data);
                                $("#form_edit_vip [name='name']").val(vip_data.name);
                                $("#form_edit_vip [name='description']").val(vip_data.description);
                                $("#edit_vip_pool_id").val(vip_data.pool_id);
                                $("#form_edit_vip [name='session_persistence']").val(vip_data.session_persistence.type);
                                $("#form_edit_vip [name='connection_limit']").val(vip_data.connection_limit);
                                $("#form_edit_vip [name='cookie_name']").val(vip_data.cookie_name);
                                $("#form_edit_vip [name='admin_state_up']").val(vip_data.admin_state_up.toString());
                            }
                        },
                        error: function(e){
                            //console.log(e);
                            SAlert.showError(e)
                        }
                    });



            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });

        $("#modal_edit_vip").modal("show");
    }
}

function clickSubmitEditVip(){
    $("#submit_edit_vip").click(function(){
        if(!submitValidation("form_edit_vip")){
            return;
        }
        var data = getFormObject("#form_edit_vip");
        var vip_id = $("#modal_edit_vip").attr("vip_id");
        $.ajax({
            type:"PUT",
            url:project_url + "/lb/vips/" + vip_id,
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_edit_vip").modal('hide');
            }
        });
    });
}

function clickDeleteVip(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    if(tr.eq(0).attr("vip_id")==null){
        SAlert.showMessage("此资源池没有vip");
    }
    else{
        $("#delete_vip_id").val(tr.eq(0).attr("vip_id"));
        $("#modal_delete_vip").modal("show");
    }
}

function clickSubmitDeleteVip(){
    var _id = $("#delete_vip_id").val();
    $.ajax({
            type:"DELETE",
            url:project_url + "/lb/vips/" + _id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_delete_vip").modal('hide');
            }
        });
}

function clickLinkMonitor(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#form_link_monitor").attr("pool_id",tr.eq(0).attr("id"));
    var str_health_monitors = tr.eq(0).attr("health_monitors");
    var health_monitors = [];
    if(str_health_monitors!=""){
        health_monitors = tr.eq(0).attr("health_monitors").split(',');
    }

    //获取health_monitors列表，取差集
    $.ajax({
        type: "GET",
        url: project_url + "/lb/health_monitors",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
            var all_monitors = (data.health_monitors);
            $("#link_monitor_id").html("");
            for(var j=0;j<all_monitors.length;j++){
                var _match = false;
                for(var i=0;i<health_monitors.length;i++){
                    if(all_monitors[j].id==health_monitors[i]){
                        _match = true;
                        break;
                    }
                }
                if(_match){
                    continue;
                }
                var monitor_detail = all_monitors[j];
                var display_info = "";
                if(monitor_detail.type=="PING"||monitor_detail.type=="TCP"){
                    display_info = monitor_detail.type + ": 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                }
                else{
                    display_info = monitor_detail.type + ": url:" + monitor_detail.url_path + " 方法:" + monitor_detail.http_method + " 指令:" + monitor_detail.expected_codes + " 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                }
                var op = "<option value='" + all_monitors[j].id + "'>" + display_info + "</option>";
                $("#link_monitor_id").append(op);
            }
            clearFormObject("#form_link_monitor");
            $('#modal_link_control').modal('show');
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
}

function clickSubmitLinkMonitor(){
    $("#submit_link_monitor").click(function(){
        if(!submitValidation("form_link_monitor")){
            return;
        }
        var data = getFormObject("#form_link_monitor");
        var pool_id = $("#form_link_monitor").attr("pool_id");
        $.ajax({
            type:"POST",
            url:project_url + "/lb/pools/" + pool_id + "/health_monitors",
            data: JSON.stringify(data),
            //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                getPools();
            },
            error:function(e){
                SAlert.showError(e);
            },
            complete:function(e){
                $("#modal_link_control").modal('hide');
            }
        });
    });
}

function clickUnlinkMonitor(){
    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#unlink_pool_id").val(tr.eq(0).attr("id"));
    var str_health_monitors = tr.eq(0).attr("health_monitors");
    var health_monitors = [];
    if(str_health_monitors!=""){
        health_monitors = tr.eq(0).attr("health_monitors").split(',');
    }
    else{
        SAlert.showMessage("该资源池还未关联监控");
        return;
    }
    //获取health_monitors列表，取交集
    $.ajax({
        type: "GET",
        url:project_url +  "/lb/health_monitors",
        async: true,
        dataType: "json",
        headers:{
            "RC-Token": $.cookie("token_id")
        },
        success: function(data){
            var all_monitors = (data.health_monitors);
            $("#unlink_control_id").html("");
            for(var i=0;i<health_monitors.length;i++){
                var monitor_detail;
                for(var j=0;j<all_monitors.length;j++){
                    if(all_monitors[j].id==health_monitors[i]){
                        monitor_detail = all_monitors[j];
                        break;
                    }
                }
                var display_info = "";
                if(monitor_detail.type=="PING"||monitor_detail.type=="TCP"){
                    display_info = monitor_detail.type + ": 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                }
                else{
                    display_info = monitor_detail.type + ": url:" + monitor_detail.url_path + " 方法:" + monitor_detail.http_method + " 指令:" + monitor_detail.expected_codes + " 延时:" + monitor_detail.delay + " 重试:" + monitor_detail.max_retries + " 超时:" + monitor_detail.timeout;
                }
                var op = "<option value='" + health_monitors[i] + "'>" + display_info + "</option>";
                $("#unlink_control_id").append(op);
            }
            $('#modal_unlink_control').modal('show');
        },
        error: function(e){
            //console.log(e);
            SAlert.showError(e);
        }
    });
}

function clickSubmitUnlinkMonitor(){
    var pool_id = $("#unlink_pool_id").val();
    var control_id = $("#unlink_control_id").val();
    var data = {"health_monitor_id": control_id};
    $.ajax({
        type:"DELETE",
        url:project_url + "/lb/pools/" + pool_id + "/health_monitors",
        data: JSON.stringify(data),
        //dataType: "json",
        headers: {
            'Content-Type': 'application/json',
            "RC-Token": $.cookie("token_id")
        },
        success:function(msg){
            getPools();
        },
        error:function(e){
            SAlert.showError(e);
        },
        complete:function(e){
            $("#modal_unlink_control").modal('hide');
        }
    });
}

*/

function enableMemberBtn(bool){
    if(bool){
        $('#tool_edit_member,#tool_delete_member')
        .removeAttr('disabled')
        .removeClass("disabled_button");
    }
    else{
        $('#tool_edit_member,#tool_delete_member')
        .attr('disabled', "disabled")
        .addClass("disabled_button");
    }
}



function enableHealthBtn(bool){
    if(bool){
        $('#tool_edit_health,#tool_delete_health')
        .removeAttr('disabled')
        .removeClass("disabled_button");
    }
    else{
        $('#tool_edit_health,#tool_delete_health')
        .attr('disabled', "disabled")
        .addClass("disabled_button");
    }
}



/*
 Floating IP relevant function
*/
$(function () {
    register_get_floatingip()
});

function register_get_floatingip() {
    $("#tool_floating_ip").unbind("click").bind("click", function () {
        start_floatingip_flow()
    })

}

function start_floatingip_flow() {
    init_form_data();
    choose_type();
    choose_interface();
    get_vip_interface();
    bind_floating();
}

function init_form_data() {
    $("#ip_list_container").hide().attr("disabled", "disabled");
    $("#external_network_container").hide().attr("disabled", "disabled");
    $("#bind_type").val("directly_bind");
    //$("#floatingip_warnning").html("");
    render_danger_info("");
    $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span>绑定").removeAttr("disabled");

    var tr = $("#pools_list").find(".table_body_tr_change");
    if(tr.length<1){
        return;
    }
    $("#floating_ip_form").attr("vip_id", tr.eq(0).attr("vip_id"));

}

function choose_type() {
    $("#bind_type").unbind("change").bind("change", function () {
        if ($(this).val() == "directly_bind") {
            $("#external_network_container").hide().attr("disabled", "disabled");
            $("#ip_list_container").show().removeAttr("disabled");
            $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span>绑定");
            if ($("#server_interface_list").val() != "") {
                get_floatingips()
            } else {
                $("#ip_list_container").hide().attr("disabled", "disabled");
            }
        } else {
            $("#external_network_container").show().removeAttr("disabled");
            $("#ip_list_container").hide().attr("disabled", "disabled");
            $("#bind_floatingip_submit").html("<span class='glyphicon glyphicon-ok'></span>创建并绑定");
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


function get_floatingips(SAlert) {
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

            var tr = $("#pools_list").find(".table_body_tr_change");
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
                    SAlert.showError(e,SAlert)
                }
            });
        } else {
            $("#external_network_container").show().removeAttr("disabled");
        }
    }
}

function get_ext_network_id() {
    var port_id = $("#server_interface_list").val();
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
            SAlert.showError(e,SAlert)
        }
    });
    console.debug("Fail reason:", data);
    if (data.fail_reason != null) {
        SAlert.showError(data.fail_reason)
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

function get_vip_interface() {

    var $pools_td = $("#image_table tbody tr input:checked");
    var vip_id = $pools_td.closest('tr').attr('vip_id');

    var params = {
        "name": 'vip-'+vip_id
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
            SAlert.showError(e)
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
        var $tip = $("<span>该VIP没有绑定外部IP</span>");
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
        if (port_data[i]['floating_network_id'] != undefined && port_data[i]['floating_network_id']!="") {
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
                SAlert.showError(e)
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
                SAlert.showError(e)
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
        render_danger_info("VIP没有有需要绑定的网卡");
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
            'port_id': _params.server_interface,
            'vip_id': $("#floating_ip_form").attr('vip_id')
        };

        $("#bind_floatingip_submit").attr("disabled", "disabled");
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
                SAlert.showError(e);
            },
            complete: function () {
                $("#bind_floatingip_submit").removeAttr("disabled");
                $("#floating_ip_modal").modal('hide');
                //getPools();
                $("#flag_pools_change").val(new Date().toLocaleTimeString());
                $("#flag_pools_change").change();
            }
        })
    } else {
        var tr = $("#pools_list").find(".table_body_tr_change");
        var tenant_id = tr.eq(0).attr("tenant_id");
        var params = {
            "port_id": _params.server_interface,
            "floating_network_id": _params.external_network,
            'tenant_id':tenant_id
            // 'vip_id': $("#floating_ip_form").attr('vip_id')
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
                SAlert.showError(e);
            },
            complete: function () {
                $("#bind_floatingip_submit").removeAttr("disabled");
                $("#floating_ip_modal").modal('hide');
            }
        })
    }
}

function register_delete_floatingip() {
    $("#already_bind_container [btn-type=delete_floatingip]").unbind("click").bind("click", function () {
        var floatingip_id = $(this).attr("floatingip_id");
        delete_floatingip(floatingip_id);
    })
}

function delete_floatingip(floatingip_id) {

    var params = {
        "port_id": null,
        'vip_id': $("#floating_ip_form").attr('vip_id')
    };

    $.ajax({
        type: "PUT",
        url: project_url + '/floatingip/' + floatingip_id,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        data: JSON.stringify(params),
        success: function () {
            start_floatingip_flow();
            //getPools();
            $("#flag_pools_change").val(new Date().toLocaleTimeString());
            $("#flag_pools_change").change();

        },
        error: function (e) {
            SAlert.showError(e)
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
