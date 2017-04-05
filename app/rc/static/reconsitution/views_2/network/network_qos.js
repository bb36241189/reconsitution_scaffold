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

undefined){
    $scope.getlist= function(){
        $http({
            method:"GET",
            url:project_url + "/qos/policies",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.table_pagination(data.policies);
        }).error(function(data){
            SAlert.showError(data);
        });
    }

    $scope.table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderList(data);
            $("#network_qos_pagination").hide();
            return;
        }
        $("#network_qos_pagination").show();
        //加入分页的绑定
        $("#network_qos_pagination").pagination(data_length, {
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
                    $scope.renderList(data.slice(start, end));
                });
            }
            else{
                $scope.renderList(data.slice(start, end));
            }
        }
    }

    $scope.renderList = function(data){
        if(data.length==0){
            $scope.loading_rows = "没有记录";
            $scope.bool_rows = false;
        }
        else{
            $scope.policies = data;
            $scope.bool_rows = true;
        }
    }

    $scope.clickTableTr = function(e){
        var _list_name = "#network_qos_tbody tr";
        if($(e.currentTarget).hasClass("table_body_tr_change")){
            $(e.currentTarget).removeClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", false);
            $scope.enableBtn(false);
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(e.currentTarget).addClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", true);
            $scope.enableBtn(true);
        }
    }

    $scope.enableBtn = function(bool){
        if(bool){
            $scope.danger_status = "danger_button";
            $scope.general_status = "general_button";
        }
        else{
            $scope.danger_status = "disabled_button";
            $scope.general_status = "disabled_button";
        }
    }

    $scope.clickcCreateItem = function(){
        EventBus.fire({
            type:"create_network_qos",
            data:{}
        });
    }

    $scope.clickcEditItem = function(){
        EventBus.fire({
            type:"edit_network_qos",
            data:{}
        });
    }

    $scope.clickDeleteItem = function(){
        EventBus.fire({
            type:"delete_network_qos",
            data:{}
        });
        console.log(11)
    }

    EventBus.on("get_network_qos",function(){
        $scope.getlist();
    });

    $scope.danger_status = "disabled_button";
    $scope.general_status = "disabled_button";
    $scope.loading_volumeTypes = "正在加载";
    $scope.getlist();

});

undefined){
    $scope.showModal = function(){
        $("#modal_create_network_qos").modal("show");
    }

    EventBus.on("create_network_qos",function(){
        $scope.name="";
        $scope.shared="true";
        $scope.max_kbps="";
        $scope.max_burst_kbps="";
        $scope.description = "";
        $scope.showModal();
    });

    $scope.submitCreate = function(){
        if(!submitValidation("form_create_network_qos")){
            return;
        }

        //var data = getFormObject("#form_create_network_qos");
        var data = {};
        data.name = $scope.name;
        data.shared = $scope.shared;
        if($scope.max_kbps!=""){
            data.max_kbps = $scope.max_kbps*1000;
            data.max_burst_kbps = data.max_kbps*0.8;
        }
        // if($scope.max_burst_kbps!=""){
        //     data.max_burst_kbps = $scope.max_burst_kbps;
        // }
        data.description = $scope.description;
        $http({
            method:"POST",
            url:project_url + "/qos/policies",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            EventBus.fire({
                type:"get_network_qos",
                data:{}
            });
            $("#modal_create_network_qos").modal("hide");
        }).error(function(){
            $("#modal_create_network_qos").modal("hide");
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.showModal = function(){
        $("#modal_edit_network_qos").modal("show");
    }

    EventBus.on("edit_network_qos",function(){
        var tr = $("#network_qos_tbody").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.id = tr.eq(0).attr("policy_id");
        $scope.name=tr.eq(0).attr("name");
        $scope.shared=tr.eq(0).attr("shared");
        $scope.max_kbps=tr.eq(0).attr("max_kbps")==""?"":parseInt(tr.eq(0).attr("max_kbps"))/1000;
        // $scope.max_burst_kbps=tr.eq(0).attr("max_burst_kbps")==""?"":parseInt(tr.eq(0).attr("max_burst_kbps"));
        $scope.description = tr.eq(0).attr("description");
        $scope.showModal();
    });

    $scope.submitEdit = function(){
        if(!submitValidation("form_edit_network_qos")){
            return;
        }

        //var data = getFormObject("#form_create_network_qos");
        var data = {};
        data.name = $scope.name;
        data.shared = $scope.shared;
        if($scope.max_kbps!=""){
            data.max_kbps = $scope.max_kbps*1000;
            data.max_burst_kbps  = data.max_kbps*0.8;
        }
        // if($scope.max_burst_kbps!=""){
        //     data.max_burst_kbps = $scope.max_burst_kbps;
        // }
        data.description = $scope.description;
        $http({
            method:"PUT",
            url:project_url + "/qos/policies/" + $scope.id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            EventBus.fire({
                type:"get_network_qos",
                data:{}
            });
            $("#modal_edit_network_qos").modal("hide");
        }).error(function(){
            $("#modal_edit_network_qos").modal("hide");
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.clickDelete = function(){
        var tr = $("#network_qos_tbody").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.id = tr.eq(0).attr("policy_id");
        $("#delete_network_qos_modal").modal("show");
    }

    EventBus.on("delete_network_qos",function(){
        $scope.clickDelete();
        console.log(22)
    })

    $scope.clickSubmitDelete = function(){
        $http({
            method:"DELETE",
            url:project_url + "/qos/policies/" + $scope.id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(){
            $("#delete_network_qos_modal").modal("hide");
            EventBus.fire({
                type:"get_network_qos",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
            $("#delete_network_qos_modal").modal("hide");
        });
    }
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