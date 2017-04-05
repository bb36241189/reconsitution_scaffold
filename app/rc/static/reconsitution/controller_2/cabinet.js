/**
 * Created by lenovn on 2016/2/22.
 */
app.controller("cabinetController",function($scope,$http,$timeout,SAlert,PermitStatus,PermitStatus){
	$scope.data = {
		PermitStatus : PermitStatus
	};
	$timeout(function(){
	set_navigator();
	init_room_table();


	var canvas = document.getElementById('canvas');
	var stage = new JTopo.Stage(canvas);
	showJTopoToobar(stage);

	var scene = new JTopo.Scene(stage);

	var base_x = 30;
	var base_y = 20;
	var base_height = 60;
	var base_width = 60;
	var space_x = 30;
	var space_y =50;
	var row_num=10;

	//捕捉失去焦点事件
	scene.addEventListener("mouseup",function(e){
		if(!e.target || e.target.elementType != "node"){
			disable_button();
		}
	});

	/*function get_all_cabinets(){
        $.ajax({
			type: "GET",
			url: "/infrastructure/cabinets",
			async: true,
			dataType: "json",
			headers:{
				"RC-Token": $.cookie("token_id")
			},
			success: function(data){
				console.log(data);
				init_data(data);
			},
			error: function(e){
				console.log(e);
				SAlert.showError(e);
			}
		});
	}*/
	//get_all_cabinets();
	//var data = []
	function init_data(data){
		scene.clear();
		var data_length=data.length;
		var rows = data_length / row_num;
		var display_row = function(row_data, line_num){
			for(var i=0;i<row_data.length;i++){
				newNode(base_x+(base_width+space_x)*i, base_y+(base_height+space_y)*line_num, base_width, base_height, row_data[i]);
			}
		}
		if(data_length % row_num>0){
			rows +=1;
		}
		if(data_length<=row_num){
			display_row(data, 0);
			return;
		}
		for(var j=0;j<rows;j++){
			display_row(data.slice(row_num*j, row_num*(j+1)), j);
		}
	}

	var currentNode = null;
	function newNode(x, y, w, h, data){

		//console.log(data);
		var node = new JTopo.Node(data.name);
		node.setLocation(x, y);
		//node.setSize(w, h);
		node.fontColor = "#e02222";
		node.setImage(project_url + '/static/images/cabinet.png', true);
		node.cabinet_id = data.id;
		node.cabinet_name = data.name;
		scene.add(node);
		/*node.addEventListener('mouseup', function(event){
			currentNode = this;
			handler(event);
			console.log("mouseup event");
		});*/

		node.mouseover(function(event){
			currentNode = this;
			$("#detail").css({
				//top: event.pageY - 60,
				//left: event.pageX - 180
				top:event.y,
				left:event.x
			}).show();
            //console.log(this);
			//console.log(this.cabinet_id);
			init_cabinet_detail(this.cabinet_id);
		});

		node.mouseout(function(event){
			currentNode = this;
			$("#detail").hide();
			$("#contextmenu").hide();
			//console.log("this is mouseout");
		});

		node.mouseup(function(event){
			currentNode = this;
			//得到焦点
			left_click_handler(event,this.cabinet_id);
			recover_button();

			if(event.button == 0){

				//console.log("this is left click");
			}else if(event.button == 2){
				$("#contextmenu").css({
			    	top:event.pageY,
			    	left:event.pageX
				}).show();
				$("#detail").hide();
			}
		});

		node.dbclick(function(event){
			currentNode = this;
			//console.log(this.cabinet_id);
			$("#current_cabinet_name").html(this.cabinet_name);
			get_cabinet_hosts(this.cabinet_id);
			$("#cabinet_topology_modal").modal("show");
		});

		return node;
	}

	function left_click_handler(event,id){
		$("#detail").hide();
		$("#contextmenu").hide();
		init_cabinet_detail(id,true);
	}

	/*var textfield = $("#jtopo_textfield");

	$("#jtopo_textfield").blur(function(){
			textfield[0].JTopoNode.text = textfield.hide().val();
		});*/

	/*$("#contextmenu li a").click(function(){
                var text = $(this).text();
                //console.log(text);
                if(text == 'delete'){
					console.log(currentNode);
                    scene.remove(currentNode);
                    currentNode = null;
                }
                else if(text == 'change_color'){
                    currentNode.fillColor = JTopo.util.randomColor();
                }else if(text == 'Clockwise_rotation'){
                    currentNode.rotate += 0.5;
                }else if(text == 'Counter_clockwise_rotation'){
                    currentNode.rotate -= 0.5;
                }else if(text == 'enlarge'){
                    currentNode.scaleX += 0.2;
                    currentNode.scaleY += 0.2;
                }else if(text == 'narrow'){
                    currentNode.scaleX -= 0.2;
                    currentNode.scaleY -= 0.2;
                }
                $("#contextmenu").hide();
            });*/

	$("#submit_delete_cabinet").click(function () {
		var room_id = $("#room_table  tbody tr[class='table_body_tr_change']").eq(0).attr("id");
		//console.log(room_id);
		$.ajax({
			type:"DELETE",
			url:project_url + "/infrastructure/cabinets/"+currentNode.cabinet_id,
			headers: {
				'RC-Token': $.cookie("token_id")
			},
			success:function(msg){
				//location.reload();
				$("#delete_cabinet_modal").modal("hide");
				get_room_cabinets(room_id);
			},
			error:function(e){
				$("#delete_cabinet_modal").modal("hide");
				SAlert.showError(e);
			}
		});

		$("#submit_delete_cabinet").addClass("disabled_button");
        $("#submit_delete_cabinet").removeClass("form_danger_button");
        $("#submit_delete_cabinet").attr("disabled", "disabled");
	});

	$("#submit_edit_cabinet").click(function(){
        var cabinet_data = getFormObject("#edit_cabinet_form");
		var room_id = $("#room_table  tbody tr[class='table_body_tr_change']").eq(0).attr("id");
		if(!submitValidation("edit_cabinet_form")){
			return;
		}
        cabinet_data.id = currentNode.cabinet_id;
        //console.log(cabinet_data);
		//return
        $.ajax({
            type:"PUT",
            url:project_url + "/infrastructure/cabinets",
            data: JSON.stringify(cabinet_data),
            headers: {
				'Content-Type': 'application/json',
				'RC-Token': $.cookie("token_id")
			},
            success:function(msg){
                $("#edit_cabinet_modal").modal('hide');
				get_room_cabinets(room_id);
                //location.reload();
            },
            error:function(e){
                $("#edit_cabinet_modal").modal("hide");
				SAlert.showError(e);
            }
        });

		$("#submit_edit_cabinet").addClass("disabled_button");
        $("#submit_edit_cabinet").removeClass("form_general_button");
        $("#submit_edit_cabinet").attr("disabled", "disabled");
	});

	function click_submit_create_cabinet(){
		$("#submit_create_cabinet").click(function(){
		var room_id = $("#room_table  tbody tr[class='table_body_tr_change']").eq(0).attr("id");
		if(!submitValidation("create_cabinet_form")){
			return;
		}
        var cabinet_form =  getFormObject("#create_cabinet_form");
        //console.log(cabinet_form);

        $.ajax({
				type:"POST",
				url:project_url + "/infrastructure/cabinets",
				data: JSON.stringify(cabinet_form),
                headers: {
					'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
				},
				success:function(msg){
					$("#create_cabinet_modal").modal('hide');
					get_room_cabinets(room_id);
					//location.reload()
				},
				error:function(e){
					$("#create_cabinet_modal").modal("hide");
					SAlert.showError(e);
				}
			});

		$("#submit_create_cabinet").addClass("disabled_button");
        $("#submit_create_cabinet").removeClass("form_general_button");
        $("#submit_create_cabinet").attr("disabled", "disabled");
	});
}

	function click_table_tr(){
	$("#room_table tbody tr").click(function(){
		if(!$(this).hasClass("table_body_tr_change")){
			var checked_rooms = $("#room_table tbody tr");
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
            });
            $(this).addClass("table_body_tr_change");
			disable_button();
			get_room_cabinets($(this).attr("id"))

        }
    });

	$('#refresh').click(function(){
		if($(".table_body_tr_change"))
		{
			get_room_cabinets($(".table_body_tr_change").attr("id"));
		}
	});
}

	function disable_button(){
		$("#tool_edit").removeClass("up");
		$("#tool_edit").addClass("down");
		$("#tool_edit").addClass("disabled");

		$("#tool_delete").removeClass("up");
		$("#tool_delete").addClass("down");
		$("#tool_delete").addClass("disabled");
	}

	function recover_button(){
		$("#tool_edit").addClass("up");
		$("#tool_edit").removeClass("down");
		$("#tool_edit").removeClass("disabled");

		$("#tool_delete").addClass("up");
		$("#tool_delete").removeClass("down");
		$("#tool_delete").removeClass("disabled");
	}

	function init_room_table(){
    	$.ajax({
        type: "GET",
        url: project_url + "/infrastructure/rooms",
        async: true,
        dataType: "json",
		headers: {
			'RC-Token': $.cookie("token_id")
		},
        success: function(data){
                render_room_table(data);
        },
        error: function(e){
			SAlert.showError(e);
        }

    });
}

    function render_room_table(data){
    var rooms = $("#room_tbody");
    if (data.length){
        for(var i= 0,l=data.length;i<l;i++){
            var table_tr = $("<tr></tr>");
            table_tr.attr("id", data[i].id);
            var table_body =
                '<td >' + data[i].name + '</td>';

             table_tr.append(table_body);
             rooms.append(table_tr);
        }
        set_room_default_checked();
        click_table_tr();
    }
    else{
        var table_tr = '<tr><td colspan="1">没有机房</td></tr>';
        rooms.append(table_tr);
    }
}

	function set_room_default_checked(){
		var _id = getUrlParam("id");
		if(_id!=null&&_id!=""){
			var this_tr = $("#room_tbody").find("tr[id=" + _id + "]");
			this_tr.addClass("table_body_tr_change");
			get_room_cabinets(this_tr.attr("id"));
		}
		else{
			$("#room_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
			var tr_id = $("#room_tbody").find("tr:eq(0)").attr("id");
			get_room_cabinets(tr_id);
		}
	}

	function get_room_cabinets(room_id){
		if(room_id){
			$.ajax({
				type: "GET",
				url: project_url + "/infrastructure/cabinets"+"?room_id="+room_id,
				async: true,
				dataType: "json",
				headers: {
					'RC-Token': $.cookie("token_id")
				},
				success: function(data){
					//console.log(data)
					init_data(data);
				},
				error: function(e){
					//console.log("error");
					SAlert.showError(e);
				}

   			 });
		}
	}

	function get_cabinet_hosts(cabinet_id){
		if(cabinet_id){
			$.ajax({
				type: "GET",
				url:project_url +  "/cabinet/"+cabinet_id+"/hosts/",
				async: true,
				dataType: "json",
				headers: {
					'RC-Token': $.cookie("token_id")
				},
				success: function(data){
					//console.log(data)
					render_cabinet_host(data);
				},
				error: function(e){
					//console.log("error");
					SAlert.showError(e);
				}
   			 });
		}
	}

	function render_cabinet_host(data){
		if(!data.length){
			$("#cabinet_hosts").html("机柜暂无物理服务器，请关联物理服务器和机柜关系");
			$(".server_status").hide();
			return
		}
		$("#cabinet_hosts").html("");
		$(".server_status").show();
		var hosts = $("#cabinet_hosts");
		//console.log(data);
		var host_base_url = project_url + "/app/host/";
		var server_base_url = project_url + "/app/server/";
		for(var i= 0;i<data.length;i++){
            var host = $("<div class='host_div'></div>");
			var host_servers = $("<div class='server_div'></div>");
			var host_postion = "<div class='position_div'>" + '<div>'+data[i].end+"U"+'</div>'+'<div class="start_position">'+data[i].start+"U"+'</div>'+"</div>";
			var host_pic = $("<div class='pic_div'></div>");

			var host_gif = project_url + "/static/images/single/"+"host"+"_"+data[i].status+"_"+"1u"+".gif";
            //console.log(host_gif);
			var host_url = host_base_url + data[i].id;
			var host_status = '<a'+' '+'href='+host_url+ ' target="_blank" >'+'<img src='+host_gif+" "+ 'title='+data[i].hostname+"("+data[i].ip+")"+" "+'data-toggle="tooltip" data-placement="top">'+'</a>';

			//console.log(host_status);
			host_pic.append(host_status);
			//host_pic.append('<div>'+"255.255.255.255"+'</div>');
			var server = "暂无虚拟机";
			var servers_info = data[i].servers;
			//console.log(servers_info);
			if (servers_info.length){
				for (var j=0; j<servers_info.length; j++){
					var server_img= project_url + "/static/images/single/server_on.png";
					//console.log(servers_info[j].id);
					var server_url = server_base_url + servers_info[j].id;
					if(servers_info[j].status == "error"){
                        server_img = project_url + "/static/images/single/server_error.png";
                    	//server = '<img src="/static/images/single/server_on.png" class="server_img" title='+servers_info[j].name+"("+servers_info[j].ip+")"+' data-toggle="tooltip" data-placement="top">'
					}else if(servers_info[j].status == "stopped"){
						server_img = project_url + "/static/images/single/server_off.png";
                    	//server = '<img src="/static/images/single/server_off.png" class="server_img" title='+servers_info[j].name+"("+servers_info[j].ip+")"+' data-toggle="tooltip" data-placement="top">'
					}
					//else if(servers_info[j].status == "error"){
                    	//server = '<img src="/static/images/single/server_error.png" class="server_img" title='+servers_info[j].name+"("+servers_info[j].ip+")"+' data-toggle="tooltip" data-placement="top">'
					//}
					server = '<a'+' '+'href='+server_url+ ' target="_blank">'+ '<img'+' '+'src='+server_img + ' class=server_img' + ' title='+servers_info[j].name+"("+servers_info[j].ip+")"+ ' data-toggle="tooltip" data-placement="top">';
                	host_servers.append(server);
				}
			}else{
				host_servers.append(server);
			}

			host.append(host_postion);
			host.append(host_pic);
            host.append(host_servers);

            hosts.append(host);

			$("img[data-toggle]").tooltip();
        }
	}

	click_add_cabinet();
	click_edit_cabinet();
	click_delete_cabinet();
    click_submit_create_cabinet();
});

function set_navigator(){
    if ($("#infrastructure").hasClass('active')) {
        var lis = $('#demo1').children("li");
        lis.each(function () {
            $(this).addClass('active');
            $(this).removeClass('dhbg');
        })
        //console.log("has");
        $("#infrastructure").removeClass('active');
        $("#infrastructure").addClass('dhbg');
        //console.log($('#demo1:not(this)').children("li"));
		$(".navbar-words").html("基础设施 > 机柜管理");
    }

    //$("#infrastructure .sub-menu").css("display", "block");
}

function click_add_cabinet(){
	$("#add_cabinet").click(function(){
		$("#create_cabinet_modal").modal("show");
		$("#submit_create_cabinet").addClass("form_general_button");
        $("#submit_create_cabinet").removeClass("disabled_button");
        $("#submit_create_cabinet").removeAttr("disabled");

        $.ajax({
			type:"GET",
			url:project_url + "/infrastructure/rooms",
			dataType: "json",
			headers: {
				'RC-Token': $.cookie("token_id")
			},
			success:function(data){
				//console.log(data);
				init_create_cabinet_room(data)
			},
			error:function(e){
				//console.log(err);
				SAlert.showError(e);
			}
		});
	})
}

function click_edit_cabinet(){
	$("#edit_cabinet").click(function(){
		//console.log(111);
        $("#submit_edit_cabinet").addClass("form_general_button");
        $("#submit_edit_cabinet").removeClass("disabled_button");
        $("#submit_edit_cabinet").removeAttr("disabled");
	});
}

function click_delete_cabinet(){
	$("#delete_cabinet").click(function(){
        $("#submit_delete_cabinet").addClass("form_danger_button");
        $("#submit_delete_cabinet").removeClass("disabled_button");
        $("#submit_delete_cabinet").removeAttr("disabled");
	});
}

function init_create_cabinet_room(rooms){
    $("#room_id").empty();
	var default_option = $("<option value=''>请选择所在机房</option>");
	$("#room_id").append(default_option);
    for(var i=0,l=rooms.length;i<l;i++){
		var room_option = $("<option></option>");
		room_option.attr("value",rooms[i].id);
		room_option.text(rooms[i].name);
		$("#room_id").append(room_option);
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



function init_cabinet_detail(cabinet_id,edit){
    if(cabinet_id){
        $.ajax({
            type: "GET",
            url: project_url + "/infrastructure/cabinets/" + cabinet_id,
            async: true,
            dataType: "json",
			headers: {
                'RC-Token': $.cookie("token_id")
            },
            success: function(data){
                if (data) {
                    //console.log(data);
                    render_detail_data(data);
					if(edit){
						render_edit_form(data);
					}
                }
            },
            error: function(e){
                //console.log(e);
				SAlert.showError(e)
            }
        });
    }
}

function render_detail_data(data){
    $("#cabinet_name").text(data.name);
	$("#cabinet_room").text(data.room_name);
	$("#host_num").text(data.host_num);
	$("#cabinet_height").text(data.height);
	$("#cabinet_description").text(data.description);
	$("#create_time").text(data.create_time);
	$("#update_time").text(data.update_time);

	$("#cabinet_name").attr("title", data.name);
	$("#cabinet_room").attr("title", data.room_name);
	$("#cabinet_description").attr("title", data.description);
}

function render_edit_form(data){
    $("#edit_name").val(data.name);
	$("#edit_height").val(data.height);
	$("#edit_description").val(data.description);

	$.ajax({
		type:"GET",
		url:project_url + "/infrastructure/rooms",
		dataType: "json",
		headers: {
			'RC-Token': $.cookie("token_id")
		},
		success:function(rooms){
			//console.log(rooms);
			init_edit_cabinet_room(rooms, data.room_name)
		},
		error:function(e){
			//console.log(e);
			SAlert.showError(e);
		}
	});

}

function init_edit_cabinet_room(rooms, current_room){
	$("#edit_room_id").empty();
    for(var i=0,l=rooms.length;i<l;i++){
            var room_option = $("<option></option>");
            room_option.attr("value",rooms[i].id);
            room_option.text(rooms[i].name);
            if(rooms[i].name == current_room){
                room_option.attr("selected","selected");
            }
            $("#edit_room_id").append(room_option);
    }
}


function getUrlParam(name){
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg);
    //返回参数值
    if (r!=null) return unescape(r[2]);
    return null;
}
});