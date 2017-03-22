(function ($) {
    /*
     首页折线图
     */
    $.fn.lineChart = function(options,t) {
        $(this).each(function(){
            var othis = $(this);
            var data = [];
            var obj = {
                cap:'',
                interval:'auto',
                date:[],    //时间列表
                data:[]    //统计数据
            };

            obj = $.extend(obj,options);

            //处理数据
            for(var i=0;i<obj.data.length;i++){
                data[i] = {
                    type:'line',
                    symbolSize:2,
                    smooth:true,
                    showSymbol:false,
                    itemStyle:{
                        normal:{color:obj.data[i].lineColor}
                    },
                    lineStyle:{
                        normal:{
                            color:obj.data[i].lineColor,
                            width:1
                        }
                    },
                    areaStyle:{
                        normal:{color:obj.data[i].areaColor}
                    },
                    data:obj.data[i].data
                };
            }

            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    axisLabel:{
                        interval:obj.interval
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#adadad'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle:{
                            color:'#f6f7f6'
                        }
                    },
                    data: obj.date
                },
                yAxis: {
                    type: 'value',
                    show:false,
                    min:10
                },
                series: data
            };

            var myChart = echarts.init(othis[0]);

            if(t){  //全自定义
                myChart.setOption(options);
            }else{  //部分自定义
                myChart.setOption(option);
            }

            $(window).on('resize',function(){
                myChart.resize();
            });
        });
    };

    /*
     监控折线图
     */
    $.fn.monitorChart = function(options,t) {
        $(this).each(function(){
            var othis = $(this);
            var data = [];
            var obj = {
                cap:'',
                interval:'auto',
                data:[]    //统计数据
            };

            obj = $.extend(obj,options);

            //处理数据
            for(var i=0;i<obj.data.length;i++){
                data[i] = {
                    type:'line',
                    name:obj.data[i].name,
                    symbolSize:2,
                    smooth:true,
                    showSymbol:false,
                    itemStyle:{
                        normal:{color:obj.data[i].lineColor}
                    },
                    lineStyle:{
                        normal:{
                            color:obj.data[i].lineColor,
                            width:1
                        }
                    },
                    areaStyle:{
                        normal:{color:obj.data[i].areaColor}
                    },
                    data:obj.data[i].data
                };
            }

            var option = {
                title: {
                    text: 'cpu相关监控项目'
                },
                grid: {
                    left: '0%',
                    right: '15%',
                    top: '40%',
                    bottom: '3%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left:0,
                    top:35,
                    orient:'vertical',
                    itemGap:14,
                    textStyle:{
                        color:'#959595',
                        fontSize:14
                    },
                    data:['成交','预购']
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                    axisLabel:{
                        interval:'auto'
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#adadad'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle:{
//                        color:'#f6f7f6'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine:{
                        lineStyle:{
                            color:'#adadad'
                        }
                    }
                },
                series: data
            };

            var myChart = echarts.init(othis[0]);

            if(t){  //全自定义
                myChart.setOption(options);
            }else{  //部分自定义
                myChart.setOption(option);
            }

            $(window).on('resize',function(){
                myChart.resize();
            });
        });
    };

    /*
     饼图
     */
    $.fn.cakeChart = function(options,t) {
        var othis = $(this);
        var obj = {
            cap:'',     //模块标题
            labelSum:0,  //总量
            labelUnit:'',   //单位
            labelTit:'',    //说明
            dataList:[],    //数据列表
            data:[],    //统计数据
            itemColor: '#2a77ec',   //描边颜色
            areaColor: '#e1ecfd'    //填充颜色
        };

        obj = $.extend(obj,options);

        //页面配置
        var box = othis.parents('.box');
        box.find('.Tit').text(obj.cap);
        box.find('.NumCap').html("<div class='Num'><b>"+obj.labelSum+"</b>"+obj.labelUnit+"</div><p>"+obj.labelTit+"</p>");

        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(othis[0]);
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'horizontal',
                left: 'left',
                itemGap:20,
                itemWidth:18,
                itemHeight:10,
                data: obj.dataList
            },
            series: [
                {
                    type:'pie',
                    radius: ['70%', '90%'],
                    center: ['50%', '90%'],
                    avoidLabelOverlap: false,
                    startAngle:-180,
                    label: {
                        normal: {
                            // show: false
                            // position:'inside',
                            formatter:'{d}%',
                            textStyle:{
                                fontSize:14
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            // show: false
                            length:0
                        }
                    },
                    data:obj.data
                }
            ]
        };

        if(t){  //全自定义
            myChart.setOption(options);
        }else{  //部分自定义
            myChart.setOption(option);
        }

        $(window).on('resize',function(){
            myChart.resize();
        });
    };

    /*
     环形百分比
     */
    $.fn.circliful = function(options) {
        $(this).each(function(){
            var othis = $(this);
            var obj = {
                dimension:110,       //圆形图的宽度和高度px
                text:'',          //显示在圆圈内侧的文字内容
                info:'',          //显示在data-text下的说明信息
                width:8,             //圆圈的厚度px
                fontsize:'14',       //圈内文字大小px
                percent:'70',        //圆圈统计百分比%，1-100
                fgcolor:'#67aaf9',   //圆圈的前景色
                bgcolor:'#eff0f4',   //圆圈的背景色
                fill:'rgba(0,0,0,0)',//圆形的填充背景色
                radius:'true',
                fontWeight:false
            };

            //获得标签上定义的值
            for(var key in obj){
                var dataVal = othis.attr('data-'+key);

                if(dataVal) obj[key]=dataVal;
            }

            obj = $.extend(obj,options);

            othis.css({
                'width': obj.dimension,
                'height': obj.dimension
            });

            var cx=cy=parseFloat(obj.dimension)/2,strW=parseFloat(obj.width),r=cx-strW/2;
            var capHtml = '',svgHtml = '',radius = '';

            if(obj.radius=='true') radius = "style='stroke-linecap: round;'";

            //标题
            if(obj.text){
                if(obj.fontWeight){
                    capHtml += "<div class='cirCap'><b>"+obj.text+"</b></div>";
                }else{
                    capHtml += "<div class='cirCap'>"+obj.text+"</div>";
                }
            }
            //说明
            if(obj.info){
                capHtml += "<div class='cirTit'>"+obj.info+"</div>";
            }

            //主体
            svgHtml += "<svg width='"+obj.dimension+"' height='"+obj.dimension+"'>"+
                "<circle cx='"+cx+"' cy='"+cy+"' r='"+r+"' stroke-width='"+strW+"' stroke='"+obj.bgcolor+"' fill='"+obj.fill+"'></circle>"+
                "<circle cx='"+cx+"' cy='"+cy+"' r='"+r+"' stroke-width='"+strW+"' stroke='"+obj.fgcolor+"' fill='"+obj.fill+"' "+radius+" transform='matrix(0,-1,1,0,0,"+obj.dimension+")'></circle>"+
                "</svg>";

            othis.html(capHtml+svgHtml);

            //设置样式
            if(capHtml){
                othis.css({
                    'position':'relative'
                });
                othis.find('.cirCap').css({
                    'position':'absolute','width':'100%','height':'100%','left':'0','top':'0',
                    'text-align':'center','line-height':obj.dimension+'px','font-size':obj.fontsize+'px'
                });
                othis.find('.cirTit').css({
                    'position':'absolute','width':'100%','left':'0','top':'65%',
                    'text-align':'center','font-size':'14px','color':'#999'
                });
            }

            var circle = othis.find('circle').eq(1)[0];
            var percent = parseFloat(obj.percent)/100, perimeter = Math.PI * 2 * r;

            circle.setAttribute('stroke-dasharray', 0 + " " + perimeter * (1));

            var strokeI = 0;
            var timer = setInterval(function(){
                circle.setAttribute('stroke-dasharray', perimeter * strokeI + " " + perimeter * (1- strokeI));
                if(strokeI>percent){
                    clearInterval(timer);
                }
                strokeI = strokeI+0.01;
            },10);

        });
    };


    /*
     环形饼图
     */
    $.fn.pieChart = function(options) {
        var box = $(this);

        var othis = box.find('.svgBox');
        var i = 0;
        var obj = {
            cap:['台','租户'],
            borderWidth:35,
            data:[]
        };

        obj = $.extend(obj,options);

        //计算数组和
        var sum = 0;
        for(i=0;i<obj.data.length;i++){
            sum+=parseFloat(obj.data[i].data);
        }

        //添加demo
        othis.append("<div class='titBox'></div><svg></svg>");
        box.find('.NumCap').html("<div class='Num'><b>"+sum+"</b>"+obj.cap[0]+"</div><p>"+obj.cap[1]+"</p>");

        //生成列表
        for (i=0;i<obj.data.length;i++){
            box.find('.pList').append("<li><i style='background-color: "+obj.data[i].stroke+"'></i>"+obj.data[i].title+"</li>");
        }



        othis.mainFun = function(){

            //获得容器宽高
            obj.width = othis.width();
            obj.height = obj.width*0.51+obj.borderWidth/2;

            //计算left,top
            var distance = toDecimal2( Math.sqrt(Math.pow(Math.sqrt(2*Math.pow(obj.width/2,2)) - obj.width/2 ,2)/2) );
            distance = distance+obj.borderWidth/2-9;

            //计算中心点偏移量
            var origin = (obj.width/2-obj.borderWidth)*0.705+obj.borderWidth/2;

            //设置必要样式
            othis.css({
                'position':'relative',
                'overflow': 'hidden',
                // 'background-color': '#000',
                'height':obj.height+'px'
            });
            othis.find('svg').css({
                'width':obj.width+'px',
                'height':obj.width+'px'
            });

            //添加填充-开始

            //定义
            var sSum=0,cx=obj.width/2,cy=obj.width/2,strW=obj.borderWidth,r=cx-strW/2,cirHtml='',titHtml='';
            for(i=0;i<obj.data.length;i++){
                var tD = obj.data[i];
                var ratio = toDecimal2(parseFloat(tD.data)/sum*100)/100;
                var percent = (ratio+sSum)*0.5;
                var perimeter = Math.PI * 2 * r;
                var strDa = perimeter * percent + " " + perimeter * (1- percent);

                //填充
                cirHtml = "<circle data-i='"+i+"' cx='"+cx+"' cy='"+cy+"' r='"+r+"' stroke-width='"+strW+"' stroke='"+tD.stroke+"' fill='none' "+
                    "transform='matrix(-1,0,-0,-1,"+obj.width+","+obj.width+")' stroke-dasharray='"+strDa+"' stroke-linecap='round'></circle>"+cirHtml;

                //百分比
                var d = ratio*100;
                var sD = sSum*100;
                var deviation = -40;

                if(i==0){
                    deviation = -45;
                }

                titHtml += "<span style='"+
                    "transform: translate(0px, 0px) rotate("+(deviation+1.8*(sD+d)-(1.8*(sD+d)-1.8*sD)/2)+"deg);"+
                    "position: absolute;"+
                    "left: "+distance+"px;"+
                    "top: "+distance+"px;"+
                    "font-size: 14px;"+
                    "color: #fff;"+
                    // "min-width: 10px;"+
                    // "min-height: 10px;"+
                    // "background-color: #000;"+
                    "transform-origin: "+origin+"px "+origin+"px 0;"+
                    "'><b style='"+
                    "position: absolute;"+
                    "font-weight: normal;"+
                    "top: 9px;"+
                    "left: -9px;"+
                    "min-width: 48px;"+
                    "transform-origin: left;"+
                    "transform: rotate(-45deg)"+
                    "'>"+Math.round(ratio*100)+'%'+"</b></span>";

                sSum += ratio;
            }
            othis.find('svg').html(cirHtml);
            othis.find('.titBox').html(titHtml);
            //添加填充-结束
        };
        othis.mainFun();

        $(window).on('resize',function(){
            othis.mainFun();
        });

        //制保留2位小数，如：2，会在2后面补上00.即2.00
        function toDecimal2(x) {
            var f = parseFloat(x);
            if (isNaN(f)) {
                return false;
            }
            f = Math.round(x*100)/100;
            var s = f.toString();
            var rs = s.indexOf('.');
            if (rs < 0) {
                rs = s.length;
                s += '.';
            }
            while (s.length <= rs + 2) {
                s += '0';
            }
            return parseFloat(s);
        }
    };

})(jQuery);

