/**
 * Created by shmily on 2017/2/14.
 */

app.controller('Topo2Controller',['$scope','$http','$timeout','SAlert','PermitStatus',function ($scope,$http,$timeout,SAlert,PermitStatus) {
    $(function(){
        $timeout(function () {
            get_departments();
            set_navigator();
        },1000);
    });

    function set_navigator(){
        if ($("#network_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            });
            $("#network_resource").removeClass('active');
            $("#network_resource").addClass('dhbg');
        }
        $(".navbar-words").html("网络资源 > 网络拓扑");
    }

    var conf = horizon.conf;
    conf.spinner_options = {
      inline: {
        lines:  10,
        length: 5,
        width:  2,
        radius: 3,
        color:  '#000',
        speed:  0.8,
        trail:  50,
        zIndex: 100
      },
      modal: {
        lines:  10,
        length: 15,
        width:  4,
        radius: 10,
        color:  '#000',
        speed:  0.8,
        trail:  50
      },
      line_chart: {
        lines:  10,
        length: 15,
        width:  4,
        radius: 11,
        color:  '#000',
        speed:  0.8,
        trail:  50
      }
    };

        horizon.test_cookies = {};
        horizon.cookies = {
          put: function (key, value) { horizon.test_cookies[key] = value; },
          getRaw: function (key) { return horizon.test_cookies[key]; },
          get: function (key) { return horizon.test_cookies[key]; }
        };


        function gettext(message){
            return message;
        }

        click_submit_add_interface();
        submit_delete_interface();

      if (typeof horizon.network_topology !== 'undefined') {
        horizon.network_topology.init();
      } else {
        addHorizonLoadEvent(function () {
          horizon.network_topology.init();
        });
      }


    function scaleOn(){
        var scale = ($("#topologyCanvasContainer").width()-20)/parseInt($("#topology_canvas").attr("width"));
        scale=scale>1?1:scale;
        $("#svg_container")
            .attr("height",parseInt($("#topology_canvas").attr("height"))*scale)
            .attr("width",parseInt($("#topology_canvas").attr("width"))*scale);
        $("#svg_scale").attr("transform","scale(" + scale + ")");
        if(scale<0.7){
            $("#svg_scale").find(".icon text").hide();
        }

        var option =
            {
                events: {
                    mouseWheel:(true), // enables mouse wheel zooming events
                    doubleClick: (true), // enables double-click to zoom-in events
                    drag: (true), // enables drag and drop to move the SVG events
                    dragCursor: "move" // cursor to use while dragging the SVG
                },
                animationTime: (300), // time in milliseconds to use as default for animations. Set 0 to remove the animation
                zoomFactor: (0.25), // how much to zoom-in or zoom-out
                maxZoom: (3), //maximum zoom in, must be a number bigger than 1
                panFactor:  (100), // how much to move the viewBox when calling .panDirection() methods
                initialViewBox: {// the initial viewBox, if null or undefined will try to use the viewBox set in the svg tag. Also accepts string in the format "X Y Width Height"
                    x: (0), // the top-left corner X coordinate
                    y: (0), // the top-left corner Y coordinate
                    width: (parseInt($("#topology_canvas").attr("width"))*scale), // the width of the viewBox
                    height: (parseInt($("#topology_canvas").attr("height"))*scale) // the height of the viewBox
                },
                limits: { // the limits in which the image can be moved. If null or undefined will use the initialViewBox plus 15% in each direction
                    x: (-0),
                    y: (-0),
                    x2: (parseInt($("#topology_canvas").attr("width"))*scale),
                    y2: (parseInt($("#topology_canvas").attr("height"))*scale)
                }
            }

        //$("#svg_container").svgPanZoom();
    }
    window.scaleOn = scaleOn;//TODO 跨js访问最后需要放到service里面
    function scaleOff(){
        $("#svg_container").attr("height",parseInt($("#topology_canvas").attr("height")));
        $("#svg_container").attr("width",parseInt($("#topology_canvas").attr("width")));
        $("#svg_scale").removeAttr("transform");
        $("#svg_scale").find(".icon text,.network-name,.network-cidr").show();
    }


    function redrawTopo(){
        horizon.network_topology.init();
    }


    function serverAction(action, server_id) {

        var $server_tr = $("#server_table tbody tr input:checked").closest('tr');
        var state = $server_tr.children().eq(8).html();
        var name = $server_tr.children().eq(1).html();

        if (action == "start" && state == "运行中") {
            SAlert.showMessage("虚拟机：" + name + "已经处于运行状态！")
        } else if (action == "stop" && state == "关机") {
            SAlert.showMessage("虚拟机：" + name + "已经处于关机状态！")
        } else {
            var action_map = {
                'start': "start",
                'console': "get_vnc_console",
                'stop': "stop"
            };
            var request_data = {
                "id": server_id,
                "action": action_map[action]
            };

            if (action == "console") {
                request_data['type'] = 'novnc';
            }

            var query_path = project_url + "/servers/" + server_id + "/action";

            $.ajax({
                type: "POST",
                url: query_path,
                data: JSON.stringify(request_data),
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    //console.log("in success");
                    if (action == 'console') {
                        render_vnc_url(JSON.parse(data));
                        redrawTopo();
                    }
                },
                error: function (e) {
                    SAlert.showError(e)
                }
            });
        }
    }

    function render_vnc_url(data) {
        var url = data.console.url;
        window.open(url,"console");
    }



    function init_create_interface_form(data){
        if(data.length){
            $("#subnet_id").empty();
            var default_option = '<option value="">请选择网络</option>';
            $("#subnet_id").append(default_option);
            for (var i=0,l=data.length;i<l;i++){
                var network_option = $("<option></option>");
                network_option.attr("value",data[i].subnet_id);
                network_option.text(data[i].network_name + "("+data[i].cidr+")");
                $("#subnet_id").append(network_option);
            }
            $("#create_interface_router_id").val(data.router_id);
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

    function click_submit_add_interface(){
        $("#submit_create_interface").click(function(){
            var router_id = $("#create_interface_router_id").val();
            var interface_data = getFormObject("#create_interface_form");
            //console.log(interface_data);
            //if(!check_add_interface_form(interface_data.subnet_id)){
            //    return;
            //}
            //console.log(router_id);
            $.ajax({
                type:"POST",
                url:project_url + "/router_interface/"+router_id,
                data: JSON.stringify(interface_data),
                //dataType: "json",
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    $("#create_interface_modal").modal('hide');
                    //init_router_interface_table(router_id)
                    //location.reload()
                    redrawTopo();
                },
                error:function(e){
                    //console.log(e);
                    $("#create_interface_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_create_interface").addClass("disabled_button");
            $("#submit_create_interface").removeClass("form_general_button");
            $("#submit_create_interface").attr("disabled", "disabled");

        });
    }

    function click_delete_interface(subnet_id,router_id,interface_type){
        $("#delete_subnet_id").val(subnet_id);
        $("#delete_router_id").val(router_id);
        $("#delete_interface_type").val(interface_type);
        $("#delete_interface_modal").modal("show");
    }

    function submit_delete_interface(){
        $("#submit_delete_interface").click(function(){
            var subnet_id = $("#delete_subnet_id").val();
            var router_id = $("#delete_router_id").val();
            var interface_type = $("#delete_interface_type").val();
            $("#delete_subnet_id").val("");
            $("#delete_router_id").val("");
            $("#delete_interface_type").val("");
            $("#delete_interface_modal").modal("hide");

            if(interface_type == "router_gateway"){
                $.ajax({
                    type:"PUT",
                    url:project_url + "/router/"+ router_id,
                    data: JSON.stringify({"network_id":""}),
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        redrawTopo();
                    },
                    error:function(e){
                        SAlert.showError(e)
                    }
                });
                return
            }
            console.log(subnet_id)
            $.ajax({
                type:"DELETE",
                url:project_url + "/router_interface/" +router_id,
                data: JSON.stringify({"subnet_id":subnet_id}),
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    redrawTopo();
                },
                error:function(e){
                    SAlert.showError(e)
                }
            });
        });
    }

    function get_departments(){
        if($("#select_department").length){
            $.ajax({
                type: "GET",
                url: project_url + "/departments",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_departments(JSON.parse(data).departments);
                },
                error: function (e) {
                    SAlert.showError(e)
                }
            });

            $("#select_department").change(function(){
                redrawTopo();
            });
        }
    }

    function render_departments(data){
        $("#select_department").html("");
        $("#select_department").append("<option value=''>所有部门</option>");
        for(var i=0;i<data.length;i++){
            var op = "<option value='" + data[i].id + "'>" + data[i].name + "</option>"
            $("#select_department").append(op);
        }
    }
}]);

