/**
 * Created by shmily on 2017/2/15.
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

app.controller("flavor_list_ctl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.getlist= function(){
        $http({
            method:"GET",
            url:project_url + "/flavors",
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            $scope.table_pagination(data);
        }).error(function(data){
            SAlert.showError(data,SAlert);
        });
    }

    $scope.table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderList(data);
            $("#flavor_pagination").hide();
            return;
        }
        $("#flavor_pagination").show();
        //加入分页的绑定
        $("#flavor_pagination").pagination(data_length, {
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
            $scope.flavors = data;
            $scope.bool_rows = true;
        }
    }

    $scope.clickTableTr = function(e){
        var _list_name = "#flavor_tbody tr";
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
            type:"create_flavor",
            data:{}
        });
    }

    $scope.clickcEditItem = function(){
        EventBus.fire({
            type:"edit_flavor",
            data:{}
        });
    }

    $scope.clickDeleteItem = function(){
        EventBus.fire({
            type:"delete_flavor",
            data:{}
        });
    }

    EventBus.on("get_flavor",function(){
        $scope.getlist();
    });

    $scope.danger_status = "disabled_button";
    $scope.general_status = "disabled_button";
    $scope.loading_volumeTypes = "正在加载";
    $scope.getlist();

});

app.controller("modal_create_flavor",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.showModal = function(){
        $("#modal_create_flavor").modal("show");
    }

    EventBus.on("create_flavor",function(){
        $scope.name="";
        $scope.vcpus="";
        $scope.ram="";
        $scope.disk="";
        $scope.price="";
        $scope.showModal();
    });

    $scope.submitCreate = function(){
        if(!submitValidation("form_create_flavor")){
            return;
        }

        var data = {};
        data.name = $scope.name;
        data.vcpus = $scope.vcpus;
        data.ram = $scope.ram;
        data.disk = $scope.disk;
        data.price = $scope.price;
        $http({
            method:"POST",
            url:project_url + "/flavors",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            EventBus.fire({
                type:"get_flavor",
                data:{}
            });
            $("#modal_create_flavor").modal("hide");
        }).error(function(){
            $("#modal_create_flavor").modal("hide");
            SAlert.showError(e);
        });
    }
});

// app.controller("modal_edit_flavor",function($scope,$http,EventBus,PermitStatus){
//     $scope.showModal = function(){
//         $("#modal_edit_flavor").modal("show");
//     }
//
//     EventBus.on("edit_flavor",function(){
//         var tr = $("#flavor_tbody").find(".table_body_tr_change");
//         if(tr.length<1){
//             return;
//         }
//         $scope.id = tr.eq(0).attr("id");
//         $scope.name=tr.eq(0).attr("name");
//         $scope.vcpus=parseInt(tr.eq(0).attr("vcpus"));
//         $scope.ram=parseInt(tr.eq(0).attr("ram"));
//         $scope.disk=parseInt(tr.eq(0).attr("disk"));
//         $scope.showModal();
//     });
//
//     $scope.submitEdit = function(){
//         if(!submitValidation("form_edit_flavor")){
//             return;
//         }
//
//         var data = {};
//         data.name = $scope.name;
//         data.vcpus = $scope.vcpus;
//         data.ram = $scope.ram;
//         data.disk = $scope.disk;
//         $http({
//             method:"PUT",
//             url:project_url + "/flavor/" + $scope.id,
//             headers: {
//                 'Content-Type': 'application/json',
//                 "RC-Token": $.cookie("token_id")
//             },
//             data:JSON.stringify(data)
//         }).success(function(){
//             EventBus.fire({
//                 type:"get_flavor",
//                 data:{}
//             });
//             $("#modal_edit_flavor").modal("hide");
//         }).error(function(){
//             $("#modal_edit_flavor").modal("hide");
//             SAlert.showError(e);
//         });
//     }
// });


app.controller("delete_flavor_modal",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.clickDelete = function(){
        var tr = $("#flavor_tbody").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.id = tr.eq(0).attr("id");
        $("#delete_flavor_modal").modal("show");
    }

    EventBus.on("delete_flavor",function(){
        $scope.clickDelete();
    })

    $scope.clickSubmitDelete = function(){
        $http({
            method:"DELETE",
            url:project_url + "/flavor/" + $scope.id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(){
            $("#delete_flavor_modal").modal("hide");
            EventBus.fire({
                type:"get_flavor",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
            $("#delete_flavor_modal").modal("hide");
        });
    }
});



