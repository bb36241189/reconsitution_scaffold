//var app = angular.module("myApp",[]);
//app.config(["$interpolateProvider",function($interpolateProvider){
//    $interpolateProvider.startSymbol('myApp//');
//    $interpolateProvider.endSymbol('//');
//}]);

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

app.controller("resourceDashboardCtl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.get_hypervisor_info = function(){
        $http({
            method:"GET",
            url:project_url + "/os-hypervisors/statistics",
            token : true,
            errorAlert : true,
            title : '统计信息'
        }).success(function(e){
            $scope.set_progressbar(e.hypervisor_statistics);
        }).error(function(e){
            SAlert.showError(e);
        });
    };

    $scope.get_storage_info = function(){
        $http({
            method:"GET",
            url:project_url + "/storage_pool_info?type=capacity",
            token : true,
            errorAlert : true,
            title : '获取存储池信息'
        }).success(function(data){
            var total_storage = (data.capacity.capacity_bytes) / 1024 / 1024 / 1024  //GB
            var used_storage = (data.capacity.used_bytes) / 1024 / 1024 / 1024
            var _data = {};
            if (total_storage >= 1024) {
                _data.unit = "TB";
                _data.used_storage = (used_storage / 1024).toFixed(1);
                _data.free_storage = ((total_storage - used_storage) / 1024).toFixed(1);
                $scope.set_progressbar(_data);
            } else {
                _data.unit = "GB";
                _data.used_storage = used_storage;
                _data.free_storage = total_storage - used_storage;
                $scope.set_progressbar(_data);
            }
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.set_progressbar = function(data){
        if(!data.unit) {
            var total_cpu, used_cpu, total_ram, used_ram;
            used_cpu = data.vcpus_used;
            total_cpu = data.vcpus;
            var cpu_rate = ((used_cpu / total_cpu) * 100).toFixed(0);
            var cpu_rate_fake = cpu_rate>100?100:cpu_rate;
            total_ram = (data.memory_mb / 1024).toFixed(2);
            used_ram = (data.memory_mb_used / 1024).toFixed(2);
            var ram_rate = ((used_ram / total_ram) * 100).toFixed(0);
            var ram_rate_fake = ram_rate>100?100:ram_rate;
            $scope.cpu_usage = used_cpu + "核 / " + total_cpu + "核";
            $scope.cpu_rate = cpu_rate_fake + "%";

            $scope.mem_usage =  used_ram + "GB / " + total_ram + "GB";
            $scope.mem_rate = ram_rate_fake + "%";
        }
        else{




            data.used_storage = parseFloat(data.used_storage);
            data.free_storage = parseFloat(data.free_storage);
            var total =  (data.used_storage + data.free_storage).toFixed(2);
            var rate = ((data.used_storage / total) * 100).toFixed(0);
            var rate_fake = rate>100?100:rate;

            $scope.disk_usage = data.used_storage + data.unit + " / " + total + data.unit;
            $scope.disk_rate = rate_fake + "%";
        }
    };

    $scope.cpu_usage="--/--";
    $scope.cpu_rate = "0%";
    $scope.mem_usage="--/--";
    $scope.mem_rate = "0%";
    $scope.disk_usage="--/--";
    $scope.disk_rate = "0%";
    $scope.net_usage="--/--";
    $scope.net_rate = "0%";

    $scope.get_hypervisor_info();
    $scope.get_storage_info();

});

app.controller("resourceChartCtl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.getResourceHistory=function(){
        $http({
            method:"GET",
            url:project_url + "/os-hypervisors/histories?days=7",
            token : true,
            title : '获取历史',
            errorAlert : true
        }).success(function(e){
            $scope.drawResourceChart(e.hypervisor_histories);
        }).error(function(e){
            SAlert.showError(e);
            $("#delete_volumeType_modal").modal("hide");
        });
    }


    $scope.drawResourceChart = function(data){
        var timelist = [];
        var cpulist = [];
        var memlist = [];
        var disklist = [];
        data = data.reverse();
        var trans1 = {'CPU':'vcpus_used','内存':'memory_mb_used','存储':'disk_gb_used'};
        var trans2 = {'CPU':'vcpus','内存':'memory_mb','存储':'disk_gb'};
        var trans3 = {'CPU':'核','内存':'GB','存储':'GB'};
        for(var i=0;i<data.length;i++){
            timelist.push(data[i].timestamp.substring(5,13));
            cpulist.push(data[i].vcpus_used/data[i].vcpus*100);
            memlist.push(data[i].memory_mb_used/data[i].memory_mb*100);
            disklist.push(data[i].disk_gb_used/data[i].disk_gb*100);
            data[i].memory_mb_used = (data[i].memory_mb_used/1024).toFixed(2);
            data[i].memory_mb = (data[i].memory_mb/1024).toFixed(2);
        }

        var line_option  = {
            tooltip: {
                trigger: 'axis',
                formatter:function(p){
                    var str = data[p[0].dataIndex].timestamp + "<br/>";
                    for(var i=0;i< p.length;i++){
                        str += p[i].seriesName + ": " + data[p[i].dataIndex][trans1[p[i].seriesName]] + trans3[p[i].seriesName] + "/" + data[p[i].dataIndex][trans2[p[i].seriesName]] + trans3[p[i].seriesName] + "<br/>";
                    }
                    return str;
                }
            },
            legend: {
                data:['CPU','内存','存储','网络'],
                top:0,
                selected:{
                    'CPU':true,
                    '内存':true,
                    '存储':true
                }
            },
            smooth:true,
            grid: {

            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: timelist,
                splitLine:{
                    show:false
                }
            },
            yAxis: {
                type: 'value',
                splitLine:{
                    show:false
                }
            },
            series: [
                {
                    name:'CPU',
                    type:'line',
                    data:cpulist,
                    showSymbol:false,
                    itemStyle:{
                        normal:
                        {
                            color:"#188ae2",
                            width:4
                        }
                    },
                    lineStyle:{
                        normal:{
                            width:4
                        }
                    }
                },
                {
                    name:'内存',
                    type:'line',
                    data:memlist,
                    showSymbol:false,
                    itemStyle:{
                        normal:
                        {
                            color:"#ff5b5b",
                            width:4
                        }
                    },
                    lineStyle:{
                        normal:{
                            width:4
                        }
                    }
                },
                {
                    name:'存储',
                    type:'line',
                    data:disklist,
                    showSymbol:false,
                    itemStyle:{
                        normal:
                        {
                            color:"#5b69bc",
                            width:4
                        }
                    },
                    lineStyle:{
                        normal:{
                            width:4
                        }
                    }
                }
            ]
        };

        var lineChart = echarts.init(document.getElementById('line_chart'));
        lineChart.setOption(line_option);
        window.onresize = lineChart.resize;
    }
    $scope.getResourceHistory();
});

