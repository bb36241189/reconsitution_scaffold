/**
 * Created by maple on 2016/7/18.
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
    $scope.getVolumeType= function(){
        $http({
            method:"GET",
            url:project_url + "/types",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.volumeTypes_table_pagination(data);
        }).error(function(data){
            SAlert.showError(data);
        });
    }

    $scope.volumeTypes_table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderVolumeTypes(data);
            $("#volumeTypes_pagination").hide();
            return;
        }
        $("#volumeTypes_pagination").show();
        //加入分页的绑定
        $("#volumeTypes_pagination").pagination(data_length, {
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
                    $scope.renderVolumeTypes(data.slice(start, end));
                });
            }
            else{
                $scope.renderVolumeTypes(data.slice(start, end));
            }
        }
    }

    $scope.renderVolumeTypes = function(data){
        if(data.length==0){
            $scope.loading_volumeTypes = "没有记录";
            $scope.bool_volumeTypes = false;
        }
        else{
            $scope.volumeTypes = data;
            $scope.bool_volumeTypes = true;
        }
    }

    $scope.clickTableTr = function(e){
        var _list_name = "#volumeTypes_list tr";
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

    $scope.createVolumeType = function(){
        EventBus.fire({
            type:"create_volume_type",
            data:{}
        });
    }


    $scope.clickDeleteVolumeType = function(){
        EventBus.fire({
            type:"delete_volume_type",
            data:{}
        });
    }

    $scope.clickLinkQos = function(){
        EventBus.fire({
            type:"link_qos",
            data:{}
        })
    }

    EventBus.on("getVolumeTypes",function(){
        $scope.getVolumeType();
    });

    $scope.danger_status = "disabled_button";
    $scope.general_status = "disabled_button";
    $scope.loading_volumeTypes = "正在加载";
    $scope.getVolumeType();

});


undefined){
    $scope.showModal = function(){
        $("#modal_create_volumeType").modal("show");
    };

    EventBus.on("create_volume_type",function(){
        $scope.showModal();
    });

    $scope.submitCreateVolumeType = function(){
        if(!submitValidation("form_create_volumeType")){
            return;
        }
        var data = getFormObject("#form_create_volumeType");
        data.extra_specs={};
        $http({
            method:"POST",
            url:project_url + "/types",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            EventBus.fire({
                type:"getVolumeTypes",
                data:{}
            });
            $("#modal_create_volumeType").modal("hide");
        }).error(function(){
            $("#modal_create_volumeType").modal("hide");
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.clickDelete = function(){
        var tr = $("#volumeTypes_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.delete_type_id = tr.eq(0).attr("type_id");
        $("#delete_volumeType_modal").modal("show");
    }

    EventBus.on("delete_volume_type",function(){
        $scope.clickDelete();
    })

    $scope.clickSubmitDelete = function(){
        $http({
            method:"DELETE",
            url:project_url + "/type/" + $scope.delete_type_id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(){
            $("#delete_volumeType_modal").modal("hide");
            EventBus.fire({
                type:"getVolumeTypes",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
            $("#delete_volumeType_modal").modal("hide");
        });
    }
});


undefined){
    $scope.getlist= function(){
        $http({
            method:"GET",
            url:project_url + "/qos_specs",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.table_pagination(data);
        }).error(function(data){
            SAlert.showError(data);
        });
    }



    $scope.table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderlist(data);
            $("#qosSpec_pagination").hide();
            return;
        }
        $("#qosSpec_pagination").show();
        //加入分页的绑定
        $("#qosSpec_pagination").pagination(data_length, {
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
                    $scope.renderlist(data.slice(start, end));
                });
            }
            else{
                $scope.renderlist(data.slice(start, end));
            }
        }
    }

    $scope.renderlist = function(data){
        for(var i=0;i<data.length;i++){
            var detail = "";
            for(var attr in data[i].specs){
                if (attr == 'total_bytes_sec'){
                     detail += '总吞吐' + "=" + data[i].specs[attr]/1024/1024 +  "(MB/s) ";
                }else if(attr == 'read_bytes_sec'){
                     detail += '读吞吐' + "=" + data[i].specs[attr]/1024/1024 +  "(MB/s) ";
                }else if(attr == 'write_bytes_sec'){
                     detail += '写吞吐' + "=" + data[i].specs[attr]/1024/1024 +  "(MB/s) ";
                }else if(attr == 'total_iops_sec'){
                     detail += '总IOPS' + "=" + data[i].specs[attr] +  " ";
                }else if(attr == 'read_iops_sec'){
                     detail += '读IOPS' + "=" + data[i].specs[attr] +  " ";
                }else if(attr == 'write_iops_sec'){
                     detail += '写IOPS' + "=" + data[i].specs[attr] +  " ";
                }
            }
            data[i].detail = detail;
            //data[i].detail = JSON.stringify(data[i].specs);
        }

        if(data.length==0){
            $scope.loading_rows = "没有记录";
            $scope.bool_hasrow = false;
        }
        else{
            $scope.list = data;
            $scope.bool_hasrow = true;
        }
    }

    $scope.clickTableTr = function(e){
        var _list_name = "#qosSpec_list tr";
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
            $scope.danger_status = "danger_button"
        }
        else{
            $scope.danger_status = "disabled_button";
        }
    }

    $scope.clickCreateItem = function(){
        EventBus.fire({
            type:"create_qosSpec",
            data:{}
        });
    }

    $scope.clickDeleteItem = function(){
        EventBus.fire({
            type:"delete_qos",
            data:{}
        });
    }

    EventBus.on("getQosSpec",function(){
        $scope.getlist();
    });

    $scope.danger_status = "disabled_button";
    $scope.loading_rows = "正在加载";
    $scope.getlist();

});

undefined){
    $scope.showModal = function(){
        $scope.set_total_bytes=false;
        $scope.set_read_bytes=false;
        $scope.set_write_bytes=false;
        $scope.set_total_iops=false;
        $scope.set_read_iops=false;
        $scope.set_write_iops=false;
        $scope.bytes_1=false;
        $scope.bytes_2=false;
        $scope.iops_1=false;
        $scope.iops_2=false;
        $("#modal_create_qosSpec").modal("show");
    }

    EventBus.on("create_qosSpec",function(){
        $scope.showModal();
    });

    $scope.clickCheckbox = function(){
        if($scope.set_total_bytes){
            $scope.set_read_bytes = false;
            $scope.set_write_bytes = false;
            $scope.bytes_1=false;
            $scope.bytes_2=true;
        }else{
            if($scope.set_read_bytes||$scope.set_write_bytes){
                $scope.set_total_bytes = false;
                $scope.bytes_2=false;
                $scope.bytes_1=true;
            }
            else{
                $scope.bytes_1=false;
                $scope.bytes_2=false;
            }
        }

        if($scope.set_total_iops){
            $scope.set_read_iops = false;
            $scope.set_write_iops = false;
            $scope.iops_1=false;
            $scope.iops_2=true;
        }else{
            if($scope.set_read_iops||$scope.set_write_iops){
                $scope.set_total_iops = false;
                $scope.iops_2=false;
                $scope.iops_1=true;
            }
            else{
                $scope.iops_1=false;
                $scope.iops_2=false;
            }
        }
    }

    $scope.submitCreateItem = function(){
        var data = {};
        if($scope.set_total_bytes){
            data.total_bytes_sec = $scope.total_bytes_sec*1024*1024;
        }
        if($scope.set_read_bytes){
            data.read_bytes_sec = $scope.read_bytes_sec*1024*1024;
        }
        if($scope.set_write_bytes){
            data.write_bytes_sec = $scope.write_bytes_sec*1024*1024;
        }
        if($scope.set_total_iops){
            data.total_iops_sec = $scope.total_iops_sec;
        }
        if($scope.set_read_iops){
            data.read_iops_sec = $scope.read_iops_sec;
        }
        if($scope.set_write_iops){
            data.write_iops_sec = $scope.write_iops_sec;
        }

        data.name = $scope.name;

        $http({
            method:"POST",
            url:project_url + "/qos_specs",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            EventBus.fire({
                type:"getQosSpec",
                data:{}
            });
            $("#modal_create_qosSpec").modal("hide");
        }).error(function(e){
            $("#modal_create_qosSpec").modal("hide");
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.clickDelete = function(){
        var tr = $("#qosSpec_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.delete_id = tr.eq(0).attr("qos_id");
        $("#delete_QosSpec_modal").modal("show");
    }

    EventBus.on("delete_qos",function(){
        $scope.clickDelete();
    })

    $scope.clickSubmitDelete = function(){
        $http({
            method:"DELETE",
            url:project_url + "/qos_spec/" + $scope.delete_id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(){
            $("#delete_QosSpec_modal").modal("hide");
            EventBus.fire({
                type:"getQosSpec",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
            $("#delete_QosSpec_modal").modal("hide");
        });
    }
});

undefined){
    $scope.clickLink = function(type_id,qos_id){
        var tr = $("#volumeTypes_list").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.link_id = tr.eq(0).attr("type_id");

        $http({
            method:"GET",
            url:project_url + "/qos_specs",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            data.splice(0,0,{id:"",name:"不绑定"});
            $scope.qos_list = data;
            $scope.qos_select = tr.eq(0).attr("qos_id")
        }).error(function(data){
            SAlert.showError(data);
        });

        $("#modal_link_qos").modal("show");
    }

    EventBus.on("link_qos",function(){
        $scope.clickLink();
    })

    $scope.clickSubmitLink = function(){
        var data;
        data = {
            "qos_id": $scope.qos_select
        };
        $http({
            method:"PUT",
            url:project_url + "/type/" + $scope.link_id,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            $("#modal_link_qos").modal("hide");
            EventBus.fire({
                type:"getVolumeTypes",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
            $("#modal_link_qos").modal("hide");
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