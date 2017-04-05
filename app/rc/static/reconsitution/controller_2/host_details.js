/**
 * Created by shmily on 2017/2/6.
 */
app.controller('hostDetailController',['$scope','$http','$timeout','$stateParams','host_detailService', 'PermitStatus',function ($scope,$http,$timeout,$stateParams,host_detailService,PermitStatus) {
    var state_map = {
        'up': "运行中",
        'down': "停止"
    };

    var enable_map = {
        'enabled': "启用",
        'disabled': "停用"
    };

    var COLOR = ['#c23531', '#314656', '#61a0a8', '#dd8668', '#91c7ae', '#6e7074', '#61a0a8', '#bda29a', '#44525d', '#c4ccd3']

    var networkRateChart = {};
    var networkIOPSChart = {};
    var cpu_option = {
        title: {
            text: 'CPU使用率',
            subtext: '单位: %',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                if(params instanceof Array){
                    var date = new Date(params[0]['data'][0]);
                    var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes() + ':'
                        + date.getSeconds();
                    return data + '<br/>'
                        + 'CPU使用率(%)：' + params[0]['data'][1];
                }else{
                    return params.name + ": " + params.value
                }
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['CPU使用率'],
            x: 'left',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                //symbolSize: 8,
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "cpu_util",
                telemetry_item: "system.cpu.util[,user]",
                data: [],
                markLine: {
                    precision: 3,
                    label: {
                        normal: {
                            show: true,
                            formatter: '{b}:\n{c}',
                        },
                        emphasis: {
                            show: true,
                            formatter: '{b}:\n{c}',
                        }
                    },
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                },
                smooth: true,
            }
        ]
    };

    var mem_option = {
        title: {
            text: '内存使用率',
            subtext: '单位: %',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                if(params instanceof Array){
                    var date = new Date(params[0]['data'][0]);
                    var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes() + ':'
                        + date.getSeconds();
                    return data + '<br/>'
                        + '内存使用率(%)：' + params[0]['data'][1];
                }else{
                    return params.name + ": " + params.value
                }
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['内存使用率'],
            x: 'left',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '内存使用率',
                type: 'line',
                //symbolSize: 8,
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "cpu_util",
                telemetry_item: "system.memory.util",
                data: [],
                markLine: {
                    precision: 3,
                    label: {
                        normal: {
                            show: true,
                            formatter: '{b}:\n{c}',
                        },
                        emphasis: {
                            show: true,
                            formatter: '{b}:\n{c}',
                        }
                    },
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                },
                smooth: true,
            }
        ]
    };

    var disk_rate_option = {
        title: {
            text: '磁盘读写速率',
            subtext: '单位: B/s',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var date = new Date(params[0]['data'][0]);
                var data = date.getFullYear() + '-'
                    + (date.getMonth() + 1) + '-'
                    + date.getDate() + ' '
                    + date.getHours() + ':'
                    + date.getMinutes() + ':'
                    + date.getSeconds();
                var tip = data + "</br>";
                for (var i = 0; i < params.length; i++) {
                    var inner_tip = params[i].seriesName + "(B/s):" + params[i]['data'][1];
                    tip = tip + inner_tip + "</br>";
                }
                return tip
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['读速率', '写速率'],
            x: 'left',
            orient: 'vertical',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '读速率',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "disk.read.bytes.rate",
                telemetry_item: "disk.read.sectors[sda]",
                data: [],
                smooth: true,
                color: "blue"

            },
            {
                name: '写速率',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "disk.write.bytes.rate",
                telemetry_item: "disk.write.sectors[sda]",
                data: [],
                smooth: true,
            },
        ]
    };

    var disk_iops_option = {
        title: {
            text: '磁盘读写IOPS',
            subtext: '单位: Request/s',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var date = new Date(params[0]['data'][0]);
                var data = date.getFullYear() + '-'
                    + (date.getMonth() + 1) + '-'
                    + date.getDate() + ' '
                    + date.getHours() + ':'
                    + date.getMinutes() + ':'
                    + date.getSeconds();
                var tip = data + "</br>";
                for (var i = 0; i < params.length; i++) {
                    var inner_tip = params[i].seriesName + "(Request/s):" + params[i]['data'][1];
                    tip = tip + inner_tip + "</br>";
                }
                return tip
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['读IOPS', '写IOPS'],
            x: 'left',
            orient: 'vertical',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '读IOPS',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "disk.read.requests.rate",
                telemetry_item: "disk.read.ops[sda]",
                data: [],
                smooth: true,

            },
            {
                name: '写IOPS',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "disk.write.requests.rate",
                telemetry_item: "disk.write.ops[sda]",
                data: [],
                smooth: true,
            },
        ]
    };

    var network_rate_option = {
        title: {
            text: '网络读写速率',
            subtext: '单位: B/s',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var date = new Date(params[0]['data'][0]);
                var data = date.getFullYear() + '-'
                    + (date.getMonth() + 1) + '-'
                    + date.getDate() + ' '
                    + date.getHours() + ':'
                    + date.getMinutes() + ':'
                    + date.getSeconds();
                var tip = data + "</br>";
                for (var i = 0; i < params.length; i++) {
                    var inner_tip = params[i].seriesName + "(B/s):" + params[i]['data'][1];
                    tip = tip + inner_tip + "</br>";
                }
                return tip
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['读速率', '写速率'],
            x: 'left',
            orient: 'vertical',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '读速率',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "network.incoming.bytes.rate",
                telemetry_item: "system.cpu.util[,user]",
                data: [],
                smooth: true,
                color: "blue"

            },
            {
                name: '写速率',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "network.outgoing.bytes.rate",
                telemetry_item: "system.cpu.util[,system]",
                data: [],
                smooth: true,
            },
        ]
    };

    var network_iops_option = {
        title: {
            text: '网络读写IOPS',
            subtext: '单位: Request/s',
            x: 'center',
            textStyle: {
                fontSize: 16,
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var date = new Date(params[0]['data'][0]);
                var data = date.getFullYear() + '-'
                    + (date.getMonth() + 1) + '-'
                    + date.getDate() + ' '
                    + date.getHours() + ':'
                    + date.getMinutes() + ':'
                    + date.getSeconds();
                var tip = data + "</br>";
                for (var i = 0; i < params.length; i++) {
                    var inner_tip = params[i].seriesName + "(Request/s):" + params[i]['data'][1];
                    tip = tip + inner_tip + "</br>";
                }
                return tip
            },
            axisPointer: {
                animation: false
            }
        },
        legend: {
            data: ['读IOPS', '写IOPS'],
            x: 'left',
            orient: 'vertical',
        },
        grid: [{
            left: 40,
            right: 40,
            height: '52%',
        }],
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                scale: true,
                type: 'value',
            }
        ],
        color: COLOR,
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '读IOPS',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "network.incoming.packets.rate",
                telemetry_item: "system.cpu.util[,user]",
                data: [],
                smooth: true,

            },
            {
                name: '写IOPS',
                type: 'line',
                showSymbol: false,
                itemStyle: {
                    emphasis: {}
                },
                hoverAnimation: true,
                //telemetry_item: "network.outgoing.packets.rate",
                telemetry_item: "system.cpu.util[,system]",
                data: [],
                smooth: true,
            },
        ]
    };

    var DURATION_NUM = {
        "six_hours": 10 * 6 * 6,
        "one_day": 10 * 6 * 24,
        "one_week": 10 * 6 * 24 * 7,
        "one_month": 10 * 6 * 24 * 7 * 4,
    };

    /*
     * Register async function from index-extend.js file
     */


    $(function () {
        //register_async();
        set_navigator()
    });

    function set_navigator() {
        if ($("#compute_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            $("#compute_resource").removeClass('active');
            $("#compute_resource").addClass('dhbg');
        }
        $(".navbar-words").html("计算资源 > <a href='" + project_url + "/app/host'>物理服务器</a> > " + $("#host_li").html());

        //$("#compute_resource .sub-menu").css("display", "block");
    }
    /*
     * Render host details table
     */

    $(function () {
        init_host_detail();
    });

    function get_host_id() {
        return $stateParams.detailId;
        //return $("#host_li").attr("host_id");
    }

    function init_host_detail() {
        host_detailService.getHostById(get_host_id()).success(render_detail_table);
    }
    function render_detail_table(data) {
        if (data) {
            //console.debug("host info: ", data);
            render_host_detail(data);
        }
    }

    function render_host_detail(host) {
        if (host.openstack_node == 0) {
            $("#host_table [tr-type=openstack]").each(function () {
                $(this).addClass('hide-tr-item');
                console.debug("Hide")
            })
        } else {
            $("#host_table [tr-type=openstack]").each(function () {
                $(this).removeClass('hide-tr-item');
                console.debug("Display")
            })
        }

        $("#host_name").html(host.hostname).attr("title", host.hostname);
        $("#host_power_status").html(host_status_map(host.status));
        $("#member_enabled").html(enable_map[host.enable_status]).attr("title", enable_map[host.enable_status]);
        $("#service_state").html(state_map[host.state]).attr("title", state_map[host.state]);
        $("#host_system").html(host.os_info).attr("title", host.os_info);
        $("#host_manage_ip").html(host.manage_ip).attr("title", host.manage_ip);
        $("#ipmi_ip").html(host.ipmi_ip);
        $("#cpu_total_number").html(host.cpu);
        $("#cpu_vender").html(host.cpu_vender).attr("title", host.cpu_vender);
        $("#cpu_arch").html(host.cpu_arch).attr("title", host.cpu_arch);
        $("#cpu_used_number").html(host.cpu_used).attr("title", host.cpu_used);
        $("#mem_total_number").html(reformat_mb_to_gb(host.mem) + "G").attr("title", reformat_mb_to_gb(host.mem) + "G");
        $("#mem_user_number").html(reformat_mb_to_gb(host.mem_used) + "G").attr("title", reformat_mb_to_gb(host.mem_used) + "G");
        $("#running_vm_number").html(host.running_vms).attr("title", host.running_vms);
    }

    function reformat_mb_to_gb(mb) {
        return (mb / 1024).toFixed(2)
    }

    function host_status_map(status) {
        if (status == '0') {
            return '关机'
        } else if (status == '1') {
            return '开机'
        } else {
            return '未知'
        }
    }

    /*
     * Render all charts
     */
    $(function () {
        $timeout(function () {
            render_telemetry_charts()
        },500);
    });

    function render_telemetry_charts() {
        //console.debug("Enter charts function");
        var current_time = new Date();
        var current_stamp = current_time.getTime();
        var item_name = $("#host_li").html();

        var cpuChart = echarts.init(document.getElementById('cpu_telemetry_container'));
        var memChart = echarts.init(document.getElementById('mem_telemetry_container'));
        var diskRateChart = echarts.init(document.getElementById('disk_rate_container'));
        var diskIOPSChart = echarts.init(document.getElementById('disk_iops_container'));
        //console.debug("current_stamp", current_stamp);
        cpuChart.setOption(cpu_option);
        cpuChart.hideLoading();
        cpuChart.showLoading();

        memChart.setOption(mem_option);
        memChart.hideLoading();
        memChart.showLoading();

        diskRateChart.setOption(disk_rate_option);
        diskRateChart.hideLoading();
        diskRateChart.showLoading();
        diskIOPSChart.setOption(disk_iops_option);
        diskIOPSChart.hideLoading();
        diskIOPSChart.showLoading();

        //clean network chart
        $("#network_row").html("");

        //get_telemetry_data(current_stamp, item_name, ["cpu_util"], cpuChart);
        //get_telemetry_data(current_stamp, item_name, ["disk.read.bytes.rate", "disk.write.bytes.rate"], diskRateChart);
        //get_telemetry_data(current_stamp, item_name, ["disk.read.requests.rate", "disk.write.requests.rate"], diskIOPSChart);
        //item_name = "172.24.6.191";
        get_telemetry_data(current_stamp, item_name, ["system.cpu.util[,user]"], cpuChart);
        get_telemetry_data(current_stamp, item_name, ["system.memory.util"], memChart);
        get_telemetry_data(current_stamp, item_name, ["disk.read.sectors[sda]", "disk.write.sectors[sda]"], diskRateChart);
        get_telemetry_data(current_stamp, item_name, ["disk.read.ops[sda]", "disk.write.ops[sda]"], diskIOPSChart);

        //get_iface_telemetry(current_stamp);
        //console.debug("Exit charts function")
    }

    function get_telemetry_data(current_stamp, resource_name, meter_item, chart_name) {
        //console.debug("Enter get_telemetry_data function")
        //console.debug("Current stamp: ", current_stamp);
        var end = format_date_string(current_stamp);
        var start = format_date_string(get_previous_time(current_stamp));
        //console.debug("Start time", start, "End time: ", end);
        render_sample_data(chart_name, meter_item, resource_name, start, end);
        //console.debug("Exit get_telemetry_data function")
    }

    function get_iface_telemetry(current_stamp) {
        var item_id = get_server_id();
        host_detailService.getServersById(item_id).success(function (server_data) {
             get_port_info(server_data, current_stamp)
        });
    }

    function get_port_info(server_data, current_stamp) {
        var item_id = get_server_id();
        
        host_detailService.getServerPortsById(item_id).success(function (port_data) {
            generate_network_container(port_data);
            render_iface_charts(port_data, server_data, current_stamp)
        });
    }

    function generate_network_container(port_data) {
        console.debug("PORT DATA: ", port_data);

        var iface_length = port_data.length;

        var $network_row = $("#network_row");
        $network_row.html("");
        for (var i = 0; i < iface_length; i++) {
            var $out_row = $("<div class='row'></div>");
            var $chart_item = $('<div class="col-md-6 chart-item"></div>');
            var $inner_row = $("<div class='row'></div>");
            var $col = $('<div class="col-md-11"></div>');
            var $chart_title = $('<div class="chart-title"></div>');
            var $chart_container = $('<div class="chart-body"></div>');
            var $chart_item_two = $('<div class="col-md-6 chart-item"></div>');
            var $inner_row_two = $("<div class='row'></div>");
            var $col_two = $('<div class="col-md-11"></div>');
            var $chart_title_two = $('<div class="chart-title"></div>');
            var $chart_container_two = $('<div class="chart-body"></div>');

            $chart_title.html("网卡" + (i + 1) + ': ' + port_data[i].network_name + '(' + port_data[i].ip_address + ')');
            $chart_container.attr("id", 'network_rate_container_' + port_data[i].id);
            $chart_container_two.attr("id", 'network_iops_container_' + port_data[i].id);
            $col.append($chart_title).append($chart_container);
            $inner_row.append($col);
            $chart_item.append($inner_row);
            $out_row.append($chart_item);
            $col_two.append($chart_title_two).append($chart_container_two);
            $inner_row_two.append($col_two);
            $chart_item_two.append($inner_row_two);
            $out_row.append($chart_item_two);
            $network_row.append($out_row);

            networkRateChart[port_data[i].id] = echarts.init(document.getElementById('network_rate_container_' + port_data[i].id));
            networkIOPSChart[port_data[i].id] = echarts.init(document.getElementById('network_iops_container_' + port_data[i].id));

            networkRateChart[port_data[i].id].setOption(network_rate_option);
            networkRateChart[port_data[i].id].showLoading();
            networkIOPSChart[port_data[i].id].setOption(network_iops_option);
            networkIOPSChart[port_data[i].id].showLoading();
        }
    }

    function render_iface_charts(port_data, server_data, current_stamp) {
        console.log("Network info: ", port_data, server_data);
        for (var i = 0; i < port_data.length; i++) {
            get_telemetry_data(current_stamp, get_resource_id(server_data["server"], port_data[i]), ["network.incoming.bytes.rate", "network.outgoing.bytes.rate"], networkRateChart[port_data[i].id]);
            get_telemetry_data(current_stamp, get_resource_id(server_data["server"], port_data[i]), ["network.incoming.packets.rate", "network.outgoing.packets.rate"], networkIOPSChart[port_data[i].id]);
        }
    }

    function get_resource_id(server, port) {
        var item_id = server.id;
        var instance_name = server.instance_name;
        var port_id = port.id
        return instance_name + '-' + item_id + '-tap' + port_id.slice(0, 11)
    }

    function get_previous_time(current_stamp) {
        var duration_type = $("#duration_select button.active").val();
        var duration = DURATION_NUM[duration_type] * 60 * 1000;
        var previous_stamp = current_stamp - duration;
        return previous_stamp
    }

    function get_number(duration, interval) {
        return Number(DURATION_NUM[duration] / interval).toFixed(0)
    }

    function format_date_string(time_stamp) {
        var time = new Date(time_stamp);
        var month = format_double_bit(Number(time.getMonth() + 1));
        var date = format_double_bit(Number(time.getDate()));
        var hour = format_double_bit(Number(time.getHours()));
        var minute = format_double_bit(Number(time.getMinutes()));
        var second = format_double_bit(Number(time.getSeconds()));
        var result = time.getFullYear() + '-' + month + '-' +
            date + "T" + hour + ":" + minute +
            ":" + second;
        return result
    }

    function format_double_bit(param) {
        if (typeof Number(param) == "number") {
            if (param < 10) {
                param = "0" + param
            }
        }
        return param
    }
    /*
     * Async get data
     */
    function render_sample_data(chart_name, meter_item, resource_name, start, end) {
       /* console.debug("Enter render_sample_data function, and chartName", chart_name, "meter_item", meter_item,
         "resource_id", resource_name,"start", start, "end", end)*/

        var interval = $("#duration_select button.active").attr("interval");
        for (var i = 0; i < meter_item.length; i++) {
            var sample_params = {
                'item_key': meter_item[i],
                'hostname': resource_name,
                'start': start,
                'end': end,
                'interval': interval
            };
            $.ajax({
                type: "get",
                url: project_url + '/hosts-telemetry',
                dataType: "json",
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                data: sample_params,
                success: function (data) {
                    set_relevant_charts(data, chart_name);
                }
            });
        }
    }

    /*
     * Echarts relevant function
     */
    function set_relevant_charts(data, chart_name) {
        //console.debug("option_map is: ", option_map);
       //console.debug("Sample data is: ", data);
        if (data['samples'].length > 0) {
            var lastest_time_stamp = Number(data['samples'][0].timestamp) * 1000;
        } else {
            var lastest_time_stamp = new Date().getTime()
        }

        var data_array = [];
        for (var i = 0; i < data['samples'].length; i++) {
            data_array.unshift(Number(data['samples'][i].counter_volume).toFixed(2))
        }

        var time_array = calculate_time_data(lastest_time_stamp);

        reformat_data(data_array, time_array);
        var option_data = splice_data(data_array, time_array);
        //console.debug("option_data is: ", option_data);
        var item_option = chart_name.getOption();

        //console.debug("origin data: ", data, "time_array: ", time_array.length, "data_array", data_array.length);
        var series = item_option['series'];
        for (var i = 0; i < series.length; i++) {
            if (data.samples.length > 0) {
                if (series[i].telemetry_item == data.samples[0].counter_name) {
                    item_option['series'][i]['data'] = option_data;
                    break;
                }
            } else if (item_option['series'][i]['data'].length == 0) {
                item_option['series'][i]['data'] = option_data;
            }
        }

        //console.debug("item_option is: ", item_option);
        chart_name.hideLoading();
        chart_name.setOption(item_option);
    }

    function calculate_time_data(last_time_stamp) {
        var duration_type = $("#duration_select button.active").val();
        var interval = $("#duration_select button.active").attr("interval");
        var number = get_number(duration_type, interval);
        var time_array = [];
        for (var i = 0; i < number; i++) {
            time_array.unshift(last_time_stamp - i * interval * 60 *1000)
        }
        return time_array
    }

    function format_date_to_stamp(lastest_time_data) {
        var part = lastest_time_data.split("T");
        var year_part = part[0].split("-");
        var hour_part = part[1].split(":");
        var year = year_part[0];
        var month = year_part[1];
        var day = year_part[2];
        var hour = hour_part[0];
        var minute = hour_part[1];
        var second = hour_part[2];
        var date = new Date(year, month, day, hour, minute, second)
        var local_date = convert_to_local_time(date);
        return local_date.getTime();
    }

    function convert_to_local_time(utc_date) {
        var local_date = new Date(utc_date.getTime() - utc_date.getTimezoneOffset() * 60 * 1000);
        //console.debug("UTC_date : ", utc_date,"and time zone offset is: ", utc_date.getTimezoneOffset())
        //console.debug("Local_date : ", local_date)
        return local_date
    }

    function reformat_data(data_array, time_array) {
        var data_length = data_array.length;
        var time_length = time_array.length;
        if (data_length < time_length) {
            var miss_length = time_length - data_length;
            for (var i = 0; i < miss_length; i++) {
                data_array.unshift("无")
            }
        } else if (data_length - time_length == 1) {
            data_array.shift()
        }
    }

    function splice_data(data_array, time_array) {
        //console.debug("splice_data func -> data_array is: ", data_array, " and time_array is: ", time_array)
        var option_data = [];
        for (var i = 0; i < time_array.length; i++) {
            option_data.push([time_array[i], data_array[i]])
        }
        return option_data
    }

    $(function () {
        $("#duration_select button").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
            render_telemetry_charts()
        });
        initSliderPanel($(".slider-panel-group"));
    });

    function initSliderPanel($group){
        function sliderPanelDown($panel){
            $panel.find(".slider-panel-caret").show();
            $panel.find(".slider-panel-title-text").hide();
            $panel.find(".slider-panel-container").slideDown();
        }

        function sliderPanelUp($panel){
            $panel.find(".slider-panel-caret").hide();
            $panel.find(".slider-panel-title-text").show();
            $panel.find(".slider-panel-container").slideUp();
        }

        function clickEvent($panel){
            sliderPanelDown($panel);
            var other_panels = $panel.siblings();
            for(var j=0;j<other_panels.length;j++){
                sliderPanelUp(other_panels.eq(j));
            }
        }

        var list = $group.find(".slider-panel");
        var sum = 0;
        for(var i=0;i<list.length;i++){
            list.eq(i).find(".slider-panel-title").on("click",function(){
                var this_panel = $(this).parent().parent();
                clickEvent(this_panel);
            });
            sum += list.eq(i).height();
        }

        if(sum>$group.height()){
            clickEvent(list.eq(0));
        }
        else{
            $(".slider-panel-title-text").hide();
        }
    }
}]);
