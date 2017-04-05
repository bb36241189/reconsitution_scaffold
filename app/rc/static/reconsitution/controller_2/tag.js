/**
 * Created by shmily on 2017/2/14.
 */
app.controller('TagController',['$scope','$http','SAlert','PermitStatus',function ($scope,$http,SAlert,PermitStatus) {
    $(function(){
        set_navigator();
        disabled_button();
        init_tag_table("");

        click_create_tag();
        click_edit_tag();
        click_delete_tag();

        submit_create_tag();
        submit_edit_tag();
        submit_delete_tag();
        click_refresh_tag();

        keyup_search_tag();
        click_search_tag();

        init_color_picker();
        click_tag_table_tr();
        init_close_button();
    })

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_detail_data()});
    }

    function set_navigator(){
        if ($("#manage").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            $("#manage").removeClass('active');
            $("#manage").addClass('dhbg');
        }
        $(".navbar-words").html("管理 > 标签");
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

    function clear_detail_data(){
        $(".operation_2").animate({"right":"-1000px"});
    }

    function click_tag_table_tr(){
        $("#tag_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_2").stop(true).animate({"right":"-1000px"},function(){
                /*
                var checked_trs = $("#image_table tbody tr");
                checked_trs.each(function () {
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display', 'none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                init_image_detail(this_id);
                */
            }).animate({"right":"0px"});
        });

        $("#tag_table tbody tr").click(function(e){
            if(e.target.tagName!="TD"){

            }
            else{

            }
            if(e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")){
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {

                var checked_rooms = $("#tag_table tbody tr");
                checked_rooms.each(function(){
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display','none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });
                $(this).addClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").prop("checked", true);
            }

            if (checked_table_tr("#tag_table")){
                recover_button();
            }
            else{
                disabled_button();
            }
        });

    }

    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        if (checked_tr.length) {
            return true;
        }
        else {
            return false;
        }
    }

    function disabled_button(){
        $('#delete_tag').attr('disabled',"disabled");
        $("#delete_tag").addClass("disabled_button");
        $("#delete_tag").removeClass("danger_button");

        $('#edit_tag').attr('disabled',"disabled");
        $("#edit_tag").addClass("disabled_button");
        $("#edit_tag").removeClass("general_button");

        $('#delete_tag_resource').attr('disabled',"disabled");
        $("#delete_tag_resource").addClass("disabled_button");
        $("#delete_tag_resource").removeClass("danger_button");
    }

    function recover_button(){
        $('#delete_tag').removeAttr('disabled');
        $('#delete_tag').addClass("danger_button");
        $("#delete_tag").removeClass("disabled_button");

        $('#edit_tag').removeAttr('disabled');
        $('#edit_tag').addClass("general_button");
        $("#edit_tag").removeClass("disabled_button");

        $('#delete_tag_resource').removeAttr('disabled');
        $('#delete_tag_resource').addClass("danger_button");
        $("#delete_tag_resource").removeClass("disabled_button");
    }

    function init_tag_table(search_name){
        $.ajax({
            type: "GET",
            url: project_url + "/tags"+"?name="+search_name,
            async: true,
            dataType: "json",
            headers:{
                "RC-Token": $.cookie("token_id")
            },
            success: function(data){
                tag_table_pagination(data.tags);
            },
            error: function(e){
                //console.log(e);
                SAlert.showError(e);
            }
        });
    }

    function tag_table_pagination(data){
        var page_num=10;
        var data_length=data.length;
        if(!data_length || data_length<=page_num){
            render_tag_table(data);
            $("#tag_resource_pagination").hide();
            return;
        }
        $("#tag_resource_pagination").show();
        //加入分页的绑定
        $("#tag_resource_pagination").pagination(data_length, {
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
            render_tag_table(data.slice(start, end));
        }
    }

    function render_tag_table(data){
        disabled_button();

        var tags = $("#tag_tbody");
        clear_table_body("#tag_tbody");
        if (data.length){
            for(var i= 0,l=data.length;i<l;i++){
                var table_tr = $("<tr color='" + data[i].color + "'></tr>");
                table_tr.attr("id", data[i].id);

                var table_body = '<td><input type="checkbox"/></td>'+
                    //'<td><a class="animate_name"><span class="' + data[i].color + '_bg label span_color">'+data[i].name+'</span></a></td>' +
                    '<td><span class="' + data[i].color + '_bg resource-tag span_color">'+data[i].name+'</span></td>' +
                    '<td>'+data[i].create_time+'</td>'+
                    '<td>'+data[i].update_time+ '</td>';

                 table_tr.append(table_body);
                 tags.append(table_tr);
            }
            click_tag_table_tr();

            //set_network_default_checked();
        }
        else{
            var table_tr = '<tr><td colspan="7">没有标签</td></tr>';
            tags.append(table_tr);
        }
    }

    function click_create_tag(){
        $("#add_tag").click(function(){
            clear_create_tag_form();
            $("#submit_create_tag").addClass("form_general_button");
            $("#submit_create_tag").removeClass("disabled_button");
            $("#submit_create_tag").removeAttr("disabled");
        });
    }

    function click_edit_tag(){
        $("#edit_tag").click(function(){
            $("#submit_edit_tag").addClass("form_general_button");
            $("#submit_edit_tag").removeClass("disabled_button");
            $("#submit_edit_tag").removeAttr("disabled");
            var d= $("#tag_table tbody tr input[type=checkbox]:checked").parents("tr");
            $("#edit_name").val(d.find("td").eq(1).find("span").eq(0).html());
            $("#edit_color").val(d.attr("color"));
            $(".color-picker").removeClass("picker-selected");
            $(".color-picker[c='" + d.attr("color") + "']").addClass("picker-selected");

        });
    }

    function click_delete_tag(){
        $("#delete_tag").click(function(){
            $("#submit_delete_tag").addClass("form_danger_button");
            $("#submit_delete_tag").removeClass("disabled_button");
            $("#submit_delete_tag").removeAttr("disabled");
        })
    }

    function submit_create_tag(){
        $("#submit_create_tag").click(function(){
            var data = getFormObject("#create_tag_form");
            //console.log(data);
            if(!submitValidation("create_tag_form")){
                return;
            }
            delete data.confirm_passwd;
            //console.log(data);
            //return;
            $.ajax({
                type:"POST",
                url:project_url + "/tags",
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    "RC-Token": $.cookie("token_id")
                },
                success:function(msg){
                    //console.log(msg);
                    //$("#create_tag_modal").modal('hide');
                    location.reload();
                },
                error:function(e){
                    //alert("创建失败");
                    $("#create_tag_modal").modal('hide');
                    SAlert.showError(e);
                }
            });

            $("#submit_create_tag").addClass("disabled_button");
            $("#submit_create_tag").removeClass("form_general_button");
            $("#submit_create_tag").attr("disabled", "disabled");

        });
    }

    function submit_edit_tag(){
        $("#submit_edit_tag").click(function(){
            var data = getFormObject("#edit_tag_form");
            if(!submitValidation("edit_tag_form")){
                return;
            }
            var tag_id =  $("#tag_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //return;
            $.ajax({
                    type:"PUT",
                    url:project_url + "/tags/" + tag_id,
                    data: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        //console.log(msg);
                        $("#edit_tag_modal").modal('hide');
                        location.reload()
                    },
                    error:function(e){
                        $("#edit_tag_modal").modal('hide');
                        //alert("更新失败");
                        SAlert.showError(e);
                    }
                });

            $("#submit_edit_tag").addClass("disabled_button");
            $("#submit_edit_tag").removeClass("form_general_button");
            $("#submit_edit_tag").attr("disabled", "disabled");
        });
    }

    function submit_delete_tag(){
        $("#submit_delete_tag").click(function(){
            var tag_id =  $("#tag_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            //console.log(tag_id);
            var data = JSON.stringify({"tag_list":[tag_id]});

            $.ajax({
                    type:"DELETE",
                    url:project_url + "/tags",
                    data:data,
                    headers: {
                        "RC-Token": $.cookie("token_id")
                    },
                    success:function(msg){
                        //console.log(msg);
                        //$("#delete_tag_modal").modal('hide');
                        location.reload()
                    },
                    error:function(e){
                        $("#delete_tag_modal").modal('hide');
                        //alert("更新失败");
                        SAlert.showError(e);
                    }
                });

            $("#submit_delete_tag").addClass("disabled_button");
            $("#submit_delete_tag").removeClass("form_danger_button");
            $("#submit_delete_tag").attr("disabled", "disabled");
        });
    }

    function click_refresh_tag(){
        $("#refresh_tag").click(function(){
            init_tag_table("");
        })
    }

    function keyup_search_tag(){
        $("#search_tag_input").keyup(function(){
            //console.log($("#search_tag_input").val());
            init_tag_table($("#search_tag_input").val());
        });
    }

    function click_search_tag(){
        $("#search_tag_img").click(function(){
            init_tag_table($("#search_tag_input").val());
        });
    }

    function init_edit_form(data){
        //console.log(data);
        $("#edit_tag_name").val(data.eq(1).text());
        $("#edit_email").val(data.eq(2).text());
    }

    function clear_table_body(tbody_id){
        $(tbody_id).html("");
    }

    function clear_create_tag_form(){
        $("#create_name").val("");
        $(".color-picker").removeClass("picker-selected");
    }


    function init_color_picker(){
        $(".color-picker").click(function(){
            $(".color-picker").removeClass("picker-selected");
            $(this).addClass("picker-selected");
            $("#create_color").val($(this).attr("c"));
            $("#edit_color").val($(this).attr("c"));
        });
    }

    function keyup_search_volume(){
        $("#search_tag_input").keyup(function(){
            init_volume_table($("#search_tag_input").val());
        });
    }

    function click_search_volume(){
        $("#search_tag_img").click(function(){
            init_volume_table($("#search_tag_input").val());
        });
    }
}]);

