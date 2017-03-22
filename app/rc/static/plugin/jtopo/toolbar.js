// 页面工具栏
function showJTopoToobar(stage){
	var toobarDiv = $('<div class="jtopo_toolbar">').html(''
		+'<input type="radio" name="modeRadio" value="normal" checked id="r1"/>'
		+'&nbsp;<label for="r1"> 默认</label>'
		+'&nbsp;<input type="radio" name="modeRadio" value="select" id="r2"/>&nbsp;<label for="r2"> 框选</label>'
		//+'&nbsp;&nbsp;<input type="checkbox" id="zoomCheckbox"/>&nbsp;<label for="zoomCheckbox">鼠标缩放</label>'
		//+'&nbsp;&nbsp;<input id="search_server_input" class="table_search_input" type="text" placeholder="搜索">'
		//+'<img id="search_server_img" class="table_search_img" src="/static/images/table_operate_button/search.png">'
		+'<input class="table_button general_button" type="button" id="centerButton" value="居中显示"/>'
		+'&nbsp;<input class="table_button general_button" type="button" id="fullScreenButton" value="全屏显示"/>'
		//+'&nbsp;<input class="table_button general_button" type="button" id="zoomOutButton" value=" 放 大 " />'
		//+'&nbsp;<input class="table_button general_button" type="button" id="zoomInButton" value=" 缩 小 " />'
		+'&nbsp;<input class="table_button general_button" type="button" id="exportButton" value="导出PNG">'
		+'&nbsp;<input class="table_button general_button" type="button" id="add_cabinet" value="添加" data-toggle="modal" data-target="#create_cabinet_modal"/>'
		//+'&nbsp;<input class="table_button general_button" type="button" id="zoomEditButton" value="编辑" />'
		+'&nbsp;<input class="table_button general_button" type="button" id="zoomRefButton" value="刷新" />');
		//+'&nbsp;<input class="table_button general_delete_button" type="button" id="zoomDeleteButton" value="删除" />');
		
	//$('#toolbar').prepend(toobarDiv);

	// 工具栏按钮处理
	//$("input[name='modeRadio']").click(function(){
	//	stage.mode = $("input[name='modeRadio']:checked").val();
	//});
	$("#tool_normalmode").click(function(){
		stage.mode = "normal";
		$(this).removeClass("down");
		$(this).addClass("up");
		$("#tool_selectmode").removeClass("up");
		$("#tool_selectmode").addClass("down");
	});

	$("#tool_selectmode").click(function(){
		stage.mode = "select";
		$(this).removeClass("down");
		$(this).addClass("up");
		$("#tool_normalmode").removeClass("up");
		$("#tool_normalmode").addClass("down");
	});

	$('#centerButton').click(function(){
		stage.centerAndZoom(); //缩放并居中显示
	});
	$('#zoomOutButton').click(function(){
		stage.zoomOut();
	});
	$('#zoomInButton').click(function(){
		stage.zoomIn();
	});
	$('#exportButton').click(function(){
		stage.saveImageInfo();
	});
	$('#zoomCheckbox').click(function(){
		if($(this).hasClass('up')){
			stage.wheelZoom = 0.85; // 设置鼠标缩放比例
			$(this).removeClass('up');
			$(this).addClass("down");
		}else{
			stage.wheelZoom = null; // 取消鼠标缩放比例
			$(this).removeClass('down');
			$(this).addClass("up");
		}
	});
	$('#fullScreenButton').click(function(){
		runPrefixMethod(stage.canvas, "RequestFullScreen")
	});

	$('.imbtn').hover(function(){
		$(this).removeClass('down');
		$(this).addClass("up");
	},function(){
		$(this).removeClass('up');
		$(this).addClass("down");
	});

	$('#tool_edit').click(function(){
		if(!$(this).hasClass("disabled")){
            $("#submit_edit_cabinet").addClass("form_general_button");
            $("#submit_edit_cabinet").removeClass("disabled_button");
            $("#submit_edit_cabinet").removeAttr("disabled");
			$("#edit_cabinet_modal").modal("show");
		}
	})

	$('#tool_delete').click(function(){
		if(!$(this).hasClass("disabled")){
			$("#submit_delete_cabinet").addClass("form_danger_button");
            $("#submit_delete_cabinet").removeClass("disabled_button");
            $("#submit_delete_cabinet").removeAttr("disabled");
			$("#delete_cabinet_modal").modal("show");
		}
	})
	// 查询
	$('#findButton').click(function(){
		var text = $('#findText').val().trim();
		var nodes = stage.find('node[text="'+text+'"]');
		if(nodes.length > 0){
			var node = nodes[0];
			node.selected = true;
			var location = node.getCenterLocation();
			// 查询到的节点居中显示
			stage.setCenter(location.x, location.y);
			
			function nodeFlash(node, n){
				if(n == 0) {
					node.selected = false;
					return;
				};
				node.selected = !node.selected;
				setTimeout(function(){
					nodeFlash(node, n-1);
				}, 300);
			}
			
			// 闪烁几下
			nodeFlash(node, 6);
		}
	});
}

var runPrefixMethod = function(element, method) {
	var usablePrefixMethod;
	["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
		if (usablePrefixMethod) return;
		if (prefix === "") {
			// 无前缀，方法首字母小写
			method = method.slice(0,1).toLowerCase() + method.slice(1);
		}
		var typePrefixMethod = typeof element[prefix + method];
		if (typePrefixMethod + "" !== "undefined") {
			if (typePrefixMethod === "function") {
				usablePrefixMethod = element[prefix + method]();
			} else {
				usablePrefixMethod = element[prefix + method];
			}
		}
	}
);

return usablePrefixMethod;
};
/*
runPrefixMethod(this, "RequestFullScreen");
if (typeof window.screenX === "number") {
var eleFull = canvas;
eleFull.addEventListener("click", function() {
	if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
		runPrefixMethod(document, "CancelFullScreen");
		this.title = this.title.replace("退出", "");
	} else if (runPrefixMethod(this, "RequestFullScreen")) {
		this.title = this.title.replace("点击", "点击退出");
	}
});
} else {
alert("浏览器不支持");
}*/