app.controller("serverCtl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.get_server_info = function(){
        $http({
            method:"GET",
            url:project_url + "/servers/summary",
            token : true,
            title : '获取摘要',
            errorAlert : true
        }).success(function(e){
            $scope.data = e;
            $scope.render_server_info(e,"total");
        });
    }

    $scope.render_server_info = function(data,type){
        switch(type){
            case "total":
                $scope.server_count = data.server_total_count;
                $scope.active_count = data.kvm_server_active_count + data.esxi_server_active_count;
                $scope.close_count = data.kvm_server_stopped_count + data.esxi_server_stopped_count;
                $scope.error_count = data.kvm_server_error_count + data.esxi_server_error_count;
                break;
            case "kvm":
                $scope.server_count = data.kvm_server_total_count;
                $scope.active_count = data.kvm_server_active_count;
                $scope.close_count = data.kvm_server_stopped_count;
                $scope.error_count = data.kvm_server_error_count;
                break;
            case "exsi":
                $scope.server_count = data.esxi_server_total_count;
                $scope.active_count = data.esxi_server_active_count;
                $scope.close_count = data.esxi_server_stopped_count;
                $scope.error_count = data.esxi_server_error_count;
                break;
        }
        $scope.render_server_chart();
    }

    $scope.render_server_chart = function(){
        var test_server_option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                data: ['正常', '关机', '错误'],
                orient: 'vertical',
                x: '37',
                y: '37',
                itemHeight:10
            },
            series: [
                {
                    name:'虚拟机状态',
                    type:'pie',
                    radius: ['83%', '90%'],
                    avoidLabelOverlap: true,
                    hoverAnimation:false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        }
                    },
                    itemStyle:{
                        normal: {
                            color: function(params) {
                                // build a color map as your need.
                                var colorList = [
                                    '#188ae2','#D1E8F9','#eaeaea'
                                ];
                                return colorList[params.dataIndex]
                            },
                            label: {
                                formatter:'{b}:  {c}'
                            }
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {
                            name:"正常",
                            value:$scope.active_count
                        },
                        {
                            name:"关机",
                            value:$scope.close_count
                        }
                        ,
                        {
                            name:"错误",
                            value:$scope.error_count
                        }
                    ]
                }
            ]
        };
        var serverChart = echarts.init(document.getElementById('server_chart'));
        serverChart.setOption(test_server_option);
        window.onresize = serverChart.resize;
    }

    $scope.changeType = function(type,text){
        $scope.show_text = text;
        $scope.show_type = type;
        $scope.render_server_info($scope.data,type);
    }

    $scope.renderSystemInfo = function(){
        var data = $scope.data;
        var linux_servers = 0;
        var win_servers = 0;
        var other_servers = 0;
        var data_types = [];
        var datas = [];
        linux_servers = data.linux_server_count;
        win_servers = data.windows_server_count;
        other_servers = data.unknown_os_server_count;
        if (linux_servers)
        {
            data_types.push("Linux");
            datas.push({value: linux_servers, name: 'Linux'});
        }
        if (win_servers)
        {
            data_types.push("Windows");
            datas.push({value: win_servers, name: 'Windows'});
        }
        if (other_servers)
        {
            data_types.push("Other");
            datas.push({value: other_servers, name: 'Other'});
        }

        var y = 37;
        switch(data_types.length){
            case 1:
                y = 60;
                break;
            case 2:
                y = 48;
                break;
            case 3:
                y = 37;
                break;
        }

        var system_option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                data: data_types,
                orient: 'vertical',
                x: '37',
                y: y,
                itemHeight:10
            },
            series: [
                {
                    name:'虚拟机状态',
                    type:'pie',
                    radius: ['83%', '90%'],
                    avoidLabelOverlap: true,
                    hoverAnimation:false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        }
                    },
                    itemStyle:{
                        normal: {
                            color: function(params) {
                                // build a color map as your need.
                                var colorList = [
                                    '#188ae2','#D1E8F9','#eaeaea'
                                ];
                                return colorList[params.dataIndex]
                            },
                            label: {
                                formatter:'{b}:  {c}'
                            }
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:datas
                }
            ]
        };
        var serverChart = echarts.init(document.getElementById('server_chart'));
        serverChart.setOption(system_option);
        window.onresize = serverChart.resize;

        $scope.show_text = "虚拟机操作系统";
        $scope.server_count = data.server_total_count;
        $scope.active_count = data.kvm_server_active_count + data.esxi_server_active_count;
        $scope.close_count = data.kvm_server_stopped_count + data.esxi_server_stopped_count;
        $scope.error_count = data.kvm_server_error_count + data.esxi_server_error_count;

    }

    $scope.show_type = "total";
    $scope.show_text = "虚拟机";
    $scope.server_count = 0;
    $scope.active_count = 0;
    $scope.close_count = 0;
    $scope.error_count = 0;
    $scope.get_server_info();
});

