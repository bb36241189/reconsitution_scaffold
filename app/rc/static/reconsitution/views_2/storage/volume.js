/**
 * Created by lenovn on 2015/12/29.
 */

app.controller('VolumeController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function (){
        init_slider();
        disabled_button();
        init_volume_table("");

        click_load_volume();
        //click_edit_volume();
        click_refresh_volume();
        click_create_volume();
        click_create_snapshot();
        click_edit_volume();
        click_extend_volune();
        click_load_volume();
        click_unload_volume();

        click_delete_snapshot();
        click_edit_snapshot();

        click_submit_create_volume();
        click_submit_delete_volume();
        click_submit_edit_volume();
        click_submit_extend_volume();

        click_submit_load_volume();
        click_submit_unload_volume();
        click_submit_snapshot_volume();
        click_submit_edit_snapshot();
        click_submit_delete_snapshot();
        set_navigator();
        //setInterval(check_volume_status, 2000);
        //setInterval(check_snapshot_status, 2000);

        click_delete_volume();

        form_check_event();

        click_search_volume();
        keyup_search_volume();

        init_close_button();

        register_change_volumeType();
        click_submit_change_volumeType();

        $("#create_size").tooltip();
        $("#extend_size").tooltip();
    });

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_volume_detail_data()});
    }

    function set_navigator(){
        if ($("#storage_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            //console.log("has");
            $("#storage_resource").removeClass('active');
            $("#storage_resource").addClass('dhbg');
            //console.log($('#demo1:not(this)').children("li"));
        }
        $(".navbar-words").html("存储资源 > 云盘管理");
        //$("#storage_resource .sub-menu").css("display", "block");
    }

    var volume_interval = new Array();
    var snapshot_interval = new Array();

    //这个事件是在翻页时候用的
    function table_pagination(data){
            var data_length=data.length;
            var page_num=10;
            if(!data_length || data_length<=page_num){
                render_volume_table(data);
                $("#volume_pagination").hide();
                return;
            }
            $("#volume_pagination").show();
            //加入分页的绑定
            $("#volume_pagination").pagination(data_length, {
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
                render_volume_table(data.slice(start, end));
        }
    }

    function system_volume_table_pagination(data){
            var data_length=data.length;
            var page_num=10;
            if(!data_length || data_length<=page_num){
                render_system_volume_table(data);
                $("#system_volume_pagination").hide();
                return;
            }
            $("#system_volume_pagination").show();
            //加入分页的绑定
            $("#system_volume_pagination").pagination(data_length, {
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
                render_system_volume_table(data.slice(start, end));
        }
    }

    function volume_snapshot_table_pagination(data){
            var page_num=6;
            var data_length=data.length;
            //console.log(data_length);
            //console.log(data);
            /*
            if(!data_length){
                $("#room_table_num").hide();
            }
            $("#room_total_num").html(data_length);
            */
            if(!data_length || data_length<=page_num){
                $("#volume_snapshot_pagination").hide();
                render_volume_snapshot_table(data);
                return;
            }
            $("#volume_snapshot_pagination").show();
            //加入分页的绑定
            $("#volume_snapshot_pagination").pagination(data_length, {
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
                render_volume_snapshot_table(data.slice(start, end));
        }
    }

    function set_volume_default_checked(){
        $("#volume_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
        var tr_id = $("#volume_tbody").find("tr:eq(0)").attr("id");
        $("#volume_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);
        recover_button();

        get_volume_detail_data(tr_id);
        get_volume_snapshot_data(tr_id);
    }

    function set_snapshot_default_checked(){
        var tr_id = $("#volume_snapshot_tbody").find("tr:eq(0)").attr("id");
        $("#volume_snapshot_tbody").find("tr:eq(0)").addClass("snapshot_table_tr");
        $("#volume_snapshot_tbody").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);

        recover_snapshot_button();
        get_snapshot_detail_data(tr_id);
    }

    function init_slider(){
        $('#create_volume_slider').slider({
                formatter: function(value) {
                   return value;
                }
        });

        $('#extend_volume_slider').slider({
                formatter: function(value) {
                   return value;
                }
        });

        $('#create_volume_slider').change(function(obj){
            $("#create_size").val(obj.value.newValue);
        });

        $('#extend_volume_slider').change(function(obj){
            $("#extend_size").val(obj.value.newValue);
        });

        $("#create_size").change(function(){
           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#create_size").keyup(function(){

            $("#create_size").val($("#create_size").val().replace(/\D/g,''));

            if(parseInt($("#create_size").val())> 2000){
                $("#create_size").val("2000");
            }else if(parseInt($("#create_size").val())<1){
                $("#create_size").val("1");
            }

           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#create_size").bind("paste", function(event){

            $("#create_size").val($("#create_size").val().replace(/\D/g,''));

            console.log($("#create_size").val());
            if(parseInt($("#create_size").val())> 2000){
                $("#create_size").val("2000");
            }else if(parseInt($("#create_size").val())<1){
                $("#create_size").val("1");
            }

           $('#create_volume_slider').slider(
                "setValue", parseInt($("#create_size").val())
            );
        });

        $("#extend_size").change(function(){
           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

        $("#extend_size").keyup(function(){

            $("#extend_size").val($("#extend_size").val().replace(/\D/g,''));

            if(parseInt($("#extend_size").val())> 2000){
                $("#extend_size").val("2000");
            }else if(parseInt($("#extend_size").val())<1){
                $("#extend_size").val("1");
            }

           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

        $("#extend_size").bind("paste", function(event){

            $("#extend_size").val($("#extend_size").val().replace(/\D/g,''));

            console.log($("#extend_size").val());
            if(parseInt($("#extend_size").val())> 2000){
                $("#extend_size").val("2000");
            }else if(parseInt($("#extend_size").val())<1){
                $("#extend_size").val("1");
            }

           $('#extend_volume_slider').slider(
                "setValue", parseInt($("#extend_size").val())
            );
        });

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

    function click_volume_table_tr(){

        $("#volume_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");

            $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
                /*
                var checked_rooms = $("#volume_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                get_volume_detail_data(this_id);get_volume_snapshot_data(this_id);
                */
            }).animate({"right":"0px"});
        });

        $("#volume_table tbody tr").click(function(e){
            if(e.target.tagName!="TD"){
            }
            else{
                clear_volume_detail_data();
            }
            if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){

                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);

                clear_table_body("#volume_snapshot_tbody");
            }
            else {

                var checked_rooms = $("#volume_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);

                var this_id = $(this).attr("id");
                get_volume_detail_data(this_id);
                get_volume_snapshot_data(this_id);
                //console.log($(this).attr("id"));

            }

            if (checked_table_tr("#volume_table")){
                recover_button();
            }
            else{
                disabled_button();
            }

        });
    }

    function click_system_volume_tr(){

        $("#system_volume_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
            }).animate({"right":"0px"});
        });

        $("#system_volume_table tbody tr").click(function(e){
            if(e.target.tagName!="TD"){
            }
            else{
                clear_volume_detail_data();
            }
            if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){

                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);

                clear_table_body("#volume_snapshot_tbody");
            }
            else {
                var checked_rooms = $("#system_volume_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);

                var this_id = $(this).attr("id");
                get_volume_detail_data(this_id);
                get_volume_snapshot_data(this_id);
                //console.log($(this).attr("id"));
            }
        });
    }

    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        //console.log(checked_tr.length);
        if (checked_tr.length) {
            return true;
        }
        else {
            return false;
        }
    }

    function disabled_delete_button(){
        $('#delete_volume').removeAttr('data-target');
        //$("#delete_volume").css("cursor", "not-allowed");
        $('#delete_volume').addClass("disabled_li");
        $("#delete_volume").removeClass("danger_li");
    }

    function disabled_button(){

        disabled_delete_button();
        $("#snapshot_volume").css("cursor", "not-allowed");
        $('#snapshot_volume').attr('disabled',"disabled");
        $("#snapshot_volume").addClass("disabled_button");
        $("#snapshot_volume").removeClass("general_button");

        $('#edit_volume').removeAttr('data-target');
        //$("#edit_volume").css("cursor", "not-allowed");
        $("#edit_volume").addClass("disabled_li");
        $("#edit_volume").removeClass("dropmenu_li");


        disabled_extend_button();
        disabled_load_button();
        disabled_unload_button();
        disabled_snapshot_button();
        disabled_changeType_button();
    }

    function disabled_extend_button(){
        $('#extend_volume').removeAttr('data-target');
        $("#extend_volume").addClass("disabled_li");
        $("#extend_volume").removeClass("dropmenu_li");
    }

    function disabled_load_button(){
        //$("#load_volume").css("cursor", "not-allowed");
        $('#load_volume').removeAttr('data-target');
        $("#load_volume").addClass("disabled_li");
        $("#load_volume").removeClass("dropmenu_li");
    }

    function disabled_changeType_button(){
        $('#change_volume').removeAttr('data-target');
        $("#change_volume").addClass("disabled_li");
        $("#change_volume").removeClass("dropmenu_li");
    }

    function disabled_unload_button(){
       // $("#unload_volume").css("cursor", "not-allowed");
        $('#unload_volume').removeAttr('data-target');
        $("#unload_volume").addClass("disabled_li");
        $("#unload_volume").removeClass("dropmenu_li");
    }

    function disabled_snapshot_button(){
        $('#edit_snapshot').attr('disabled',"disabled");
        $("#edit_snapshot").css("cursor", "not-allowed");
        $("#edit_snapshot").addClass("disabled_button");

        disabled_snapshot_delete_button();
    }

    function disabled_snapshot_delete_button(){
        $('#delete_snapshot').attr('disabled',"disabled");
        $("#delete_snapshot").css("cursor", "not-allowed");
        $("#delete_snapshot").addClass("disabled_button");
    }

    function recover_snapshot_button(){
        $('#edit_snapshot').removeAttr('disabled');
        $("#edit_snapshot").css("cursor", "pointer");
        $("#edit_snapshot").removeClass("disabled_button");
        $("#edit_snapshot").addClass("general_button");

        $('#delete_snapshot').removeAttr('disabled');
        $("#delete_snapshot").css("cursor", "pointer");
        $("#delete_snapshot").removeClass("disabled_button");
        $("#delete_snapshot").addClass("danger_button");
    }

    function recover_delete_button(){
        $('#delete_volume').attr('data-target',"#delete_volume_modal");
        //$("#delete_volume").css("cursor", "pointer");
        $("#delete_volume").addClass("danger_li");
        $("#delete_volume").removeClass("disabled_li");
    }

    function recover_button(){

        recover_delete_button();

        $('#snapshot_volume').removeAttr('disabled');
        $("#snapshot_volume").css("cursor", "pointer");
        $("#snapshot_volume").removeClass("disabled_button");
        $("#snapshot_volume").addClass("general_button");


        $('#edit_volume').attr('data-target',"#edit_volume_modal");
        //$("#edit_volume").css("cursor", "pointer");
        $("#edit_volume").addClass("dropmenu_li");
        $("#edit_volume").removeClass("disabled_li");


        recover_extend_button();
        recover_load_button();
        recover_changeType_button();
        recover_unload_button();

    }

    function recover_extend_button(){
        $('#extend_volume').attr('data-target',"#extend_volume_modal");
        $("#extend_volume").addClass("dropmenu_li");
        $("#extend_volume").removeClass("disabled_li");
    }

    function recover_load_button(){
        //$("#load_volume").css("cursor", "pointer");
        $('#load_volume').attr('data-target',"#load_volume_modal");
        $("#load_volume").addClass("dropmenu_li");
        $("#load_volume").removeClass("disabled_li");
    }

    function recover_changeType_button(){
        //$("#load_volume").css("cursor", "pointer");
        $('#change_volume').attr('data-target',"#change_volumeType_modal");
        $("#change_volume").addClass("dropmenu_li");
        $("#change_volume").removeClass("disabled_li");
    }

    function recover_unload_button(){
        //$("#unload_volume").css("cursor", "pointer");
        $('#unload_volume').attr('data-target',"#unload_volume_modal");
        $("#unload_volume").addClass("dropmenu_li");
        $("#unload_volume").removeClass("disabled_li");
    }

    function init_volume_table(search_name){
        $.ajax({
            type: "GET",
            url: project_url + "/volumes"+"?name="+search_name,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                render_data(data);
                //table_pagination(data);
                //system_volume_table_pagination(data);
            },
            error: function(e){
                //console.log("error");
                SAlert.showError(e);
            }

        });
    }

    function render_data(data){
        //console.log(data);
        var system_volume = [];
        var data_volume = [];
        for(var i=0;i<data.length;i++){
            if(data[i].systemdevice && !data[i].attach_status){
                system_volume.push(data[i]);
            }else if(!data[i].systemdevice){
                data_volume.push(data[i]);
            }
        }
        //console.log(data_volume);
        //console.log(system_volume);
        table_pagination(data_volume);
        if($("#system_tab").length > 0){
            system_volume_table_pagination(system_volume);
        }


    }

    function render_volume_table(data){
        //console.log(data);
        disabled_button();
        clear_volume_detail_data();
        clear_table_body("#volume_snapshot_tbody");
        disabled_snapshot_button();
        $("#volume_snapshot_pagination").hide();

         var volumes = $("#volume_tbody");
        clear_table_body("#volume_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                table_tr.attr("volume_name", data[i].name);
                table_tr.attr("volume_type", data[i].volume_type);

                var status="";
                if(data[i].status=="in-use"){
                    status = "inuse";
                }
                else{
                    status = data[i].status;
                }
                var current_status =volume_status[status];
                //console.log(current_status);
                var loading="<span class='label label-" + volume_style[status] + "'>" + current_status + "</span>";
                if($.inArray(loading,volume_handle_status)>=0){
                    loading = '<div class="loading_gif">'+
                       '<img src="' + project_url + '/static/images/loading.gif" />'+" "+"<span class='label label-" + volume_style[status] + "'>" + current_status + "</span>"+ '</div>';
                    /*
                    loading = '<div class="loading">'+'</div>'+
                    '<div class="td_status">'+data[i].status+'</div>';*/
                }
                var volume_name ="";
                if (data[i].name){
                    volume_name = data[i].name;
                }else{
                    volume_name = data[i].instance_name + "系统盘";
                }
                var instance_name="暂无";
                if(data[i].instance_name){
                    instance_name=data[i].instance_name;
                }

                var mountpoint = "暂无";
                if(data[i].mountpoint){
                    mountpoint = data[i].mountpoint;
                }

                var table_body = '<td><input type="checkbox" /></td>'+
                    '<td title='+data[i].name+'><a class="animate_name">'+volume_name+'<a/></td>' +
                    '<td title='+data[i].size+'>'+data[i].size+'</td>' +
                    '<td title='+current_status+'>'+loading+'</td>'+
                    '<td title='+instance_name+'>'+ instance_name+ '</td>'+
                    '<td title='+mountpoint+'>'+ mountpoint+ '</td>'+
                    '<td title='+data[i].az+'>'+ data[i].az+ '</td>'+
                    '<td title='+data[i].volume_type+'>'+ data[i].volume_type+ '</td>'
                 table_tr.append(table_body);
                 volumes.append(table_tr);


            }
            //$("#current_num").html(data.length);
            click_volume_table_tr();

            //set_volume_default_checked();

            var handle =setInterval(check_volume_status, 2000);
            //console.log("volume create handle:"+handle);
            volume_interval.unshift(handle);
            //console.log("volume create array:"+volume_interval);
            //update_table_row(0, 3, {});
        }
        else{
            var table_tr = '<tr><td colspan="7">没有云盘</td></tr>';
            volumes.append(table_tr);
        }
    }

    function render_system_volume_table(data){
        //console.log(data);
        //disabled_button();
        clear_volume_detail_data();
        clear_table_body("#volume_snapshot_tbody");
        disabled_snapshot_button();
        $("#volume_snapshot_pagination").hide();

         var volumes = $("#system_volume_tbody");
        clear_table_body("#system_volume_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                //table_tr.attr("volume_name", data[i].name);

                var status="";
                if(data[i].status=="in-use"){
                    status = "inuse";
                }
                else{
                    status = data[i].status;
                }
                var current_status =volume_status[status];
                //console.log(current_status);
                var loading=current_status;
                if($.inArray(loading,volume_handle_status)>=0){
                    loading = '<div class="loading_gif">'+
                       '<img src="' + project_url + '/static/images/loading.gif" />'+" "+current_status+ '</div>';
                    /*
                    loading = '<div class="loading">'+'</div>'+
                    '<div class="td_status">'+data[i].status+'</div>';*/
                }
                var volume_name ="";
                if (data[i].name){
                    volume_name = data[i].name;
                }else{
                    volume_name = data[i].instance_name + "系统盘";
                }
                var instance_name="暂无";
                if(data[i].instance_name){
                    instance_name=data[i].instance_name;
                }

                var mountpoint = "暂无";
                if(data[i].mountpoint){
                    mountpoint = data[i].mountpoint;
                }

                var table_body = '<td><input type="checkbox" /></td>'+
                    '<td title='+data[i].name+'><a class="animate_name">'+volume_name+'<a/></td>' +
                    '<td title='+data[i].size+'>'+data[i].size+'</td>' +
                    '<td title='+current_status+'>'+loading+'</td>'+
                    '<td title='+instance_name+'>'+ instance_name+ '</td>'+
                    '<td title='+mountpoint+'>'+ mountpoint+ '</td>'+
                    '<td title='+data[i].az+'>'+ data[i].az+ '</td>'
                 table_tr.append(table_body);
                 volumes.append(table_tr);


            }
            click_system_volume_tr();

            var handle =setInterval(check_volume_status, 2000);
            //console.log("volume create handle:"+handle);
            volume_interval.unshift(handle);
            //console.log("volume create array:"+volume_interval);
            //update_table_row(0, 3, {});
        }
        else{
            var table_tr = '<tr><td colspan="7">没有云盘</td></tr>';
            volumes.append(table_tr);
        }
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function init_edit_volume_form(data){
        $("#edit_volume_form input[name='name']").val(data.name);
        $("#edit_volume_form textarea[name='description']").val(data.description);
    }

    function init_extend_volume_form(data){
        $("#current_size").text(data.size);
    }

    function click_submit_create_volume(){
        $("#submit_create_volume").click(function() {
            var data = getFormObject("#create_volume_form");
            var volume_size = $("#create_size").val();

            if(!volume_size){
                display_check_info("#create_size_div", false, "不能为空");
                return;
            }
            if(!check_create_volume_vaild(data)){
                return;
            }
            data.size = volume_size;
            $.ajax({
                type:"POST",
                url:project_url + "/volumes",
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    $("#create_volume_modal").modal('hide');
                    location.reload()
                },
                error:function(e){
                    $("#create_volume_modal").modal('hide');
                    console.log(e);
                    SAlert.showError(e)
                }
            });

            $("#submit_create_volume").addClass("disabled_button");
            $("#submit_create_volume").removeClass("form_general_button");
            $("#submit_create_volume").attr("disabled", "disabled")

        });
    }

    function click_submit_edit_volume(){
        $("#submit_edit_volume").click(function(){
            var data = getFormObject("#edit_volume_form");
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            console.log(data);
            //console.log(volume_id);
            if(!check_edit_volume_vaild(data)){
                return;
            }
            $.ajax({
                    type:"PUT",
                    url:project_url + "/volume/"+ volume_id,
                    data: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'RC-Token': $.cookie("token_id")
                    },
                    success:function(msg){
                        console.log(msg);
                        $("#edit_volume_modal").modal('hide');
                        location.reload()
                    },
                    error:function(e){
                        console.log(e);
                        $("#edit_volume_modal").modal('hide');
                        SAlert.showError(e);
                    }
                });

            $("#submit_edit_volume").addClass("disabled_button");
            $("#submit_edit_volume").removeClass("form_general_button");
            $("#submit_edit_volume").attr("disabled", "disabled");

        });
    }

    function click_submit_delete_volume(){
        $("#submit_delete_volume").click(function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            $.ajax({
                type:"DELETE",
                url:project_url + "/volume/"+volume_id,
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    location.reload();

                },
                error:function(e){
                    console.log(e);
                    $("#delete_volume_modal").modal('hide');
                    SAlert.showError(e)
                }
            });

            $("#submit_delete_volume").addClass("disabled_button");
            $("#submit_delete_volume").removeClass("form_danger_button");
            $("#submit_delete_volume").attr("disabled", "disabled");
        });
    }

    function click_submit_extend_volume(){
        $("#submit_extend_volume").click(function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var current_size = $("#current_size").html();
            var extend_size = $("#extend_size").val();
            var data = {
                action:"extend",
                size:extend_size
            };
            //console.log("current_size:"+current_size);
            //console.log("extend_size:"+extend_size);
            //console.log("extend_size:"+parseInt(extend_size));
            if(!extend_size){
                display_check_info("#extend_size_div", false, "不能为空");
                return
            }
            if(parseInt(extend_size)<=parseInt(current_size)){
                //console.log("extend size is small current size");
                display_check_info("#extend_size_div", false, "不能小于当前容量");
                return;
            }else{
                display_check_info("#extend_size_div", true, "");
            }

            $.ajax({
                type:"POST",
                url:project_url + "/volume/"+volume_id+"/action",
                data: JSON.stringify({"size": extend_size}),
                headers: {
                    'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    //$("#snapshot_volume_modal").modal('hide');
                    //get_volume_snapshot_data(volume_id);
                    location.reload();
                },
                error:function(e){
                    $("#extend_volume_modal").modal('hide');
                    //alert("创建快照失败"+err.responseText);
                    //console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_extend_volume").addClass("disabled_button");
            $("#submit_extend_volume").removeClass("form_general_button");
            $("#submit_extend_volume").attr("disabled", "disabled");
        });
    }

    function click_submit_load_volume(){
        $("#submit_load_volume").click(function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var server_id = $('#servers option:selected') .val()
            //console.log("volume_id"+volume_id);
            //console.log("server_id"+server_id);
            //disabled_load_button();
            if(!check_load_volume_form(server_id)){
                return;
            }
            $.ajax({
                type:"POST",
                url:project_url + "/servers/"+server_id+"/disk",
                data: JSON.stringify({"volume_id":volume_id}),
                headers: {
                    'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    $("#load_volume_modal").modal('hide');
                    location.reload();
                },
                error:function(e){
                    $("#load_volume_modal").modal('hide');
                    //alert("挂载失败"+err.responseText);
                    console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_load_volume").addClass("disabled_button");
            $("#submit_load_volume").removeClass("form_general_button");
            $("#submit_load_volume").attr("disabled", "disabled");

        });
    }

    function click_submit_unload_volume(){
        $("#submit_unload_volume").click(function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var server_id = $("#server_id").html();
            console.log(volume_id);
            console.log(server_id);

            $.ajax({
                type:"DELETE",
                url:project_url + "/servers/"+server_id+"/disk",
                data: JSON.stringify({"volume_id":volume_id}),
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    $("#unload_volume_modal").modal('hide');
                    location.reload();
                },
                error:function(e){
                    $("#unload_volume_modal").modal('hide');
                    //alert("卸载失败"+err.responseText);
                    console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_unload_volume").addClass("disabled_button");
            $("#submit_unload_volume").removeClass("form_general_button");
            $("#submit_unload_volume").attr("disabled", "disabled");
        });
    }

    function click_submit_snapshot_volume(){
        $("#submit_snapshot_volume").click(function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var volume_status = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").find('td').eq(3).text();
            var snapshot_data = getFormObject("#snapshot_volume_form");
            snapshot_data.volume_id = volume_id;
            if(volume_status != "可使用"){
                snapshot_data.force = true;
            }
            else{
                snapshot_data.force = false;
            }
            if(!check_create_snapshot_vaild(snapshot_data)){
                return;
            }
            $.ajax({
                type:"POST",
                url:project_url + "/snapshots",
                data: JSON.stringify(snapshot_data),
                headers: {
                    'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    $("#snapshot_volume_modal").modal('hide');
                    get_volume_snapshot_data(volume_id);
                    //location.reload();
                },
                error:function(e){
                    $("#snapshot_volume_modal").modal('hide');
                    //alert("创建快照失败"+err.responseText);
                    console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_snapshot_volume").addClass("disabled_button");
            $("#submit_snapshot_volume").removeClass("form_general_button");
            $("#submit_snapshot_volume").attr("disabled", "disabled");

        });
    }

    function click_submit_edit_snapshot(){
        $("#submit_edit_snapshot").click(function(){
            var snapshot_id = $("#volume_snapshot_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var snapshot_data = getFormObject("#edit_snapshot_form")
            if(!check_edit_snapshot_vaild(snapshot_data)){
                return;
            }

            $.ajax({
                type:"PUT",
                url:project_url + "/snapshot/" + snapshot_id,
                data: JSON.stringify(snapshot_data),
                headers: {
                    'Content-Type': 'application/json',
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    $("#edit_snapshot_modal").modal('hide');
                    get_volume_snapshot_data(volume_id);
                    //location.reload();
                },
                error:function(e){
                    console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_edit_snapshot").addClass("disabled_button");
            $("#submit_edit_snapshot").removeClass("form_general_button");
            $("#submit_edit_snapshot").attr("disabled", "disabled");

        });
    }

    function click_submit_delete_snapshot(){
        $("#submit_delete_snapshot").click(function(){
            var snapshot_id = $("#volume_snapshot_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            $.ajax({
                type:"DELETE",
                url:project_url + "/snapshot/" + snapshot_id,
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                success:function(msg){
                    console.log(msg);
                    $("#delete_snapshot_modal").modal('hide');
                    get_volume_snapshot_data(volume_id);
                    //location.reload();
                },
                error:function(e){
                    console.log(e);
                    SAlert.showError(e);
                }
            });

            $("#submit_delete_snapshot").addClass("disabled_button");
            $("#submit_delete_snapshot").removeClass("form_danger_button");
            $("#submit_delete_snapshot").attr("disabled", "disabled");
        });
    }

    function click_refresh_volume(){
        $("#refresh_volume").click(function(){
            init_volume_table("");
            clear_volume_detail_data();
            clear_snapshot_detail_data();
            clear_table_body("#volume_snapshot_tbody");
            disabled_snapshot_button();
            disabled_button();
        });
    }

    function click_create_volume(){
        $("#add_volume").click(function(){
            $("#submit_create_volume").addClass("form_general_button");
            $("#submit_create_volume").removeClass("disabled_button");
            $("#submit_create_volume").removeAttr("disabled");
            get_volume_type();
        });
    }

    function get_volume_type() {
        $.ajax({
            type: "GET",
            url: project_url + "/types",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            dataType: "json",
            success: function (data) {
                render_volume_type(data);
            },
            error: function (e) {
                SAlert.showError(e)
            }
        });
    }

    function render_volume_type(data){
        $("#create_volume_type").empty();
        var default_option = '<option selected="selected" value="">选择类型</option>';
        $("#create_volume_type").append(default_option);
        for(var i=0,l=data.length;i<l;i++){
            var select_option = $("<option></option>");
            select_option.attr("value",data[i].name);
            select_option.text(data[i].name);
            $("#create_volume_type").append(select_option);
        }
    }

    function click_create_snapshot(){
        $("#snapshot_volume").click(function(){
            $("#submit_snapshot_volume").addClass("form_general_button");
            $("#submit_snapshot_volume").removeClass("disabled_button");
            $("#submit_snapshot_volume").removeAttr("disabled");

            $("#create_snapshot_name_div").children(".desc").addClass("hide");
            $("#create_snapshot_description_div").children(".desc").addClass("hide");
            $("#create_snapshot_name").val("");
            $("#create_snapshot_description").val("");
        });
    }

    function click_edit_volume(){
        $("#edit_volume").click(function(){
            $("#submit_edit_volume").addClass("form_general_button");
            $("#submit_edit_volume").removeClass("disabled_button");
            $("#submit_edit_volume").removeAttr("disabled");
        });
    }

    function click_extend_volune(){
        $("#extend_volume").click(function(){
            $("#submit_extend_volume").addClass("form_general_button");
            $("#submit_extend_volume").removeClass("disabled_button");
            $("#submit_extend_volume").removeAttr("disabled");
        });
    }

    function click_load_volume(){
        $("#load_volume").click(function(){
            $("#submit_load_volume").addClass("form_general_button");
            $("#submit_load_volume").removeClass("disabled_button");
            $("#submit_load_volume").removeAttr("disabled");

            $.ajax({
                type:"GET",
                url:project_url + "/servers",
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                success:function(data){
                    if (data){
                        var server_data = JSON.parse(data);
                        //console.log(server_data);
                        init_load_volume_servers(server_data.servers);
                    }

                },
                error:function(e){
                    //console.log(e);
                    SAlert.showError(e);
                }
            });
        });
    }

    function click_delete_volume(){
        $("#delete_volume").click(function(){
            $("#submit_delete_volume").addClass("form_danger_button");
            $("#submit_delete_volume").removeClass("disabled_button");
            $("#submit_delete_volume").removeAttr("disabled");
        });
    }

    function click_unload_volume(){
        $("#unload_volume").click(function(){
            $("#submit_unload_volume").addClass("form_general_button");
            $("#submit_unload_volume").removeClass("disabled_button");
            $("#submit_unload_volume").removeAttr("disabled");
        });
    }

    function click_delete_snapshot(){
        $("#delete_snapshot").click(function(){
            $("#submit_delete_snapshot").addClass("form_danger_button");
            $("#submit_delete_snapshot").removeClass("disabled_button");
            $("#submit_delete_snapshot").removeAttr("disabled");
        });
    }

    function click_edit_snapshot(){
        $("#edit_snapshot").click(function(){
            $("#submit_edit_snapshot").addClass("form_general_button");
            $("#submit_edit_snapshot").removeClass("disabled_button");
            $("#submit_edit_snapshot").removeAttr("disabled");
        });
    }

    function get_volume_detail_data(volume_id){
        //console.log(volume_id);
        $.ajax({
            type:"GET",
            url:project_url + "/volume/" + volume_id,
            headers: {
                'RC-Token': $.cookie("token_id")
            },
            success:function(data){
                if (data){
                    var volume_data = JSON.parse(data);
                    //console.log(volume_data);
                    render_detail_data(volume_data);
                    init_edit_volume_form(volume_data);

                    init_load_volume_form(volume_data);

                    init_unload_volume_form(volume_data);

                    update_button_status(volume_data);

                    init_extend_volume_form(volume_data);
                }

            },
            error:function(e){
                console.log(e);
                SAlert.showError(e);
            }
        });
    }

    function render_detail_data(data){
        //console.log(data);
        var current_status = "";
        if(data.status=="in-use"){
            current_status="inuse"
        }else{
            current_status=data.status
        }
        $(".volume_detail_content td[name='name']").text(data.name);
        $(".volume_detail_content td[name='size']").text(data.size+"G");
        $(".volume_detail_content td[name='status']").html("<span class='label label-" + volume_style[current_status] + "'>" + volume_status[current_status] + "</span>");
        $(".volume_detail_content td[name='host']").text(data.host);
        $(".volume_detail_content td[name='az']").text(data.az);
        $(".volume_detail_content td[name='instance_name']").text(data.instance_name);
        $(".volume_detail_content td[name='mountpoint']").text(data.mountpoint);
        //$(".volume_detail_content dl dt span[name='attach_status']").text(data.attach_status);
        //$(".volume_detail_content dl dt span[name='attach_time']").text(data.attach_time);
        $(".volume_detail_content td[name='created_at']").text(data.created_at);
        $(".volume_detail_content td[name='description']").text(data.description);
    }

    function clear_volume_detail_data(){
        $(".operation_2").animate({"right":"-1000px"});
        $(".volume_detail_content td[name='name']").html("");
        $(".volume_detail_content td[name='size']").html("");
        $(".volume_detail_content td[name='status']").html("");
        $(".volume_detail_content td[name='host']").html("");
        $(".volume_detail_content td[name='az']").html("");
        $(".volume_detail_content td[name='instance_name']").html("");
        $(".volume_detail_content td[name='mountpoint']").html("");
        //$(".volume_detail_content dl dt span[name='attach_status']").html("");
        //$(".volume_detail_content dl dt span[name='attach_time']").html("");
        $(".volume_detail_content td[name='created_at']").html("");
        $(".volume_detail_content td[name='description']").html("");
    }

    function init_load_volume_form(data){
        //console.log(data);
        $("#load_volume_form span[name='volume_name']").html(data.name);
    }

    function init_load_volume_servers(data){
        $("#servers").empty();
        var default_option = '<option value="">请选择虚拟机</option>';
        $("#servers").append(default_option);
        if(data.length){
            for (var i=0;i<data.length;i++){
                //console.log(data[i].id);
                //console.log(data[i].status);
                if(data[i].status != "active"){
                    continue;
                }
                var server_option = $("<option></option>");
                server_option.attr("value",data[i].id);
                server_option.text(data[i].name );
                $("#servers").append(server_option);
            }
        }
    }

    function init_unload_volume_form(data){
        //console.log(data);
        $("#server_id").html(data.instance_id);
        $("#server_name").html(data.instance_name);
    }

    function update_button_status(data){
        if(data.status=="error"){
            disabled_button();
            recover_delete_button();
        }
        else{
            if(data.instance_id){
                disabled_load_button();
                recover_unload_button();
                disabled_changeType_button();
            }
            else{
                disabled_unload_button();
                recover_load_button();
                recover_changeType_button();
            }
            if(data.status!="available"){
                disabled_extend_button();
                disabled_delete_button();
            }
        }

        if(!data.name){
            disabled_button();
            recover_delete_button();
        }
    }

    function get_volume_snapshot_data(volume_id){
        $.ajax({
            type:"GET",
            url:project_url + "/snapshots?"+"volume_id="+volume_id,
            headers: {
                'RC-Token': $.cookie("token_id")
            },
            success:function(data){
                var snapshot_data = JSON.parse(data);
                //console.log(volume_id);
                //console.log(snapshot_data);
                //render_volume_snapshot_table(snapshot_data);
                volume_snapshot_table_pagination(snapshot_data);
            },
            error:function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    function render_volume_snapshot_table(data){
        if (data.length){
            //console.log(data)
            var snapshots = $("#volume_snapshot_tbody");
            clear_table_body("#volume_snapshot_tbody");
            for(var i= 0;i<data.length;i++){
                var table_tr = $("<tr></tr>");
                table_tr.attr("id", data[i].id);
                table_tr.attr("instance_id", data[i].instance_id);

                var current_status =volume_status[data[i].status];
                var loading=current_status;
                if($.inArray(loading,volume_handle_status)>=0){
                    loading = '<div class="loading_gif">'+
                       '<img src="' + project_url + '/static/images/loading.gif" />'+" "+current_status+ '</div>';
                }
                var volume_type = "";
                if(data[i].instance_id){
                    volume_type = "虚拟机快照";
                }else{
                    volume_type = "云盘快照";
                }

                var table_body = '<td><input type="checkbox"/></td>'+
                    '<td title='+data[i].name+'>'+data[i].name+'</td>' +
                    '<td title='+current_status+'>'+loading+'</td>'+
                    '<td title='+volume_type+'>'+volume_type +'</td>'+
                    '<td title='+data[i].created_at+'>'+ data[i].created_at+ '</td>';
                 table_tr.append(table_body);
                 snapshots.append(table_tr);
            }
            click_snapshot_table_tr();
            disabled_snapshot_button();
            clear_snapshot_detail_data();

            //set_snapshot_default_checked();

            var  handle= setInterval(check_snapshot_status, 2000);
            //console.log("snap create:"+handle);
            snapshot_interval.unshift(handle);
            //console.log("snap create interval:"+snapshot_interval);
        }
        else{
            clear_table_body("#volume_snapshot_tbody");
            var table_tr = '<tr><td colspan="5">没有快照</td></tr>';
            $("#volume_snapshot_tbody").append(table_tr);
            disabled_snapshot_button();
        }
    }

    function click_snapshot_table_tr(){
        $("#volume_snapshot_table tbody tr").click(function(){
            if($(this).hasClass("snapshot_table_tr")){
                $(this).removeClass("snapshot_table_tr");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);

                clear_snapshot_detail_data();
            }
            else {
                var checked_snapshots = $("#volume_snapshot_table tbody tr");
                checked_snapshots.each(function(){
                    $(this).removeClass("snapshot_table_tr");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("snapshot_table_tr");
                //$(this).children("td").eq(0).find("input").css('display','block');
                $(this).children("td").eq(0).find("input").prop("checked", true);

                get_snapshot_detail_data($(this).attr("id"));
            }

            if (checked_table_tr("#volume_snapshot_table")){
                recover_snapshot_button();
                if($(this).attr("instance_id")){
                    disabled_snapshot_delete_button();
                }
            }
            else{
                disabled_snapshot_button();
            }

        });
    }

    function get_snapshot_detail_data(snapshot_id){
        $.ajax({
            type:"GET",
            url:project_url + "/snapshot/"+snapshot_id,
            headers: {
                'RC-Token': $.cookie("token_id")
            },
            success:function(data){
                var snapshot_data = JSON.parse(data);
                //console.log(snapshot_data);
                //render_snapshot_detail_data(snapshot_data);
                init_edit_snapshot_form(snapshot_data);
            },
            error:function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    function render_snapshot_detail_data(data){
        $(".snapshot_detail_content dl dt span[name='name']").text(data.name);
        $(".snapshot_detail_content dl dt span[name='status']").text(data.status);
        $(".snapshot_detail_content dl dt span[name='created_at']").text(data.created_at);
        $(".snapshot_detail_content dl dt span[name='description']").text(data.description);

    }

    function clear_snapshot_detail_data(){
        $(".snapshot_detail_content dl dt span[name='name']").html("");
        $(".snapshot_detail_content dl dt span[name='status']").html("");
        $(".snapshot_detail_content dl dt span[name='created_at']").html("");
        $(".snapshot_detail_content dl dt span[name='description']").html("");
    }

    function init_edit_snapshot_form(data){
        $("#edit_snapshot_form input[name='name']").val(data.name);
        $("#edit_snapshot_form textarea[name='description']").html(data.description);
    }

    var volume_handle_status= ["创建中", "挂载中", "卸载中", "删除中", "扩容中"];
    var volume_status = {
        creating: "创建中",
        attaching: "挂载中",
        detaching: "卸载中",
        deleting: "删除中",
        available: "可使用",
        inuse: "使用中",
        error: "错误",
        error_extending: "扩容失败",
        extending: "扩容中"
    };
    var volume_style = {
        creating: "warning",
        attaching: "warning",
        detaching: "warning",
        deleting: "warning",
        available: "success",
        inuse: "success",
        error: "danger",
        error_extending: "danger",
        extending: "warning"
    };

    function update_volume_row(row_id, col_id, data){
        var tr = $("#volume_tbody tr").eq(row_id);
        var current_status = "";
        if(data.status=="in-use"){
            current_status="inuse";
        }else{
            current_status=data.status;
        }
        var instance_name="暂无";
        if(data.instance_name){
            instance_name = data.instance_name;
        }
        var mountpoint = "暂无";
        if(data.mountpoint){
            mountpoint = data.mountpoint;
        }
        var status=volume_status[current_status];
        if($.inArray(status,volume_handle_status)<0){
            init_volume_table("");
            //tr.find('td').eq(col_id).text(status);
            //tr.find('td').eq(col_id+1).text(instance_name);
            //tr.find('td').eq(col_id+2).text(mountpoint);
            if(tr.hasClass("table_body_tr_change")){
                render_detail_data(data);
                update_button_status(data);
            }

        }
    }

    function check_volume_status(){
        var volume_trs = $("#volume_tbody tr");
        var num=0;
        if(volume_trs.length){
            var col_id = 3;
            volume_trs.each(function(){
                var status = $.trim($(this).find('td').eq(col_id).text());
                if($.inArray(status,volume_handle_status)>=0){
                    num +=1;
                    //console.log($(this).index());
                    update_volume_status($(this).attr("id"), $(this).index(), col_id);
                }
            });
        }

        //console.log("volume_num"+num);
        if(num==0){
            var handle = volume_interval.pop();
            //console.log("volume stop handle:"+handle);
            clearInterval(handle);
            //console.log("volume stop array:"+volume_interval);
        }
    }

    function update_volume_status(volume_id, row_id, col_id){
        $.ajax({
            type:"GET",
            url:project_url + "/volume/" + volume_id,
            headers: {
                'RC-Token': $.cookie("token_id")
            },
            success:function(data){
                if (data){
                    var volume_data = JSON.parse(data);
                    update_volume_row(row_id, col_id, volume_data);
                }
            },
            error:function(e){
                //location.reload();
                //console.log(e);
                if(e.status == 404){
                    init_volume_table("");
                    return
                }
                SAlert.showError(e);
            }
        });
    }

    function check_snapshot_status(){
        var snapshot_trs = $("#volume_snapshot_tbody tr");
        var num=0;
        if(snapshot_trs.length){
            var s_col_id = 2;
            snapshot_trs.each(function(){
                var status = $.trim($(this).find('td').eq(s_col_id).text());
                if($.inArray(status,volume_handle_status)>=0){
                    num +=1;
                    update_snapshot_status($(this).attr("id"), $(this).index(), s_col_id);
                }
            });
        }
        //console.log("snap_num"+num);
        if(num==0){
            var handle = snapshot_interval.pop();
            //console.log("snap stop intercal:"+handle);
            clearInterval(handle);
            //console.log("snap stop array:"+snapshot_interval);
        }
    }

    function update_snapshot_status(snapshot_id, row_id, col_id){
        var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        $.ajax({
            type:"GET",
            url:project_url + "/snapshot/"+snapshot_id,
            headers: {
                'RC-Token': $.cookie("token_id")
            },
            success:function(data){
                var snapshot_data = JSON.parse(data);
                update_snapshot_row(row_id, col_id, snapshot_data);
                //update_table_row(row_id, col_id, snapshot_data);
            },
            error:function(e){
                if(e.status == 404){
                    get_volume_snapshot_data(volume_id);
                    return;
                }

                SAlert.showError(e);
            }
        });
    }

    function update_snapshot_row(row_id, col_id, data){
        var tr = $("#volume_snapshot_tbody tr").eq(row_id);
        var status = volume_status[data.status];
        var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
        if($.inArray(status,volume_handle_status)<0){
            // tr.find('td').eq(col_id).text(status);
            get_volume_snapshot_data(volume_id);
        }
    }

    //check form
    function check_create_volume_vaild(data){
        var name_check = check_name_vaild(data.name, "#create_volume_name_div");
        var desc_check = check_description_vaild(data.description, "#create_volume_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_edit_volume_vaild(data){
        var name_check = check_name_vaild(data.name, "#edit_volume_name_div");
        var desc_check = check_description_vaild(data.description, "#edit_volume_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_create_snapshot_vaild(data){
        var name_check = check_name_vaild(data.name, "#create_snapshot_name_div");
        var desc_check = check_description_vaild(data.description, "#create_snapshot_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_edit_snapshot_vaild(data){
        var name_check = check_name_vaild(data.name, "#edit_snapshot_name_div");
        var desc_check = check_description_vaild(data.description, "#edit_snapshot_description_div");
        if(name_check && desc_check){
            return true;
        }else{
            return false;
        }
    }

    function check_load_volume_form(server_id){
        var server_check = check_servers_vaild(server_id, "#load_volume_div");
        if(server_check){
            return true;
        }else{
            return false;
        }
    }

    function form_check_event(){
        $("#create_volume_name").blur(function(){
            var input_name = $("#create_volume_name").val();
            check_name_vaild(input_name, "#create_volume_name_div");
        });

        $("#edit_volume_name").blur(function(){
            var input_name = $("#edit_volume_name").val();
            check_name_vaild(input_name, "#edit_volume_name_div");
        });

        $("#create_description").blur(function(){
           var input_desc = $("#create_description").val();
            check_description_vaild(input_desc, "#create_volume_description_div");
        });

        $("#edit_volume_description").blur(function(){
           var input_desc = $("#edit_volume_description").val();
            check_description_vaild(input_desc, "#edit_volume_description_div");
        });

        $("#create_snapshot_name").blur(function(){
            var input_name = $("#create_snapshot_name").val();
            check_name_vaild(input_name, "#create_snapshot_name_div");
        });

        $("#edit_snapshot_name").blur(function(){
            var input_name = $("#edit_snapshot_name").val();
            check_name_vaild(input_name, "#edit_snapshot_name_div");
        });

        $("#create_snapshot_description").blur(function(){
           var input_desc = $("#create_snapshot_description").val();
            check_description_vaild(input_desc, "#create_snapshot_description_div");
        });

        $("#create_volume_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_volume_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#create_snapshot_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_snapshot_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#edit_snapshot_description").blur(function(){
            var input_desc = $("#edit_snapshot_description").val();
            check_description_vaild(input_desc, "#edit_snapshot_description_div");
        });

        $("#servers").change(function(){
            var server_id = $("#servers").val();
            //console.log(server_id);
            check_servers_vaild(server_id, "#load_volume_div");
        });
    }

    function display_check_info(check_div, success, message){
        if(success){
            $(check_div +  " .success").removeClass("hide");
            $(check_div + " .error").addClass("hide");
            $(check_div+ " .error_info").addClass("hide");

            return true;
        }else{
            $(check_div + " .success").addClass("hide");
            $(check_div + " .error").removeClass("hide");
            $(check_div + " .error_info").removeClass("hide");
            $(check_div + " .error_info" + " span").html(message);

            return false;
        }
    }

    function check_name_vaild(name, name_div){
        if(name){
            if(name.length>=1 && name.length<=60){
                if(check_name_format(name)){
                    return display_check_info(name_div, true, "")
                }else{
                    return display_check_info(name_div, false, "格式不正确")
                }
            }else{
                return display_check_info(name_div, false, "长度范围为1-60个字符")
            }

        }else{
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_name_format(name){
        return true;
    }

    function check_description_vaild(desc, desc_div){
        if(desc.length>255){
            return display_check_info(desc_div, false, "长度范围为0-255个字符");
        }else{
            return display_check_info(desc_div, true, "");
        }
    }

    function check_servers_vaild(server, server_div){
        if(server){
            return display_check_info(server_div, true, "");
        }else{
            return display_check_info(server_div, false, "请选择一个挂载的虚拟机");
        }
    }

    function keyup_search_volume(){
        $("#search_volume_input").keyup(function(){
            //console.log($("#search_volume_input").val());
            init_volume_table($("#search_volume_input").val());
        });
    }

    function click_search_volume(){
        $("#search_volume_img").click(function(){
            init_volume_table($("#search_volume_input").val());
        });
    }

    function register_change_volumeType(){
        $("#change_volumeType_modal").on("show.bs.modal",function(){
            var volume_id = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var volume_type = $("#volume_table tbody tr input[type=checkbox]:checked").parents("tr").attr("volume_type");
            $("#input_change_volumeType").val(volume_id);

            $.ajax({
                type:"GET",
                url:project_url + "/types",
                headers:{
                    "RC-Token": $.cookie("token_id")
                },
                dataType:"json",
                success:function(data){
                    var select_id = "select_change_volumeType";
                    $("#" + select_id).html("");
                    for(var i=0;i<data.length;i++){
                        var op = $("<option value='" + data[i].name + "'>" + data[i].name + "</option>");
                        $("#" + select_id).append(op);
                    }
                    $("#select_change_volumeType").val(volume_type);
                    console.log(volume_type)
                },
                error:function(e){
                    SAlert.showError(e);
                }
            })
        });
    }

    function click_submit_change_volumeType(){
        $("#submit_change_volumeType").click(function(){
            var volume_id = $("#input_change_volumeType").val();
            var data = {
                action:"retype",
                new_type:$("#select_change_volumeType").val()
            };
            $.ajax({
                type:"POST",
                url:project_url + "/volume/" + volume_id + "/action",
                headers: {
                    'RC-Token': $.cookie("token_id")
                },
                data:JSON.stringify(data),
                success:function(msg){
                    init_volume_table("");
                    $("#change_volumeType_modal").modal('hide');
                },
                error:function(e){
                    console.log(e);
                    $("#change_volumeType_modal").modal('hide');
                    SAlert.showError(e)
                }
            });
        });
    }

}]);