/**
 * Created by shmily on 2017/1/23.
 */
//修改angularjs scope外的区域
$(function(){
    set_navigator();
});

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
    $(".navbar-words").html("计算资源 > 密钥管理");

    //$("#compute_resource .sub-menu").css("display", "block");
}


app.config(["$interpolateProvider",function($interpolateProvider){
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
}]);

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
    $scope.getKeypair = function(){
        $http({
            type:"GET",
            url:project_url + "/keypairs",
            headers: {
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
           $scope.keypair_table_pagination(data);
        });
    }

    $scope.keypair_table_pagination = function(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            $scope.renderKeypair(data);
            $("#keypair_pagination").hide();
            return;
        }
        $("#keypair_pagination").show();
        //�����ҳ�İ�
        $("#keypair_pagination").pagination(data_length, {
            callback : pageselectCallback,
            prev_text : '< 上一页',
            next_text: '下一页 >',
            items_per_page : page_num,
            num_display_entries : 4,
            current_page : 0,
            num_edge_entries : 1
        });
        //����¼����ڷ�ҳʱ���õ�
        function pageselectCallback(page_id, jq) {
            var start = page_id*page_num;
            var end = start + page_num;
            if(end>data_length){
                end = start + data_length%page_num;
            }

            if(jq.length>0){
                $scope.$apply(function(){
                    $scope.renderKeypair(data.slice(start, end));
                });
            }
            else{
                $scope.renderKeypair(data.slice(start, end));
            }
        }
    }

    $scope.renderKeypair = function(data){
        if(data.length==0){
            $scope.loading_keypair = "没有记录";
            $scope.has_keypair = false;
        }else{
            $scope.keypair_list = data;
            $scope.has_keypair = true;
        }
    }

    $scope.delete_btn_style="disabled_button";
    $scope.row_click = function(e){
        var _list_name = "#keypair_tbody tr";
        if(e.target.nodeName=="TD" && $(e.currentTarget).hasClass("table_body_tr_change")){
            $(e.currentTarget).removeClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", false);
            $scope.delete_btn_style="disabled_button";
        }
        else{
            var checked_rooms = $(_list_name);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });
            $(e.currentTarget).addClass("table_body_tr_change");
            $(e.currentTarget).children("td").eq(0).find("input").prop("checked", true);
            $scope.delete_btn_style="danger_button";
        }
    }

    $scope.clickDeleteKeypair = function(){
        EventBus.fire({
           type:"delete_keypair_event",
            data:{}
        });
    }

    EventBus.on("getKeypair",function(){
        $scope.getKeypair();
    })

    $scope.getKeypair();
});

undefined){
    $scope.submit_create_keypair = function(){
        if(!submitValidation("create_keypair_form")){
            return;
        }
        $http({
            method:"POST",
            url:project_url + "/keypairs",
            data:{name:$scope.create_name},
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(e){
            console.log(e);
            fileSaver(e.private_key, e.name);
            EventBus.fire({
                type:"getKeypair",
                data:{}
            });
            $("#create_keypair_modal").modal("hide");
        }).error(function(){
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.submit_import_keypair = function(){
        if(!submitValidation("import_keypair_form")){
            return;
        }
        $http({
            method: "POST",
            url:project_url + "/keypairs",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:{name:$scope.import_name,public_key:$scope.import_public_key}
        }).success(function(data){
            $("#import_keypair_modal").modal("hide");
            EventBus.fire({
                type:"getKeypair",
                data:{}
            });
        }).error(function(){
            SAlert.showError(e);
        });
    }
});

undefined){
    EventBus.on("delete_keypair_event",function(){
        var tr = $("#keypair_tbody").find(".table_body_tr_change");
        if(tr.length<1){
            return;
        }
        $scope.delete_keypair_id = tr.eq(0).attr("keypair_name");
        $("#delete_keypair_modal").modal("show");
    });

   $scope.submit_delete_keypair = function(){
       $http({
           method:"DELETE",
           url:project_url + "/keypairs/" + $scope.delete_keypair_id,
           headers: {
                "RC-Token": $.cookie("token_id")
            }
       }).success(function(){
           $("#delete_keypair_modal").modal("hide");
           EventBus.fire({
               type:"getKeypair",
               data:{}
           });
       }).error(function(){
            SAlert.showError(e);
        });
   }
});



function fileSaver(text,name){
    saveAs(
		  new Blob(
			  [text]
			, {type: "text/plain;charset=ANSI"}
		)
		, (name) + ".pem"
	);
}



/**
 * Created by lenovn on 2015/12/28.
 */
$(function (){
// test_create();
// test_import();
//test_get();
// test_get_by_name();
});



function test_create() {
    keypair_data = {name: 'k4'};
$.ajax({
    type: "POST",
    url: project_url + "/keypairs",
    data: JSON.stringify(keypair_data),
    //dataType: "json",
    headers: {
        'Content-Type': 'application/json',
        "RC-Token": $.cookie("token_id")
    },
    success: function (msg) {
        console.log(msg);
    },
    error: function (e) {
        SAlert.showError(e);
    }
});
}


function test_import() {
    keypair_data = {name: 'k5', public_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDXTNQ3lYrH+PiS70WiYUwC10lX+7MB/sgOSb3XHqIVeYSUTYszrGl6H4aijNTx6cOFCo7hzA05WDGZojXS/LW5+F4W2k/4Dur6zNbXa839S5hhTj7VnAyiOcQL79d5f96iJHna0SZO4BBoha2YU48kONbGOBNlUCiZp29UHJnIIYhH/Wnilf7C5XbKNWwq2GU86jZ6rk8s9bDlfafjJ11R/bGf3EVRrvpq1AbqMTS3rVPBabVhyoO9AGFvtHLiUJPVkOIWpEd+J98swSD2/P07x+WxFIlWx7fdOh0Aiq5fVJPd5a429S18FKFK7CO7qkPbLLM2LpMvxWQ71+CkNm/N Generated-by-Nova'},
$.ajax({
    type: "POST",
    url: project_url + "/keypairs",
    data: JSON.stringify(keypair_data),
    //dataType: "json",
    headers: {
        'Content-Type': 'application/json',
        "RC-Token": $.cookie("token_id")
    },
    success: function (msg) {
        console.log(msg);
    },
    error: function (e) {
        SAlert.showError(e);
    }
});
}




function test_get() {
$.ajax({
    type: "GET",
    url: project_url + "/keypairs",
    dataType: "json",
    headers: {
        "RC-Token": $.cookie("token_id")
    },
    success: function (msg) {
        console.log(msg);
    },
    error: function (e) {
        SAlert.showError(e);
    }
});
}

function test_get_by_name() {
$.ajax({
    type: "GET",
    url: project_url + "/keypairs?name=k",
    dataType: "json",
    headers: {
        "RC-Token": $.cookie("token_id")
    },
    success: function (msg) {
        console.log(msg);
    },
    error: function (e) {
        SAlert.showError(e);
    }
});
}

function test_delete() {
$.ajax({
    type: "DELETE",
    url: project_url + "/keypairs/k1",
    headers: {
        "RC-Token": $.cookie("token_id")
    },
    success: function (msg) {
        console.log(msg);
    },
    error: function (e) {
        SAlert.showError(e);
    }
});
}