app.controller("alarmCtl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.getStorageAlert = function(){
        $http({
            method:"GET",
            url:project_url +  "/storage_alarm_total",
            token : true,
            title : '获取存储警告信息',
            errorAlert : true
        }).success(function(data){
            $scope.storage = {};
            $scope.storage.disaster = data.warning;
            $scope.storage.high = data.critical;
            $scope.storage.average = data.info;
            $scope.storage.sum = $scope.storage.disaster + $scope.storage.high + $scope.storage.average;

            $scope.total.disaster += $scope.storage.disaster;
            $scope.total.high += $scope.storage.high;
            $scope.total.average += $scope.storage.average;
            $scope.total.sum += $scope.storage.sum;
            $scope.render_alert_info("total");
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.getServerAlert = function(){
        $http({
            method:"GET",
            url:project_url +  "/event_number?type=vm",
            token : true,
            title : '获取事件数',
            errorAlert : true
        }).success(function(data){
            $scope.server = {};
            $scope.server.disaster = data.disaster_number;
            $scope.server.high = data.warning_number;
            $scope.server.average = data.info_number;
            $scope.server.sum = $scope.server.disaster + $scope.server.high + $scope.server.average;

            $scope.total.disaster += $scope.server.disaster;
            $scope.total.high += $scope.server.high;
            $scope.total.average += $scope.server.average;
            $scope.total.sum += $scope.server.sum;
            $scope.render_alert_info("total");
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.init_host_info = function(){
        $http({
            method:"GET",
            url:project_url +  "/event_number",
            token : true,
            errorAlert : true,
            title : '获取事件数目'
        }).success(function(data){
            $scope.host = {};
            $scope.host.disaster = data.disaster_number;
            $scope.host.high = data.warning_number;
            $scope.host.average = data.info_number;
            $scope.host.sum = $scope.host.disaster + $scope.host.high + $scope.host.average;

            $scope.total.disaster += $scope.host.disaster;
            $scope.total.high += $scope.host.high;
            $scope.total.average += $scope.host.average;
            $scope.total.sum += $scope.host.sum;
            $scope.render_alert_info("total");
        }).error(function(e){
            SAlert.showError(e);
        });
    }



    $scope.changeType = function(type,text,tab){
        $scope.show_text = text;
        $scope.show_type = type;
        $scope.tab = tab;
        $scope.render_alert_info(type);
    }

    $scope.tab=1;
    $scope.render_alert_info = function(type){
        $scope.sum = $scope[type]["sum"];
        $scope.disaster = $scope[type]["disaster"];
        $scope.high = $scope[type]["high"];
        $scope.average = $scope[type]["average"];
        $scope.render_alert_chart();
    }

    $scope.render_alert_chart = function(){
        var alarm_option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    data: ['灾难', '严重','一般'],
                    orient: 'vertical',
                    x: '37',
                    y: '37'
                },
                series: [
                    {
                        name:'告警',
                        type:'pie',
                        radius: ['83%', '90%'],
                        avoidLabelOverlap: true,
                        hoverAnimation:false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            }
                        },
                        itemStyle:{
                            normal: {
                                color: function(params) {
                                    // build a color map as your need.
                                    var colorList = [
                                        '#ff5b5b','#FFDEDE','#eaeaea',
                                      '#188ae2','#10c469','#ff8acc',"#f9c851",
                                        '#9bca64','#ff8463','#337ab7','#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
                                       '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                                       '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
                                    ];
                                    return colorList[params.dataIndex]
                                },
                                label: {
                                    formatter:'{b}:  {c}'
                                }
                            },
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:[
                            {
                                name:"灾难",
                                value:$scope.disaster
                            },
                            {
                                name:"严重",
                                value:$scope.high
                            },
                            {
                                name:"一般",
                                value:$scope.average
                            }
                        ]
                    }
                ]
            };

            var alarmChart = echarts.init(document.getElementById('alarm_chart'));
            alarmChart.setOption(alarm_option);
            window.onresize = alarmChart.resize;
    }

    $scope.total = {};
    $scope.total.disaster = 0;
    $scope.total.high = 0;
    $scope.total.average = 0;
    $scope.total.sum = 0;

    $scope.storage = {};
    $scope.storage.disaster = 0;
    $scope.storage.high = 0;
    $scope.storage.average = 0;
    $scope.storage.sum = 0;

    $scope.server = {};
    $scope.server.disaster = 0;
    $scope.server.high = 0;
    $scope.server.average = 0;
    $scope.server.sum = 0;

    $scope.host = {};
    $scope.host.disaster = 0;
    $scope.host.high = 0;
    $scope.host.average = 0;
    $scope.host.sum = 0;

    $scope.show_text="告警";

    $scope.getStorageAlert();
    $scope.getServerAlert();
    $scope.init_host_info();
});

app.controller("operationCtl",function($scope,$http,EventBus,SAlert,PermitStatus){
    $scope.getOperationList = function(){
        $http({
            method:"GET",
            url:project_url +  "/operation_log?limit=7",
            token : true,
            errorAlert : true,
            title : '获取操作日志'
        }).success(function(e){
            $scope.renderOperationList(e.operation_logs);
        }).error(function(e){
            SAlert.showError(e);
        });
    }

    $scope.renderOperationList = function(data){
        for(var i=0;i<data.length;i++){
            var _status = "";
            var _class = "";
            var _label = project_url + "/static/images/"
            if (data[i].is_success == "1") {
                _status = "成功";
                _label+="success-small.png";
                _class = "timeline-info";
            }
            else {
                _status = "失败";
                _label+="error-small.png";
                _class = "timeline-error";
            }

            var _href = "";
            var hasHref = false;
            if(data[i].resource_type=="虚拟机"&&data[i].action!="删除"){
                _href = "server/" + data[i].resource_id;
                hasHref = true;
            }
            data[i]._status = _status;
            data[i]._class = _class;
            data[i]._label = _label;
            data[i]._href = _href;
            data[i].hasHref = hasHref;
        }
        $scope.operation_list = data;
        packery();

    };

    $scope.getOperationList();
});

function packery(){
    var masonry = $('.mWelMasonry').packery({
        itemSelector: '.items'
    });

    masonry.find('.items').each(function (i, gridItem) {
        var draggie = new Draggabilly(gridItem, {handle: '.Tit'});
        masonry.packery('bindDraggabillyEvents', draggie);
    });
}




function set_navigator() {
    if ($("#main_resource").hasClass('active')) {
        var lis = $('#demo1').children("li");
        lis.each(function () {
            $(this).addClass('active');
            $(this).removeClass('dhbg');
        });
        //console.log("has");
        $("#main_resource").removeClass('active');
        $("#main_resource").addClass('dhbg');
        //console.log($('#demo1:not(this)').children("li"));
    }
    $(".navbar-words").html("仪表盘");
    //$("#main_resource .sub-menu").css("display", "block");
}

$(function(){
    set_navigator();
});




/*


function wrapper() {
    //console.warn("Enter wrapper!!!!!!")

    function main() {
        //console.warn("Echart ", echarts)
        $(function () {
            set_navigator();

            //clearTypeBody();

            init_server_info();

            set_usage_pie();

            init_host_info();

            init_server_alert();

            get_operation_list();

            getStorageAlert();
        });

        function clearTypeBody(){
            $("#type_tbody").html("");
        }

        function set_navigator() {
            if ($("#main_resource").hasClass('active')) {
                var lis = $('#demo1').children("li");
                lis.each(function () {
                    $(this).addClass('active');
                    $(this).removeClass('dhbg');
                })
                //console.log("has");
                $("#main_resource").removeClass('active');
                $("#main_resource").addClass('dhbg');
                //console.log($('#demo1:not(this)').children("li"));
            }
            $(".navbar-words").html("仪表盘");
            //$("#main_resource .sub-menu").css("display", "block");
        }

        function set_usage_pie() {

            var labelTop = {
                normal: {
                    color: '#ccc',
                    label: {
                        show: true,
                        position: 'center',
                        formatter: '{b}',
                        textStyle: {
                            baseline: 'bottom',
                            fontSize: 14,
                            color: '#0769AD'
                        }
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    color: '#ddd',
                    label: {
                        show: true,
                        position: 'center',
                        formatter: '{b}',
                        textStyle: {
                            baseline: 'bottom',
                            fontSize: 14,
                            color: '#0769AD'
                        }
                    },
                    labelLine: {
                        show: false
                    }
                }
            };

            var labelBottom = {
                normal: {
                    color: '#0769AD',
                    label: {
                        show: true,
                        position: 'center'
                    },
                    labelLine: {
                        show: false
                    }
                },
            };

            var systemlabel = {
                normal: {
                    labelLine: {
                        show: true
                    }
                }
            };

            var CPUlabelFromatter = {
                normal: {
                    label: {

                        formatter: function () {
                            //var total_num = Math.round(params.value / params.percent * 100);
                            //return (total_num - params.value) + '核 /' + total_num + "核";
                            return 'CPU使用情况';
                        },
                        textStyle: {
                            baseline: 'top',
                            fontSize: 12,
                            color: '#ccc'
                        }
                    }
                },
            };

            var RamlabelFromatter = {
                normal: {
                    label: {
                        formatter: function (params) {
                            //var total_num = Math.round(params.value / params.percent * 100);
                            //var display_total = Math.round(total_num/1024);
                            //var display_used = display_total - Math.round(params.value/1024);
                            // return display_used + 'G /' + display_total + "G";
                            //return '300G'+' / '+'600G'
                            return "内存使用情况"
                        },
                        textStyle: {
                            baseline: 'top',
                            fontSize: 12,
                            color: '#ccc'
                        }
                    }
                },
            };

            var StoragelabelFromatter = {
                normal: {
                    label: {
                        formatter: function (params) {
                            //var total_num = Math.round(params.value / params.percent * 100);
                            //var used = total_num - Math.round(params.value);
                            //return used + 'G /' + total_num + "G";
                            //return '400G'+' / ' + "500G"
                            return "存储使用情况"
                        },
                        textStyle: {
                            baseline: 'top',
                            fontSize: 12,
                            color: '#ccc'
                        }
                    }
                }
            };

            var radius = ['45%', '55%'];

            function get_data() {
                get_hypervisor_info();
                get_storage_info();
            }

            get_data();

            function get_hypervisor_info() {
                var path = project_url + "/os-hypervisors/statistics";
                $.ajax({
                    type: "GET",
                    url: path,
                    dataType: "json",
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success: function (data) {
                        //set_pie_option(data.hypervisor_statistics);
                        set_progressbar(data.hypervisor_statistics);
                    },
                    error: function (e) {
                        SAlert.showError(e);

                    }
                });
            }

            var usage_option = {
                title: {
                    text: '资源使用状况',
                    x: 'left',
                    textStyle: {
                        fontSize: 18,
                        fontFamily: '微软雅黑'
                    }
                },

                calculable: false,
                series: [
                    {
                        type:'pie',
                        hoverAnimation: false,
                        center: ['80%', '50%'],
                        radius: radius,
                        data: [
                            {value: 0, name: 0, itemStyle: labelTop},
                            {value: 1, name: '加载中...', itemStyle: labelBottom}
                        ]
                    },
                    {
                        type:'pie',
                        hoverAnimation: false,
                        center: ['20%', '50%'],
                        radius: radius,
                        data: [
                            {value: 0, name: 0, itemStyle: labelTop},
                            {value: 1, name: '加载中...', itemStyle: labelBottom}
                        ]
                    },
                    {
                        type:'pie',
                        hoverAnimation: false,
                        center: ['50%', '50%'],
                        radius: radius,
                        data: [
                            {value: 0, name: 0, itemStyle: labelTop},
                            {value: 1, name: '加载中...', itemStyle: labelBottom}
                        ]
                    }
                ]
            };

            function set_pie_option(data) {
                if(!data.unit) {
                    var total_cpu, used_cpu, total_ram, used_ram;
                    used_cpu = data.vcpus_used;
                    total_cpu = data.vcpus;
                    var cpu_rate = ((used_cpu / total_cpu) * 100).toFixed(2) + "%";
                    total_ram = (data.memory_mb / 1024).toFixed(2);
                    used_ram = (data.memory_mb_used / 1024).toFixed(2);
                    var ram_rate = ((used_ram / total_ram) * 100).toFixed(2) + "%";

                    var series1 = {
                        //name:'访问来源',
                        type: 'pie',
                        hoverAnimation: false,
                        center: ['20%', '50%'],
                        radius: radius,
                        //itemStyle: CPUlabelFromatter,
                        data: [
                            {
                                value: (total_cpu - used_cpu)<0?0:(total_cpu - used_cpu).toFixed(2),
                                name: cpu_rate + '\n' + used_cpu + '核' + ' / ' + total_cpu + '核',
                                itemStyle: labelTop
                            },
                            {value: used_cpu, name: 'CPU使用情况', itemStyle: labelBottom}
                        ]
                    };

                    var series2 = {
                        type: 'pie',
                        hoverAnimation: false,
                        center: ['50%', '50%'],
                        radius: radius,
                        //itemStyle: RamlabelFromatter,
                        data: [
                            {
                                value: (total_ram - used_ram)<0?0:(total_ram - used_ram),
                                name: ram_rate + '\n' + used_ram + 'G' + ' / ' + total_ram + 'G',
                                itemStyle: labelTop
                            },
                            {value: used_ram, name: '内存使用情况', itemStyle: labelBottom}
                        ]
                    };
                    usage_option.series[1] = series1;
                    usage_option.series[2] = series2;
                    //usage_option.series.push(series1);
                    //usage_option.series.push(series2);
                }
                else
                {
                    data.used_storage = parseFloat(data.used_storage);
                    data.free_storage = parseFloat(data.free_storage);
                    var total =  (data.used_storage + data.free_storage).toFixed(2);
                    var rate = ((data.used_storage / total) * 100).toFixed(2) + "%";

                    var series3 = {
                        type:'pie',
                        hoverAnimation: false,
                        center: ['80%', '50%'],
                        radius: radius,
                        data: [
                            {value: data.free_storage<0?0:data.free_storage, name: rate + '\n' + data.used_storage + data.unit + ' / ' + total + data.unit, itemStyle: labelTop},
                            {value: data.used_storage, name: '存储使用情况', itemStyle: labelBottom}
                        ]
                    };
                    usage_option.series[0] = series3;
                    //usage_option.series.push(series3);
                }
                var usageChart = echarts.getInstanceByDom(document.getElementById('usage_pie'));
                if(!usageChart){
                    usageChart = echarts.init(document.getElementById('usage_pie'));
                }
                usageChart.setOption(usage_option);

                window.onresize = usageChart.resize;
            }

            function set_progressbar(data){
                if(!data.unit) {
                    var total_cpu, used_cpu, total_ram, used_ram;
                    used_cpu = data.vcpus_used;
                    total_cpu = data.vcpus;
                    var cpu_rate = ((used_cpu / total_cpu) * 100).toFixed(0);
                    var cpu_rate_fake = cpu_rate>100?100:cpu_rate;
                    total_ram = (data.memory_mb / 1024).toFixed(2);
                    used_ram = (data.memory_mb_used / 1024).toFixed(2);
                    var ram_rate = ((used_ram / total_ram) * 100).toFixed(0);
                    var ram_rate_fake = ram_rate>100?100:ram_rate;
                    $("#cpu_p1").html(cpu_rate_fake + "% (" + used_cpu + "核 / " + total_cpu + "核" + ")");
                    $("#cpu_p2").css("width",cpu_rate_fake + "%");
                    $("#cpu_p3").html(cpu_rate_fake + "");

                    $("#mem_p1").html(ram_rate_fake + "% (" + used_ram + "GB / " + total_ram + "GB" + ")");
                    $("#mem_p2").css("width",ram_rate_fake + "%");
                    $("#mem_p3").html(ram_rate_fake + "");
                }
                else{
                    data.used_storage = parseFloat(data.used_storage);
                    data.free_storage = parseFloat(data.free_storage);
                    var total =  (data.used_storage + data.free_storage).toFixed(2);
                    var rate = ((data.used_storage / total) * 100).toFixed(0);
                    var rate_fake = rate>100?100:rate;
                    $("#disk_p1").html(rate + "% (" + data.used_storage + data.unit + " / " + total + data.unit + ")");
                    $("#disk_p2").css("width",rate_fake + "%");
                    $("#disk_p3").html(rate + "");
                }
            }

            function get_storage_info() {
            $.ajax({
                type: "GET",
                url: project_url + "/storage_pool_info?type=capacity",
                async: true,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_storage_info(data)
                },
                error: function (e) {
                    SAlert.showError(e);
                }
            });
        }

        function render_storage_info(data) {
            var total_storage = (data.capacity.capacity_bytes) / 1024 / 1024 / 1024  //GB
            var used_storage = (data.capacity.used_bytes) / 1024 / 1024 / 1024
            var _data = {};
            if (total_storage >= 1024) {
                _data.unit = "TB";
                _data.used_storage = (used_storage / 1024).toFixed(1);
                _data.free_storage = ((total_storage - used_storage) / 1024).toFixed(1);
                //set_pie_option(_data);
                set_progressbar(_data);
                //set_pie_option_storage((used_storage / 1024).toFixed(1), ((total_storage - used_storage) / 1024).toFixed(1), "T");
            } else {
                _data.unit = "GB";
                _data.used_storage = used_storage;
                _data.free_storage = total_storage - used_storage;
                //set_pie_option(data);
                set_progressbar(data);

                //set_pie_option_storage(used_storage, total_storage - used_storage, "GB");
            }
        }


        }

        function init_server_info() {
            $.ajax({
                type: "GET",
                url: project_url + "/servers/summary",
                async: true,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    if (data) {
                        //var room_data = JSON.parse(data);
                        render_server_info(data);
                        set_server_option(data);
                    }
                },
                error: function (e) {
                    //console.log("error");
                    if (e.status == 401) {
                        SAlert.showMessage("登录超时")
                        location.href = project_url + "/logout";
                    } else {
                        SAlert.showMessage("服务端出错")
                    }
                }
            });
        }

        function set_server_option(data) {
            var linux_servers = 0;
            var win_servers = 0;
            var other_servers = 0;
            var data_types = [];
            var datas = [];



            linux_servers = data.linux_server_count;
            win_servers = data.windows_server_count;
            other_servers = data.unknown_os_server_count;

            if (linux_servers) {
                data_types.push("Linux");
                datas.push({value: linux_servers, name: 'Linux'});
            }
            if (win_servers) {
                data_types.push("Windows");
                datas.push({value: win_servers, name: 'Windows'});
            }
            if (other_servers) {
                data_types.push("Other");
                datas.push({value: other_servers, name: 'Other'});
            }



            var system_option={
                title: {
                    x: 'center',
                    text: '',
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    x: 'right',
                    y: 'top',
                    data: data_types
                },
                calculable: false,
                grid: {
                    borderWidth: 0,
                    y: 80,
                    y2: 60
                },
                xAxis: [
                    {
                        type: 'category',
                        show: false,
                        data: data_types
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        show: false
                    }
                ],
                series: [
                    {
                        name: '虚拟机操作系统统计',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color: function(params) {
                                    // build a color map as your need.
                                    var colorList = [
                                      '#9bca64','#ff8463','#337ab7','#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
                                       '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                                       '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
                                    ];
                                    return colorList[params.dataIndex]
                                },
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: '{b}\n{c}'
                                }
                            }
                        },
                        data: datas
                    }
                ]
            };

            system_option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data:data_types
                },
                series: [
                    {
                        name:'虚拟机操作系统统计',
                        type:'pie',
                        radius: ['74%', '80%'],
                        avoidLabelOverlap: true,
                        label: {
                            normal: {
                                show: true,
                                position: 'center'
                            }
                            //,
                            //emphasis: {
                            //    show: true,
                            //    textStyle: {
                            //        fontSize: '30',
                            //        fontWeight: 'bold'
                            //    }
                            //}
                        },
                        itemStyle:{
                            normal: {
                                color: function(params) {
                                    // build a color map as your need.
                                    var colorList = [
                                        '#10c469','#188ae2',
                                      '#9bca64','#ff8463','#337ab7','#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
                                       '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                                       '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
                                    ];
                                    return colorList[params.dataIndex]
                                },
                                label: {
                                    formatter:'{b}:  {c}'
                                }
                            },
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:datas
                    }
                ]
            };

            var systemChart = echarts.init(document.getElementById('system_count'));
            systemChart.setOption(system_option);
            window.onresize = systemChart.resize;











        }

        function render_server_info(data) {
            $("#total_servers").html(data.server_total_count);
            var on_servers = 0;
            var off_servers = 0;
            var error_servers = 0;


            $("#span_exsi_on").html(data.esxi_server_active_count);
            $("#span_exsi_off").html(data.esxi_server_stopped_count);
            $("#span_exsi_disaster").html(data.esxi_server_error_count);
            $("#span_exsi_count").html(data.esxi_server_total_count);
            $("#span_exsi_version").html("EXSI " + data.esxi_version);

            $("#span_kvm_on").html(data.kvm_server_active_count);
            $("#span_kvm_off").html(data.kvm_server_stopped_count);
            $("#span_kvm_disaster").html(data.kvm_server_error_count);
            $("#span_kvm_count").html(data.kvm_server_total_count);
            $("#span_kvm_version").html("KVM " + data.kvm_version);


            on_servers = data.kvm_server_active_count + data.esxi_server_active_count;
            off_servers = data.kvm_server_stopped_count + data.esxi_server_stopped_count;
            error_servers = data.kvm_server_error_count + data.esxi_server_error_count;


            $("#total_start_servers").html(on_servers);
            $("#total_stop_servers").html(off_servers);
            $("#total_error_servers").html(error_servers);
        }

        function init_host_info() {
            $.ajax({
                type: "GET",
                url: project_url + "/event_number",
                async: true,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_system_info(data)
                },
                error: function (e) {
                    //console.log(e);
                    SAlert.showError(e);

                }
            });
        }

        function init_server_alert() {
            $.ajax({
                type: "GET",
                url:project_url +  "/event_number?type=vm",
                async: true,
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    render_server_alert(data)
                },
                error: function (e) {
                    SAlert.showError(e);
                }
            });
        }

        function get_operation_list(){
            var path =project_url +  "/operation_log";
            //var data = {start:getYesterdayFormatDate(-3).replace(" ","T"),end:getNowFormatDate().replace(" ","T")};
            var data = {limit:7};
            $.ajax({
                type: "GET",
                url: path,
                data:data,
                dataType: "json",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                success: function (data) {
                    //console.log(JSON.stringify(data));
                    render_operation_list(data.operation_logs);
                },
                error:function(e){
                    SAlert.showError(e);
                }
            });
        }

        function render_operation_list(data){
            $("#operation_list").html("");
            var len = data.length > 7 ? 7 : data.length;
            if(len>0) {
                for (var i = 0; i < len; i++) {
                    var _status = "";
                    var _class = "";
                    var _label = project_url + "/static/images/"
                    if (data[i].is_success == "1") {
                        _status = "成功";
                        _label+="success-small.png";
                        _class = "timeline-info";
                    }
                    else {
                        _status = "失败";
                        _label+="error-small.png";
                        _class = "timeline-error";
                    }

                    var _href = "";
                    if(data[i].resource_type=="虚拟机"&&data[i].action!="删除"){
                        _href = "server/" + data[i].resource_id;
                    }



                    var op_div = $("<div class='operation_div " + _class + "'></div>");
                    op_div.append("<div style='margin-left:20px;'><b>" + data[i].action + " " + data[i].resource_type + " " + "</b></div>");
                    op_div.append("<div style='margin-left:20px;font-size:12px;'>" + data[i].time + "</div>");
                    if(_href==""){
                        op_div.append("<div style='margin-left:20px;font-size:12px;'>资源：" + data[i].resource_name + "</div>");
                    }else{
                        op_div.append("<div style='margin-left:20px;font-size:12px;'>资源：<a href='" + _href + "'>" + data[i].resource_name + "</a></div>");
                    }


                    $("#operation_list").append(op_div);
                }
            }
            else{
                var op_div = $("<div class='operation_div'>48小时内无记录</div>");
                $("#operation_list").append(op_div);
            }
        }

        function getYesterdayFormatDate(offset) {
            var date = new Date(new Date()-0+offset*86400000);
            var seperator1 = "-";
            var seperator2 = ":";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate
                    + " " + date.getHours() + seperator2 + date.getMinutes()
                    + seperator2 + date.getSeconds();
            return currentdate;
        }

        function getNowFormatDate(offset) {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate
                    + " " + date.getHours() + seperator2 + date.getMinutes()
                    + seperator2 + date.getSeconds();
            return currentdate;
        }

    }

    function getStorageAlert(){
        var path =project_url +  "/storage_alarm_total";
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                data.disaster = data.warning;
                data.high = data.critical;
                data.average = data.info;
                data.name = '存储池';
                data.tab = "1";
                render_type_table(data);
            },
            error:function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    function render_system_info(data) {

        var host_data = {};

        host_data.disaster = data.disaster_number;
        host_data.high = data.warning_number;
        host_data.average = data.info_number;
        host_data.name = "物理机";
        host_data.tab = "2";
        render_type_table(host_data);

    }

    function render_server_alert(data) {
        var host_data = {};
        host_data.disaster = data.disaster_number;
        host_data.high = data.warning_number;
        host_data.average = data.info_number;
        host_data.name = "虚拟机";
        host_data.tab = "3";


        render_type_table(host_data);

    }

    function render_type_table(data) {
        var types = $("#type_tbody");
        if(types.hasClass("tab" + data.tab)){
            return;
        }else{
            types.addClass("tab" + data.tab);
        }
        var total =  data.disaster + data.high + data.average;
        $("#total_hosts").html(parseInt( $("#total_hosts").html()) + total);
        //$("#alert_summary").append('<br/><span>' + data.name + '告警(<span>' + total + '</span>)</span>');
        $("#total_disaster").html(parseInt($("#total_disaster").html()) + data.disaster);
        $("#total_serious").html(parseInt($("#total_serious").html()) + data.high);
        $("#total_general").html(parseInt($("#total_general").html()) + data.average);

        var table_tr = $("<tr></tr>");
        var table_body =
            '<td><a href="' + project_url + '/app/alarm?tab=' + data.tab + '">' + data.name + '</a></td>' +
            '<td>' + total + '</td>' +
            '<td >' + '<div class="circle circle-level1"></div>' + data.disaster + '</td>' +
            '<td >' + '<div class="circle circle-level2"></div>' + data.high + '</td>' +
            '<td >' + '<div class="circle circle-level3"></div>' + data.average + '</td>';
        table_tr.append(table_body);
        types.append(table_tr);
    }



    //console.warn("Exit main!!!!!!!!");
    return main
}

$(function(){
    var main = wrapper();
    main();
});


*/

