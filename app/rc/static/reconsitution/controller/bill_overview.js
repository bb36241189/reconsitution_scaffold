/**
 * Created by shmily on 2017/2/16.
 */

app.controller('Bill_overviewController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function(){
        $(".form_datetime").datetimepicker({language:  'zh-CN',autoclose:true, format:'yyyy-mm-dd',minView:2});
        $("#search_start_time").val(getOffsetFormatDate("", -30));
        $("#search_end_time").val(getNowFormatDate());

        set_navigator();

        init_departments();
        init_users();
        init_overview_data();
        get_trend_data("week");

        change_department_select();
        change_user_select();
        change_end_time();
        change_start_time();

        click_one_week();
        click_one_month();
        click_one_year();
    });

    var record_type = {
        "server": "云主机",
        "volume": "云硬盘"
    };

    var bill_type = ["server", "volume"];

    function set_navigator(){
        if ($("#consume_manage").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            });

            $("#consume_manage").removeClass('active');
            $("#consume_manage").addClass('dhbg');
        }
        $(".navbar-words").html("消费管理 > 消费总览");
    }

    function init_departments(){
        if($("#department_select").length>0){
            $.ajax({
            type: "GET",
            url: project_url + "/departments",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data.departments);
                render_department(data.departments);
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
        }

    }

    function init_users(){
        if($("#user_select").length>0){
            $.ajax({
            type: "GET",
            url: project_url + "/users",
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                if(data.length){
                    console.log(data);
                    render_user(data);
                }

            },
            error: function(e){
                SAlert.showError(e);
            }
        });
        }
    }

    function render_user(data){
        $("#user_select").empty();
        var default_option = '<option selected="selected" value="">所有用户</option>';
        $("#user_select").append(default_option);

        for(var i=0,l=data.length;i<l;i++){
            var user_option = $("<option></option>");
            user_option.attr("value",data[i].id);
            user_option.text(data[i].user_name);
            $("#user_select").append(user_option);
        }

    }

    function render_department(data){

        $("#department_select").empty();
        var default_option = '<option selected="selected" value="">所有部门</option>';
        $("#department_select").append(default_option);

        for(var i=0,l=data.length;i<l;i++){
            var department_option = $("<option></option>");
            department_option.attr("value",data[i].id);
            department_option.text(data[i].name);
            $("#department_select").append(department_option);
        }

    }

    function getNowFormatDate() {
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
        var currentdate = year + seperator1 + month + seperator1 + strDate;
                //+ " " + date.getHours() + seperator2 + date.getMinutes()
                //+ seperator2 + date.getSeconds();
        return currentdate;
    }

    function getOffsetFormatDate(beginDate, offset) {
        if(beginDate){
            var date =new Date(new Date(beginDate)-0+offset*86400000)
        }else{
            var date = new Date(new Date()-0+offset*86400000);
        }

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
        var currentdate = year + seperator1 + month + seperator1 + strDate;
                //+ " " + date.getHours() + seperator2 + date.getMinutes()
                //+ seperator2 + date.getSeconds();
        return currentdate;
    }

    function init_overview_data(){
        var department_id = $("#department_select").val();
        if(!department_id){
            department_id = "";
        }
        var user_id = $("#user_select").val();
        if(!user_id){
            user_id = "";
        }
        var start = $("#search_start_time").val();
        if (start){
            start += "T00:00:00";
        }
        var end = $("#search_end_time").val();
        if(end){
            end = getOffsetFormatDate(end, 1) + "T00:00:00";
        }
        var url = project_url + "/bills"+"?department_id="+department_id+"&user_id="+user_id+"&start="+start+"&end="+end;
        //console.log(url);
        $.ajax({
            type: "GET",
            url: url,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data);
                render_overview_table(data);
                set_overview_pie(data);
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });


    }

    function render_overview_table(data){
        var tbody = $("#overview_tbody");
        clear_table_body("#overview_tbody");
        var total_num = 0;
        var total_cost = 0.0;
        for(var i=0;i<bill_type.length;i++){
            var table_tr = $("<tr></tr>");
            var tmp_bill_type = bill_type[i]+"_bills";
            var tmp_cost_type = bill_type[i]+"_total_cost";
            var table_body =
                    '<td >'+record_type[bill_type[i]]+'</td>' +
                    '<td>'+data[tmp_bill_type].length+'</td>'+
                    '<td>'+parseFloat(data[tmp_cost_type]).toFixed(4)+'</td>';
            table_tr.append(table_body);
            tbody.append(table_tr);

            total_num += data[tmp_bill_type].length;
            //console.log(parseFloat(data[tmp_cost_type]));
            total_cost += parseFloat(data[tmp_cost_type]);
        }
        //console.log(total_cost);
        var total_tr = '<tr class="total_tr">'+'<td >'+"总计"+'</td>' +
                    '<td>'+total_num+'</td>'+
                    '<td>'+total_cost.toFixed(4)+'</td>'+'</tr>';
        tbody.append(total_tr);

    }

    function change_department_select(){
        $("#department_select").change(function(){
            //console.log($("#department_select").val());
            init_overview_data();
        });
    }

    function change_user_select(){
        $("#user_select").change(function(){
            init_overview_data();
        });
    }

    function change_start_time(){
        $("#search_start_time").change(function(){
            init_overview_data();
        });
    }

    function change_end_time(){
        $("#search_end_time").change(function(){
            init_overview_data();
        });
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }




    function set_overview_pie(data) {

        var colors = ['#FF0000', '#5bc0de', '#0044cc', '#2aabd2', '#8541b5', '#94ff7c', '#ffff00'];
        //var server_cost = parseFloat(data.server_total_cost);
        //var volume_cost = parseFloat(data.volume_total_cost);
        var source_type = [];
        var cost_data = [];
        for(var j=0;j<bill_type.length;j++){
            var cost = {};
            var type = bill_type[j]+"_total_cost";
            if(parseFloat(data[type])){
                source_type.push(record_type[bill_type[j]]);
                cost.value = parseFloat(data[type]);
                cost.name = record_type[bill_type[j]];
                cost_data.push(cost);
            }
        }

        if(source_type.length){
            var overview_option = {
            title : {
                text: '资源消费比例概图',
                x:'left',
                textStyle:{
                    fontSize: 15,
                    fontWeight: 300
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'right',
                data: source_type
            },
            calculable: false,
            color: colors,
            series: [
                {
                     name: '消费比例',
                    type: 'pie',
                    hoverAnimation: false,
                    center: ['50%', '50%'],
                    radius: '70%',
                    data: cost_data
                }
            ]
        };
            var overviewChart = echarts.init(document.getElementById('overview_pie'));
            overviewChart.setOption(overview_option);
            window.onresize = overviewChart.resize;
        }else{
            $("#overview_pie").html("没有消费");
            $("#overview_pie").addClass('no_data');
        }


    }

    function set_trend_chart(data){

        var time_data = [];
        var cost_data = [];

        if (data.length){
            for(var i=0;i<data.length;i++){
                time_data.push(data[i].time);
                cost_data.push(parseFloat(data[i].cost));
            }
            //console.log(time_data);
            //console.log(cost_data);

            var trendChart = echarts.init(document.getElementById('overview_trend'));
            var trend_option = {
            /*title : {
                text: '近期消费走势(该图数据是构造的)',
                x:'left',
                textStyle:{
                    fontSize: 15,
                    fontWeight: 300
                }
            },*/
            grid:{
                right:40,
                bottom:40,
                top:30,
                left:60
            },
            tooltip : {
                trigger: 'axis',
                formatter: "{b} <br/>{a} : {c}"
            },
            color: ['#02cd4e'],
            xAxis: [
                {
                    type: "category",
                    boundaryGap : false,
                    splitNumber: 10,
                    data : time_data
                }
            ],
            yAxis: [
                {
                    type: "value",
                    name: "消费金额(元)",
                    splitLine : {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name:"消费金额",
                    type: 'line',
                    //showSymbol: false,
                    data:cost_data
                }
            ]
        };
            trendChart.setOption(trend_option);
            window.onresize = trendChart.resize;
        }else{
            $("#overview_trend").html("没有获取到数据");
            $("#overview_trend").addClass('no_data');
        }

    }

    function click_one_week(){
        $("#one_week").click(function(){
            $("#one_week").addClass('trend_active');
            $("#one_month").removeClass('trend_active');
            $("#one_year").removeClass('trend_active');

            get_trend_data("week");
        });
    }

    function click_one_month(){
        $("#one_month").click(function(){
            $("#one_month").addClass('trend_active');
            $("#one_week").removeClass('trend_active');
            $("#one_year").removeClass('trend_active');

            get_trend_data("month");
        });
    }
    function click_one_year(){
        $("#one_year").click(function(){
            $("#one_year").addClass('trend_active');
            $("#one_month").removeClass('trend_active');
            $("#one_week").removeClass('trend_active');

            get_trend_data("year");
        });
    }

    function get_trend_data(type){
        var department_id = $("#department_select").val();
        if(!department_id){
            department_id = "";
        }
        var user_id = $("#user_select").val();
        if(!user_id){
            user_id = "";
        }
        var url = project_url + "/bill_trend"+"?department_id="+department_id+"&user_id="+user_id+"&type="+type;

        $.ajax({
            type: "GET",
            url: url,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                //console.log(data);
                set_trend_chart(data);
            },
            error: function(e){
                SAlert.showError(e);
            }
        });
    }
}]);

