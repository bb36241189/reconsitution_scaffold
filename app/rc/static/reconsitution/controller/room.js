/**
 * Created by Horn on 2016/1/13.
 */

app.controller("roomController",function($scope,$http,$log,SAlert){
    $log.info('in roomController');
    $scope.exec = function (funcname) {
        var theArguments = Array.prototype.splice.call(arguments,1,arguments.length);
        eval(funcname+'('+theArguments.join(',')+')');
        //this[funcname].apply(window,theArguments);
    };
    $(function(){
    set_navigator();
});

function set_navigator() {
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
    }
    $(".navbar-words").html("基础设施 > 机房管理");
}

// 路径配置
var province_cities = [
    {province:"上海",city:["上海"]},
    {province:"广东",city:["韶关","肇庆","聊城","珠海","清远","深圳","东莞","中山","佛山","广州","惠州","汕头","江门","河源"]},
    {province:"山东",city:["青岛","菏泽","莱芜","烟台","潍坊","滨州","淄博","济宁","东营","临沂","威海","德州","日照","枣庄","泰安","济南"]},
    {province:"山西",city:["临汾","大同","太原","长治","阳泉"]},
    {province:"辽宁",city:["葫芦岛","营口","盘锦","丹东","大连","沈阳"]},
    {province:"浙江",city:["金华","衢州","舟山","绍兴","湖州","温州","丽水","台州","嘉兴","宁波","杭州"]},
    {province:"新疆",city:["乌鲁木齐"]},
    {province:"河北",city:["邯郸","邢台","衡水","秦皇岛","石家庄","保定","唐山","廊坊","张家口","承德","沧州"]},
    {province:"甘肃",city:["兰州"]},
    {province:"北京",city:["北京"]},
    {province:"广西",city:["北海","南宁","柳州"]},
    {province:"江苏",city:["镇江","连云港","苏州","盐城","淮安","南京","南通","宿迁","常州","徐州","扬州","无锡","泰州"]},
    {province:"江西",city:["南昌"]},
    {province:"福建",city:["厦门","泉州","福州"]},
    {province:"安徽",city:["合肥"]},
    {province:"陕西",city:["铜川","西安","渭南","咸阳","宝鸡","延安"]},
    {province:"天津",city:["天津"]},
    {province:"四川",city:["成都",""]},
    {province:"西藏",city:["拉萨"]},
    {province:"云南",city:["昆明"]},
    {province:"湖南",city:["株洲","湘潭","长沙"]},
    {province:"湖北",city:["武汉"]},
    {province:"海南",city:["海口"]},
    {province:"云南",city:["玉溪"]},
    {province:"青海",city:["西宁"]},
    {province:"贵州",city:["贵阳"]},
    {province:"河南",city:["郑州"]},
    {province:"重庆",city:["重庆"]},
    {province:"宁夏",city:["银川"]},
    {province:"吉林",city:["长春"]},
    {province:"内蒙古",city:["包头","呼和浩特","鄂尔多斯"]},
    {province:"黑龙江",city:["哈尔滨"]}
];

function initProvince(){
    var cities = province_cities;
    $("#create_province").append("<option value=''>-请选择-</option>");
    $("#edit_province").append("<option value=''>-请选择-</option>");
    for(var i=0;i<cities.length;i++){
        $("#create_province").append("<option>" + cities[i].province + "</option>");
        $("#edit_province").append("<option>" + cities[i].province + "</option>");
    }
    $("#create_province").change(function(){
        $("#create_position option").remove();
        if($("#create_province").val()!="") {
            var target_city = cities.filter(function(item){
                return item.province===$("#create_province").val();
            });
            if(target_city.length>0) {
                target_city[0].city.forEach(function(item){
                    $("#create_position").append("<option>" + item + "</option>");
                });
            }
        }
        else{
            $("#create_position").append("<option value=''></option>")
        }
    });
    $("#edit_province").change(function(){
        $("#edit_position option").remove();
        if($("#edit_province").val()!="") {
            var target_city = cities.filter(function(item){
                return item.province===$("#edit_province").val();
            });
            if(target_city.length>0) {
                target_city[0].city.forEach(function(item){
                    $("#edit_position").append("<option>" + item + "</option>");
                });
            }
        }
        else{
            $("#edit_position").append("<option value=''></option>")
        }
    });
}

function setCity(city){
    $("#edit_position option").remove();
    if(city!=""){
        var target_province = province_cities.filter(function(item){
            var p = item.city.filter(function(c){return c===city});
            if(p.length>0){return true};
        });
        if(target_province.length>0){
            $("#edit_province").val(target_province[0].province);
            var target_city = province_cities.filter(function(item){
                return item.province===$("#edit_province").val();
            });
            if(target_city.length>0) {
                target_city[0].city.forEach(function(item){
                    $("#edit_position").append("<option>" + item + "</option>");
                });
                $("#edit_position").val(city);
            }
        }
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

function init_room_table() {
    $.ajax({
        type: "GET",
        url:project_url +  "/infrastructure/rooms",
        async: true,
        dataType: "json",
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        success: function (data) {
                //console.log(data);
                //var room_data = JSON.parse(data);
                //var result = wrapper();
                //result(room_data);
                perform_index(data);
        },
        error: function (e) {
            SAlert.showError(e)
        }
    });
};

function create_room(){
    $("#submit_create_room").click(function () {
        var room_form =  getFormObject("#create_room_form");
        if(!submitValidation("create_room_form")){
            return;
        }

        //delete room_form.width;
        //delete room_form.length;
        delete room_form.province;
        room_form.manager="admin";
        //delete room_form.height;
        //console.log(room_form);
        $.ajax({
				type:"POST",
				url:project_url + "/infrastructure/rooms",
				data: JSON.stringify(room_form),
                //dataType: "json",
                headers: {
                    'Content-Type': 'application/json',
                     "RC-Token": $.cookie("token_id")
                },
				success:function(msg){
                    //console.log("success");
					$("#create_room_modal").modal('hide');
					init_room_table();

				},
				error:function(e){
                    $("#create_room_modal").modal("hide");
                    SAlert.showError(e);
				}
			});

        $("#submit_create_room").addClass("disabled_button");
        $("#submit_create_room").removeClass("form_general_button");
        $("#submit_create_room").attr("disabled", "disabled");

    });
}

function click_create_room(){
    $("#btn_room_create").click(function(){
        $("#submit_create_room").addClass("form_general_button");
        $("#submit_create_room").removeClass("disabled_button");
        $("#submit_create_room").removeAttr("disabled");
    });
}

function delete_room(){
    $("#submit_delete_room").click(function () {
        var room = selected_legend_id;
        //console.log(room);
        $.ajax({
            type:"DELETE",
            url:project_url + "/infrastructure/rooms/"+room,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                location.reload();
            },
            error:function(e){
                $("#delete_room_modal").modal("hide");
                SAlert.showError(e);
            }
        });

        $("#submit_delete_room").addClass("disabled_button");
        $("#submit_delete_room").removeClass("form_danger_button");
        $("#submit_delete_room").attr("disabled", "disabled");
    })
}

function click_delete_room(){
    $("#btn_room_delete").click(function(){
        $("#submit_delete_room").addClass("form_danger_button");
        $("#submit_delete_room").removeClass("disabled_button");
        $("#submit_delete_room").removeAttr("disabled");
    });
}

function get_room_info(room_id){
    room_id = selected_legend_id;
    $.ajax({
        type: "GET",
        url: project_url + "/infrastructure/rooms/"+room_id,
        async: true,
        headers: {
            "RC-Token": $.cookie("token_id")
        },
        dataType: "json",
        success: function(data){
            init_room_edit_form(data);
            $("#edit_room_modal").modal("show");
        },
        error: function(e){
            SAlert.showError(e);
        }

    });
}

function init_room_edit_form(room_data) {
    $("#edit_room_form input[name='name']").val(room_data.name);
    //加入原信息，校验时用
    $("#edit_room_form input[name='name']").attr("ori",room_data.name);
    //$("#edit_room_form input[name='position']").val(room_data.position);
    setCity(room_data.position);
    //$("#edit_room_form input[name='length']").val(room_data.length);
    //$("#edit_room_form input[name='width']").val(room_data.width);
    //$("#edit_room_form input[name='height']").val(room_data.height);
    $("#edit_room_form textarea[name='description']").val(room_data.description);

    //$("#edit_room_form select[name='manager']").empty();
    //console.log(managers);
    for(var i=0,l=managers.length;i<l;i++){
            var manager_option = $("<option></option>");
            manager_option.attr("value",managers[i].manager_value);
            manager_option.text(managers[i].manager_name);
            if(managers[i].manager_value == room_data.manager){
                manager_option.attr("selected","selected");
            }
            //console.log(authority_option);
            $("#edit_room_form select[name='manager']").append(manager_option);
    }
}

function update_room(){
    $("#submit_edit_room").click(function (){
        var room = selected_legend_id;
        var room_data = getFormObject("#edit_room_form");
        if(!submitValidation("edit_room_form")){
            return;
        }
        room_data.id = room;
        //console.log(room_data);
        $.ajax({
            type:"PUT",
            url:project_url + "/infrastructure/rooms",
            data: JSON.stringify(room_data),
                //dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            success:function(msg){
                //console.log("success");
                //$("#edit_room_modal").modal('hide');
                location.reload();
            },
            error:function(e){
                $("#edit_room_modal").modal('hide');
                SAlert.showError(e)
            }
        });

        $("#submit_edit_room").addClass("disabled_button");
        $("#submit_edit_room").removeClass("form_general_button");
        $("#submit_edit_room").attr("disabled", "disabled");
    })
}

function click_edit_room(){
    $("#btn_room_edit").click(function(){
        $("#submit_edit_room").addClass("form_general_button");
        $("#submit_edit_room").removeClass("disabled_button");
        $("#submit_edit_room").removeAttr("disabled");
    });
}

function perform_index(room_data) {
        var geoCoordMap = {
                '上海': [121.4648,31.2891],
                '东莞': [113.8953,22.901],
                '东营': [118.7073,37.5513],
                '中山': [113.4229,22.478],
                '临汾': [111.4783,36.1615],
                '临沂': [118.3118,35.2936],
                '丹东': [124.541,40.4242],
                '丽水': [119.5642,28.1854],
                '乌鲁木齐': [87.9236,43.5883],
                '佛山': [112.8955,23.1097],
                '保定': [115.0488,39.0948],
                '兰州': [103.5901,36.3043],
                '包头': [110.3467,41.4899],
                '北京': [116.4551,40.2539],
                '北海': [109.314,21.6211],
                '南京': [118.8062,31.9208],
                '南宁': [108.479,23.1152],
                '南昌': [116.0046,28.6633],
                '南通': [121.1023,32.1625],
                '厦门': [118.1689,24.6478],
                '台州': [121.1353,28.6688],
                '合肥': [117.29,32.0581],
                '呼和浩特': [111.4124,40.4901],
                '咸阳': [108.4131,34.8706],
                '哈尔滨': [127.9688,45.368],
                '唐山': [118.4766,39.6826],
                '嘉兴': [120.9155,30.6354],
                '大同': [113.7854,39.8035],
                '大连': [122.2229,39.4409],
                '天津': [117.4219,39.4189],
                '太原': [112.3352,37.9413],
                '威海': [121.9482,37.1393],
                '宁波': [121.5967,29.6466],
                '宝鸡': [107.1826,34.3433],
                '宿迁': [118.5535,33.7775],
                '常州': [119.4543,31.5582],
                '广州': [113.5107,23.2196],
                '廊坊': [116.521,39.0509],
                '延安': [109.1052,36.4252],
                '张家口': [115.1477,40.8527],
                '徐州': [117.5208,34.3268],
                '德州': [116.6858,37.2107],
                '惠州': [114.6204,23.1647],
                '成都': [103.9526,30.7617],
                '扬州': [119.4653,32.8162],
                '承德': [117.5757,41.4075],
                '拉萨': [91.1865,30.1465],
                '无锡': [120.3442,31.5527],
                '日照': [119.2786,35.5023],
                '昆明': [102.9199,25.4663],
                '杭州': [119.5313,29.8773],
                '枣庄': [117.323,34.8926],
                '柳州': [109.3799,24.9774],
                '株洲': [113.5327,27.0319],
                '武汉': [114.3896,30.6628],
                '汕头': [117.1692,23.3405],
                '江门': [112.6318,22.1484],
                '沈阳': [123.1238,42.1216],
                '沧州': [116.8286,38.2104],
                '河源': [114.917,23.9722],
                '泉州': [118.3228,25.1147],
                '泰安': [117.0264,36.0516],
                '泰州': [120.0586,32.5525],
                '济南': [117.1582,36.8701],
                '济宁': [116.8286,35.3375],
                '海口': [110.3893,19.8516],
                '淄博': [118.0371,36.6064],
                '淮安': [118.927,33.4039],
                '深圳': [114.5435,22.5439],
                '清远': [112.9175,24.3292],
                '温州': [120.498,27.8119],
                '渭南': [109.7864,35.0299],
                '湖州': [119.8608,30.7782],
                '湘潭': [112.5439,27.7075],
                '滨州': [117.8174,37.4963],
                '潍坊': [119.0918,36.524],
                '烟台': [120.7397,37.5128],
                '玉溪': [101.9312,23.8898],
                '珠海': [113.7305,22.1155],
                '盐城': [120.2234,33.5577],
                '盘锦': [121.9482,41.0449],
                '石家庄': [114.4995,38.1006],
                '福州': [119.4543,25.9222],
                '秦皇岛': [119.2126,40.0232],
                '绍兴': [120.564,29.7565],
                '聊城': [115.9167,36.4032],
                '肇庆': [112.1265,23.5822],
                '舟山': [122.2559,30.2234],
                '苏州': [120.6519,31.3989],
                '莱芜': [117.6526,36.2714],
                '菏泽': [115.6201,35.2057],
                '营口': [122.4316,40.4297],
                '葫芦岛': [120.1575,40.578],
                '衡水': [115.8838,37.7161],
                '衢州': [118.6853,28.8666],
                '西宁': [101.4038,36.8207],
                '西安': [109.1162,34.2004],
                '贵阳': [106.6992,26.7682],
                '连云港': [119.1248,34.552],
                '邢台': [114.8071,37.2821],
                '邯郸': [114.4775,36.535],
                '郑州': [113.4668,34.6234],
                '鄂尔多斯': [108.9734,39.2487],
                '重庆': [107.7539,30.1904],
                '金华': [120.0037,29.1028],
                '铜川': [109.0393,35.1947],
                '银川': [106.3586,38.1775],
                '镇江': [119.4763,31.9702],
                '长春': [125.8154,44.2584],
                '长沙': [113.0823,28.2568],
                '长治': [112.8625,36.4746],
                '阳泉': [113.4778,38.0951],
                '青岛': [120.4651,36.3373],
                '韶关': [113.7964,24.7028]
            };
        var color = ['#000099','#009900','#990099','#990000','#FF6600','#009999'];
        //准备全国的数据
        var legend_data = ['全国'];
        var legend_selected = {};
        var all_line = [];
        var all_point = [];
        var series = [];
        //排除空名情况
        for(var i=0;i<room_data.length;i++){
            if(room_data[i].name == ""){
                room_data[i].name = room_data[i].id;
            }
            var single_point = {};
            single_point.name = room_data[i].name;
            single_point.id = room_data[i].id;
            single_point.description = room_data[i].description;
            single_point.value =geoCoordMap[room_data[i].position];
            single_point._name = room_data[i].name;
            single_point.position = room_data[i].position;
            all_point.push(single_point);
        }


        for(var i=0;i<room_data.length;i++){
            legend_selected[room_data[i].name] = false;
            for(var j=0;j<room_data.length;j++){
                if(i!=j){
                    var single_data = [];
                    var _from = {};
                    _from.name = room_data[i].position;
                    var _to = {};
                    _to.name = room_data[j].position;
                    _to.value =0;
                    single_data.push(_from);
                    single_data.push(_to);
                    all_line.push(single_data);
                }
            }
        }

        var serie = {};
            serie.name = '全国';
            serie.type = 'effectScatter';
            serie.coordinateSystem='geo';
            serie.zlevel=2;
            serie.rippleEffect={brushType: 'stroke'};
            serie.label={normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }};
            serie.itemStyle={
                        normal: {
                            color: color[0]
                        }
                    };
            serie.data=all_point;

            series.push(serie);

        //console.log(JSON.stringify(all_line));
        //准备各个地区的数据

        for(var i=0;i<room_data.length;i++){
            legend_data.push(room_data[i].name);
            var line_data=[];
            var point_data=[];
            var _from = {};
            _from.name = room_data[i].position;

            var single_point = {};
            single_point.name = room_data[i].position;

            single_point.value=geoCoordMap[room_data[i].position];
            single_point.id = room_data[i].id;
            single_point.description = room_data[i].description;
            single_point._name = room_data[i].name;
            single_point.position = room_data[i].position;
            point_data.push(single_point);

            for(var j=0;j<room_data.length;j++){
               if(i!=j){
                   var _to = {};
                   _to.name = room_data[j].position;
                   _to.value = 30 + i*20;
                   var single_line = [];
                   single_line.push(_from);
                   single_line.push(_to);
                   line_data.push(single_line);

               }
            }
            var serie = {};
            serie.name = room_data[i].name;
            serie.type = 'effectScatter';
            serie.coordinateSystem='geo';
            serie.zlevel=2;
            serie.rippleEffect={brushType: 'stroke'};
            serie.label={normal: {
                            show: true,
                            position: 'right',
                            formatter: '{a}'
                        }};
            serie.itemStyle={
                        normal: {
                            color: color[(i+1)%6]
                        }
                    };
            serie.data=point_data;
            series.push(serie);
        }
            //function (echarts, BMapExtension) {
            $(function () {
                // 地图自定义样式


                var mapChart = echarts.init(document.getElementById('mapChart'));


                map_option = {
                    backgroundColor: '#ffffff',
                    title : {
                        text: '全国各数据中心地理位置',
                        subtext: '',
                        left: 'center',
                        textStyle : {
                            color: '#000000'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        triggerOn:'mouseover',
                        formatter: function (v) {
                            if(v.data["_name"]){
                                return ("<a style='color:white;' href='" + project_url + "/app/cabinet?id=" + v.data["id"] + "'><span>" + v.data["_name"] + "</span></a><br/>位置：" + v.data["position"] + "<br/>描述：" + v.data["description"] + "");
                            }
                            else{
                                return (v[1]);
                            }

                        }
                    },
                    legend: {
                        orient: 'vertical',
                        top: 'top',
                        left: 'left',
                        data:legend_data,
                        textStyle: {
                            color: '#000000'
                        },
                        selectedMode: 'single'
                    },
                    geo: {
                        map: 'china',
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: '#F5F5F5',
                                borderColor: '#A0AaB9'
                            },
                            emphasis: {
                                areaColor: '#B5B5B5'
                            }
                        }
                    },
                    series: series
                };
                mapChart.setOption(map_option);
                mapChart.on("legendselectchanged",function(param){
                    //console.log("selected");
                    var selected = param.selected;
                    selected_legend_id = "";
                    for(var p in selected){
                        if(selected[p]) {
                            for(var j=0;j<room_data.length;j++){
                                if(room_data[j].name==p){
                                    selected_legend_id = (room_data[j].id);
                                    break;
                                }
                            }
                        }
                    }
                    if(selected_legend_id!=""){
                        recover_button();
                    }
                    else{
                        disabled_button();
                    }

                });

                mapChart.on("click", function(param){
                    console.log(param.data.id);
                    if(param.data){
                        if(param.data.id){
                            window.location.href = project_url + "/app/cabinet?id=" + param.data.id;
                        }
                    }
                });

            }
        );

        /*
        $(function(){
            $(".map_tool_bar").children("button").click(function(){
                if($(this).hasClass("btn_info")){
                    $(this).addClass("btn-info")
                }else if($(this).hasClass("btn_danger")){
                    $(this).addClass("btn-danger")
                }
                $(this).siblings().removeClass("btn-danger").removeClass("btn-info")
            })
        })
        */

    }

var selected_legend_id = "";
var managers = [{manager_value:"admin",manager_name:"admin"},{manager_value:"admin",manager_name:"admin"}];


$(function () {

    disabled_button();
    init_room_table();
    create_room();
    delete_room();
    update_room();
    initProvince();

    click_create_room();
    click_delete_room();
    click_edit_room();
} );


function disabled_button(){
    $('#btn_room_delete').attr('disabled',"disabled");
    $("#btn_room_delete").addClass("disabled_button");
    $("#btn_room_delete").removeClass("danger_button");

    $('#btn_room_edit').attr('disabled',"disabled");
    $("#btn_room_edit").addClass("disabled_button");
    $("#btn_room_edit").removeClass("general_button");
}

function recover_button(){
    $('#btn_room_delete').removeAttr('disabled');
    $('#btn_room_delete').addClass("danger_button");
    $("#btn_room_delete").removeClass("disabled_button");

    $('#btn_room_edit').removeAttr('disabled');
    $('#btn_room_edit').addClass("general_button");
    $("#btn_room_edit").removeClass("disabled_button");
}
});


