app.controller('imageController',['$scope','SAlert',function ($scope,SAlert) {
    var image_interval = [];

    var image_handle_status = ["处理中", "删除中", "排队中"];

    var image_status = {
        'active': "可用",
        'queued': "排队中",
        'deleting': "删除中",
        'deleted': "删除中",
        'error': "错误",
        'saving': "处理中"
    };

    $(function () {
        get_all_images("");
        disabled_button();
        set_navigator();

        form_check_event();

        click_search_image();
        keyup_search_image();
        init_close_button();
        set_export_href();
    });

    function set_export_href() {
        var export_url = project_url + "/export/export_image/";
        $("#export_record").attr("href", export_url);
    }

    function init_close_button() {
        $("#btn_close_detail").click(function () {
            clear_detail_data()
        });
    }

    function set_navigator() {
        if ($("#compute_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            //console.log("has");
            $("#compute_resource").removeClass('active');
            $("#compute_resource").addClass('dhbg');
            //console.log($('#demo1:not(this)').children("li"));
        }
        $(".navbar-words").html("计算资源 > 镜像管理");

        //$("#compute_resource .sub-menu").css("display", "block");
    }

    function image_table_pagination(data) {
        var page_num = 10;
        var data_length = data.length;
        if (!data_length || data_length <= page_num) {
            render_image_list(data);
            $("#image_pagination").hide();
            return;
        }
        $("#image_pagination").show();
        //加入分页的绑定
        $("#image_pagination").pagination(data_length, {
            callback: pageselectCallback,
            prev_text: '< 上一页',
            next_text: '下一页 >',
            items_per_page: page_num,
            num_display_entries: 4,
            current_page: 0,
            num_edge_entries: 1
        });
        //这个事件是在翻页时候用的
        function pageselectCallback(page_id, jq) {
            var start = page_id * page_num;
            var end = start + page_num;
            if (end > data_length) {
                end = start + data_length % page_num;
            }
            render_image_list(data.slice(start, end));
        }
    }

    function set_image_default_checked() {
        $("#image_list").find("tr:eq(0)").addClass("table_body_tr_change");
        var tr_id = $("#image_list").find("tr:eq(0)").attr("id");
        $("#image_list").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);

        enabled_button();
        init_image_detail(tr_id);
    }

    function get_all_images(search_name) {
        var path = project_url + "/images" + "?name=" + search_name;
        $.ajax({
            type: "GET",
            url: path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                //render_image_list(data);
                //console.log(data);
                image_table_pagination(data);
            },
            error: function (e) {
                //console.log(JSON.stringify(e));
                SAlert.showError(e);
            }
        });
    }

    function render_image_list(data) {
        disabled_button();
        clear_detail_data();

        var $images = $("#image_list");
        $images.html("");
        if (data.length) {
            var images = data;
            for (var i = 0, l = images.length; i < l; i++) {
                var $table_tr = $("<tr></tr>");
                $table_tr.attr("id", images[i].id);

                var _image_status = image_status[images[i].status];
                var loading = _image_status;
                if ($.inArray(_image_status, image_handle_status) >= 0) {
                    loading = '<div class="loading_gif">' +
                        '<img src="' + project_url + '/static/images/loading.gif" />' + " " + _image_status + '</div>';
                }

                var size = images[i].size;
                if(size == ""){
                    size = "暂无"
                }
                var os_img = "";
                switch(images[i].type){
                    case "linux":
                        os_img = "linux.png";
                        break;
                    case "windows":
                        os_img = "windows.png";
                        break;
                    default:
                        os_img = "unknown.png";
                        break;
                }

                var table_body =
                    '<td><input type="checkbox"></td>' +
                    '<td item_tag="image_name"><a class="animate_name">' + images[i].name + '</a></td>' +
                    '<td title=' + _image_status +'>' + loading + '</td>' +
                    '<td>' + images[i].disk_format + '</td>' +
                    '<td>' + size + '</td>' +
                    '<td><img width="20px" height="20px" src="' + project_url + '/static/images/operation_system/'+ os_img + '"/> ' + images[i].type + '</td>';

                $table_tr.append(table_body);
                $images.append($table_tr);
            }
            click_image_table_tr();

            if (image_interval.length == 0) {
                var handle = setInterval(check_image_status, 5000);
                image_interval.push(handle);
            }
        }
        else {
            var table_tr = '<tr><td colspan="6">没有镜像</td></tr>';
            $images.append(table_tr);
        }
    }

    function check_image_status() {
        var image_trs = $("#image_list tr");
        var num = 0;
        if (image_trs.length) {
            var status_col_index = 2;
            image_trs.each(function () {
                var image_id = $(this).attr("id");
                var status = $.trim($(this).find('td').eq(status_col_index).text());
                if ($.inArray(status, image_handle_status) >= 0) {
                    num += 1;
                    update_image_status(image_id, $(this).index(), status_col_index);
                }
            });
        }
        if (num == 0) {
            var handle = image_interval.pop();
            clearInterval(handle);
        }
    }

    function click_image_table_tr() {
        $("#image_table .animate_name").click(function (e) {
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_2").animate({"right": "-1000px"}, function () {
                /*
                 var checked_trs = $("#image_table tbody tr");
                 checked_trs.each(function () {
                 $(this).removeClass("table_body_tr_change");
                 //$(this).children("td").eq(0).find("input").css('display', 'none');
                 $(this).children("td").eq(0).find("input").prop("checked", false);
                 });
                 init_image_detail(this_id);
                 */
            }).animate({"right": "0px"});
        });

        $("#image_table tbody tr").click(function (e) {
            if (e.target.tagName != "TD") {

            }
            else {
                clear_detail_data();
            }

            //console.log("click a tbody row");
            if (e.target.tagName == "TD" && $(this).hasClass("table_body_tr_change")) {
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_trs = $("#image_table tbody tr");
                checked_trs.each(function () {
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display', 'none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'block');
                $(this).children("td").eq(0).find("input").prop("checked", true);
                var this_id = $(this).attr("id");
                init_image_detail(this_id);
            }

            //console.log("whether been checked: " + $("#image_table tbody tr input:checked").length);
            if ($("#image_table tbody tr input:checked").length) {
                enabled_button();
            }
            else {
                disabled_button();
            }

        });
    }

    function update_image_status(image_id, row_id, col_id) {
        var root_path = project_url + "/image/";
        var query_path = root_path + image_id;

        $.ajax({
            type: "GET",
            url: query_path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                update_image_row(row_id, col_id, data);
            },
            error: function (e) {
                if (e.status == 404) {
                    $("#refresh_image").click()
                } else {
                    SAlert.showError(e)
                }
            }
        });
    }

    function update_image_row(row_id, col_id, data) {
        var tr = $("#image_list tr").eq(row_id);
        console.debug("upload data is: ", data);
        var status = image_status[data.status];
        console.log("Update image :" + status + " ,Origin status is:" + data.status);

        var status_td = $(tr).children().eq(col_id);
        if ($.inArray(status, image_handle_status) < 0) {
            //$(status_td).html(status).attr("title", status);
            $("#refresh_image").click()
        }
    }

    function clear_detail_data() {
        var $images = $("#image_details");
        $images.html("");
        $(".operation_2").animate({"right": "-1000px"});
    }

    function init_image_detail(image_id) {
        var root_path = project_url + "/image/";
        var query_path = root_path + image_id;
        $.ajax({
            type: "GET",
            url: query_path,
            dataType: "json",
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function (data) {
                render_detail_table(data);
                init_edit_form(data);
            },
            error: function (e) {
                SAlert.showError(e);
            }
        });
    }

    /*
     Define button init click status
     */
    function disabled_button() {
        $('#delete_image')
            .attr('disabled', "disabled")
            .addClass("disabled_button")
            .removeClass("danger_button");

        $('#edit_image')
            .attr('disabled', "disabled")
            .addClass("disabled_button")
            .removeClass("general_button");
        $('#download_image')
            .attr('disabled', "disabled")
            .addClass("disabled_button")
            .removeClass("general_button");
    }

    function enabled_button() {
        $('#delete_image')
            .removeAttr('disabled')
            .addClass("danger_button")
            .removeClass("disabled_button");
        $('#edit_image')
            .removeAttr('disabled')
            .addClass("general_button")
            .removeClass("disabled_button");
        $('#download_image')
            .removeAttr('disabled')
            .addClass("general_button")
            .removeClass("disabled_button");
    }

    function render_detail_table(data) {
        if (data) {
            var image = data;
            render_image_detail(image);
        }
    }

    function render_image_detail(image) {
        var $images = $("#image_details");
        $images.html("");
        var $scroll_div = $('<div class="gundongtiao"></div>');


        var is_public = image.is_public;
        if (is_public == '1') {
            is_public = "共享"
        } else {
            is_public = "非共享"
        }

        var status = image.status;
        var status_class = 'label-success';
        if (status == "active") {
            status = "可用"
        }
        else {
            status_class = 'label-danger';
        }

        var os_type = image.os_type;
        if (os_type == "" || os_type == null) {
            os_type = "暂无"
        }

        var description = image.description;
        if (description == "" || description == null) {
            description = "暂无"
        }

        var protect = image.protected;
        var protect_class = 'label-info';
        if (protect == "1") {
            protect = "被保护中";
            protect_class = 'label-info';
        } else {
            protect = "未被保护";
            protect_class = 'label-warning';
        }

        var image_detail_body =
            /*
             "<div class='detail_block'>" +
             "<span>镜像大小</span>" +
             "<h3>"  + image.size +  "Mb" + "</h3>" +
             "</div>" +
             "<div class='detail_block'>" +
             "<span>镜像格式</span>" +
             "<h3>"  + image.disk_format + "</h3>" +
             "</div>" +
             "<div class='detail_block'>" +
             "<span>系统信息</span>" +
             "<h3>"  + os_type + "</h3>" +
             "</div>" +
             "<div class='clear_both'/>" +
             "<div class='split_line'></div>" +
             "<div class='detail_span'>" +
             "<span class='label " + status_class + "'>"  + status + "</span>" +
             "<span class='label label-primary'>"  + is_public + "</span>" +
             "<span class='label " + protect_class + "'>"  + protect + "</span>" +
             "</div>" +
             "<div class='split_line'></div>" +

            "<dl>" +
            "<dt>镜像UUID :  " + "<span>" + image.id + "</span>" + "</dt>" +
            "<dt>镜像名称 :  " + "<span>" + image.name + "</span>" + "</dt>" +
            "<dt>镜像状态 :  " + "<span class='label " + status_class + "'>" + status + "</span>" + "</dt>" +
            "<dt>镜像格式 :  " + "<span>" + image.disk_format + "</span>" + "</dt>" +
            "<dt>镜像大小 :  " + "<span>" + image.size + "Mb" + "</span>" + "</dt>" +
            "<dt>系统信息 :  " + "<span>" + os_type + "</span>" + "</dt>" +
            "<dt>创建时间 :  " + "<span>" + image.created_at + "</span>" + "</dt>" +
            "<dt>是否共享 :  " + "<span>" + is_public + "</span>" + "</dt>" +
            "<dt>是否被保护 :  " + "<span>" + protect + "</span>" + "</dt>" +
            "<dt>镜像描述信息 :  " + "<span>" + description + "</span>" + "</dt>" +
            "</dl>";

            */
            "<span style='font-size:16px;'>" + image.name + "</span>" +
            "<table class='showTable'>" +
                "<tr><th>镜像UUID</th>" + "<td>" + image.id + "</td>" + "</tr>" +
                "<tr><th>镜像名称</th>" + "<td>" + image.name + "</td>" + "</tr>" +
                "<tr><th>镜像状态</td>" + "<td><span class='label " + status_class + "'>" + status + "</span></td>" + "</tr>" +
                "<tr><th>镜像格式</th>" + "<td>" + image.disk_format + "</td>" + "</tr>" +
                "<tr><th>镜像大小</th>" + "<td>" + image.size + "Mb" + "</td>" + "</tr>" +
                "<tr><th>系统信息</th>" + "<td>" + os_type + "</td>" + "</tr>" +
                "<tr><th>创建时间</th>" + "<td>" + image.created_at + "</td>" + "</tr>" +
                "<tr><th>是否共享</th>" + "<td>" + is_public + "</td>" + "</tr>" +
                "<tr><th>是否被保护</th>" + "<td>" + protect + "</td>" + "</tr>" +
                "<tr><th>镜像描述信息</th>" + "<td>" + description + "</td>" + "</tr>" +
            "</table>";


        $scroll_div.append(image_detail_body);
        $images.append($scroll_div);
    }


    /*
     Register button click event
     */
    $(function () {
        register_refresh_list();
        register_delete_images();
        register_edit_image();
        register_create_image();
        register_toggle_source();
        register_clean_warnning();
    });

    function register_refresh_list() {
        $("#refresh_image").off("click").on("click", function () {
            get_all_images("");
            disabled_button();
            clear_detail_data();
        })
    }

    function register_delete_images() {
        $("[action-type=image_life_circle][action=delete]").click(function () {
            delete_images();
        })
    }

    function delete_images() {
        var root_path = project_url + "/image/";
        var $images_td = $("#image_table tbody tr input:checked");
        for (var i = 0; i < $images_td.length; i++) {
            //console.log("Delete images id is :  " + $($images_td[i]).closest('tr').attr('id'));
            var image_id = $($images_td[i]).closest('tr').attr('id');
            var query_path = root_path + image_id;
            //console.log("image delete query_path is " + query_path);

            $("#delete_image_button").attr("disabled", "disabled");
            $.ajax({
                type: "DELETE",
                url: query_path,
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                error: function (e) {
                    SAlert.showError(e);
                },
                complete: function () {
                    $("#refresh_image").click();
                    $("#delete_image_modal").modal("hide");
                    $("#delete_image_button").removeAttr("disabled");
                }
            });
        }
    }

    function register_create_image() {
        $("#add_image").off("click").on("click", function () {
            init_create_modal();
            submit_create_image();
        })
    }

    function init_create_modal() {
        $("#image_name_in_create").val("");
        $("#image_src_in_create").val("image_file");
        $("#image_file_container").show().removeAttr("disabled");
        $("#fileupload").removeAttr("disabled");

        $("#image_address_container").hide().attr("disabled", "disabled");
        $("#image_address_in_create").val("").attr("disabled", "disabled");

        $("#image_type_in_create").val("raw");
        $("#image_description_in_create").val("");

        $("#upload_file_name_container").val("");

        $("#image_warnning_container").hide();
        $("#image_public_prop").removeAttr("checked");
        $("#image_protected_prop").removeAttr("checked");
    }

    function register_clean_warnning(){
        $("[with-function=clean_warnning]").on("click", function(){
            clean_warnning();
        })
    }

    function clean_warnning(){
        $("#image_warnning").html("");
        $("#image_warnning_container").hide();
    }

    function register_toggle_source() {
        $("#image_src_in_create").off("click").on("click", function () {
            if ($(this).val() == "image_file") {

                $("#image_file_container").show().removeAttr("disabled");
                $("#fileupload").removeAttr("disabled");

                $("#image_address_container").hide().attr("disabled", "disabled")
                $("#image_address_in_create").attr("disabled", "disabled");
            } else {
                $("#image_file_container").hide().attr("disabled", "disabled");
                $("#fileupload").attr("disabled", "disabled");

                $("#image_address_container").show().removeAttr("disabled");
                $("#image_address_in_create").removeAttr("disabled");
            }
        })
    }

    function submit_create_image() {
        $("#create_confirm_button").off("click").on("click", function () {
            var _params = $("#create_image_form").serializeArray();
            console.debug("Params : ", _params);
            var params = reformat_image_data(_params);
            console.debug("Format Params is:", params);

            if(check_image_create_params(params)){
                create_image(params)
            };
        })
    }

    function reformat_image_data(_params) {
        var tmp_params = {};
        $.each(_params, function (i, field) {
            tmp_params[field.name] = field.value
        });
        console.debug("After reformat:", tmp_params);

        var params = {
            "container_format": "bare"
        };

        if(tmp_params.image_source == "image_href"){
            params['copy_from'] = tmp_params.image_href;
        }
        params['name'] =  tmp_params.image_name;
        params['disk_format'] = tmp_params.image_format;
        params["is_public"] = tmp_params.is_public ? 1: 0;
        params["protected"] = tmp_params.protected ? 1: 0;
        params["description"] = tmp_params.image_description;
        params["image_source"] = tmp_params.image_source;
        params["os_type"] = tmp_params.image_system;
        params["min_disk"] = 0;
        params["min_ram"] = 0;

        return params
    }

    function check_image_create_params(params){

        if (params.image_source == "image_address") {
            if (params.name == ''){
                render_image_danger_info("请填写镜像名称！");
                return false
            }
            if (params.copy_from == ''){
                render_image_danger_info("请填写镜像地址！");
                return false
            }
            return true
        } else {
            if (params.name == ''){
                render_image_danger_info("请填写镜像名称！");
                return false
            }
            if ($("#upload_file_name_container").val() == ''){
                render_image_danger_info("请选择一个镜像文件！");
                return false
            }
            return true
        }
    }

    function create_image(params) {
        var path =project_url +  '/images';

        if(params.image_source == 'image_address'){

            delete params.image_source;

            console.debug("Pre request params for image url type:", params);

            $.ajax({
                type: "POST",
                url: path,
                data: JSON.stringify(params),
                headers: {
                    "RC-Token": $.cookie("token_id")
                },
                success: function () {
                    console.log("Request send success!");
                    $("#create_image_modal").modal('hide');
                    refresh_image_list();
                },
                error: function (e) {
                    alert("创建镜像信息失败！");
                    $("#create_image_modal").modal('hide');
                    SAlert.showError(e)
                }
            });
        }else {
            delete params.image_source;
            console.debug("Pre request params for file  type:", params);
            $("#create_confirm_button").trigger("click_hook_event", params)
        }
    }

    $(function () {
        $('#fileupload').fileupload({
            maxChunkSize: 90000000,
            limitMultiFileUploadSize: 200000000,
            autoUpload: false,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            url:project_url + "/upload_image",
            maxFileSize: 91000000,
            add: function (e, data) {
                //console.info("Enter add, and this is: ", this);
                var file_name = null;
                $.each(data.files, function (index, file) {
                    $("#upload_file_name_container").val(file.name);
                    file_name = file.name
                });
                $("#create_confirm_button").off("click_hook_event")
                    .on('click_hook_event', function (e, params) {
                        console.debug("Custom params: ", params);
                        var timestamp = new Date().getTime();
                        var token = $.cookie("token_id");
                        var surfix = timestamp + "_" + token;
                        var file_ref = file_name + "_" + surfix;
                        params.file_name = file_ref;

                        $("#fileupload").fileupload(
                            'option',
                            'formData',
                            params
                        );

                        //console.debug("FILENAME is: ", params.file_name);
                        var $this = $(this), data = $this.data();
                        var jqXHR = data.submit()
                            .success(function (result, textStatus, jqXHR){
                                console.debug("SUCCESS: result: ", result, "textStatus: ", textStatus, "jqXHR: ", jqXHR);
                                refresh_image_list();
                                upload_image_callback(params);
                        })
                            .error(function (jqXHR, textStatus, errorThrown) {
                                console.debug("ERROR: jqXHR: ", jqXHR, "textStatus: ", textStatus, "errorThrown: ", errorThrown);
                                SAlert.showError(jqXHR);
                                delete_residual_image(file_ref)
                            });

                        $.isLoading({
                            text: "上传中，请不要刷新或关闭该窗口</br>" +
                            "<div id=\"progress\" class=\"progress progress-striped active\">" +
                                "<div class=\"progress-bar progress-bar-success\"></div>" +
                            "</div>" +
                            "上传速度：<span id=\"upload_rate\"></span>",
                            position: "overlay",
                            'tpl': '<span class="isloading-wrapper %wrapper%">%text%' +
                                '<div>' +
                                    '<button id="cancel_upload"  type="button" class="btn btn-danger btn-sm">取消上传</button>' +
                                '</div>' +
                            '</span>',
                        });

                        $("#cancel_upload").off("click").on("click", function () {
                            jqXHR.abort();
                            $.isLoading("hide");
                            $("#create_image_modal").modal("hide");
                        });
                    })
                    .data(data);
            },
            always: function(e, data) {
                $.isLoading("hide");
                $("#create_image_modal").modal("hide");
                console.debug("Upload always callback,and event: ", e, " data was: ", data)
            },
            progressall: function (e, data) {
                console.debug("Progess all: EVENT is:", e, "data is: ", data);
                var progress = parseInt(data.loaded / data.total * 100, 10);
                var rate = (data.bitrate/1024/8).toFixed(2);
                if (rate < 1024){
                    $("#upload_rate").html(rate + "KB/s");
                }else{
                    rate = (rate/1024).toFixed(2);
                    $("#upload_rate").html(rate + "MB/s");
                }
                $('#progress .progress-bar').css('width', progress + '%');
            }
        });
    });

    function upload_image_callback(params) {
        var path = project_url + "/file_image";

        console.debug("Upload File image: params", params);

        $.ajax({
            type: "POST",
            url: path,
            data: JSON.stringify(params),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                console.log("Upload file Request send success!");
                refresh_image_list()
            },
        });
    }

    function delete_residual_image(file_name) {
        var query_path =project_url +  '/delete_residual_image';

        var params = {
            "file_name": file_name
        };

        $.ajax({
            type: "DELETE",
            url: query_path,
            data: params,
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function(){
                console.debug("Delete residual image file success!")
            },
            complete: function () {
                console.debug("Delete residual image file api COMPLETE callback!")
            }
        });
    }
    /*
     Modal hook function
     */

    $(function () {
        $('[closetype=close_button]').click(function () {
            refresh_image_list();
        });
    });

    function refresh_image_list() {
        $("#refresh_image").click();
    }

    /*
     Edit image info
     */
    function init_edit_form(data) {
        //.log(data);
        if (data) {
            $("#edit_image_name").val(data.name);
            $("#image_description").val(data.description);
            $("#edit_disk_format").val(data.disk_format);

            if (data.is_public == '1') {
                //$("#edit_is_public").attr("checked", "checked");
                document.getElementById("edit_is_public").checked = true;
            } else {
                //$("#edit_is_public").attr("checked", false);
                document.getElementById("edit_is_public").checked = false;
            }
            if (data.protected == '1') {
                //$("#edit_protected").attr("checked", "checked");
                document.getElementById("edit_protected").checked = true;
            } else {
                //$("#edit_protected").attr("checked", false);
                document.getElementById("edit_protected").checked = false;
            }
        }
    }

    function register_edit_image() {
        $("#edit_confirm_button").click(function () {
            //console.log("click event edit image");
            edit_image();
        })
    }

    function edit_image() {
        var $images_td = $("#image_table tbody tr input:checked");
        var image_id = $($images_td[0]).closest('tr').attr('id');
        var request_data = getFormObject("#edit_image_form");

        if (!check_edit_image_form(request_data)) {
            return;
        }
        if ($("#edit_is_public").is(':checked')) {
            request_data.is_public = 1;
        }
        else {
            request_data.is_public = 0;
        }

        if ($("#edit_protected").is(':checked')) {
            request_data.protected = 1;
        }
        else {
            request_data.protected = 0;
        }
        //console.log("Json body is " + JSON.stringify(request_data));
        $("#edit_confirm_button").prop("disabled", true);
        $.ajax({
            type: "PUT",
            url: project_url + "/image/" + image_id,
            data: JSON.stringify(request_data),
            headers: {
                "RC-Token": $.cookie("token_id")
            },
            success: function () {
                refresh_image_list();
            },
            error: function (e) {
            },
            complete: function () {
                $("#edit_image_modal").modal('hide');
                $("#edit_confirm_button").prop("disabled", false);
            }
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
        //console.log("Object is:", o)
        return o;
    }

    //form check

    function check_edit_image_form(data) {
        var name_check = check_name_vaild(data.name, "#edit_image_name_div");
        var desc_check = check_description_vaild(data.description, "#edit_image_description_div");
        if (name_check && desc_check) {
            return true;
        } else {
            return false;
        }
    }

    function form_check_event() {
        $("#edit_image_name").blur(function () {
            var input_name = $("#edit_image_name").val();
            check_name_vaild(input_name, "#edit_image_name_div");
        });

        $("#image_description").blur(function () {
            var input_desc = $("#image_description").val();
            check_description_vaild(input_desc, "#edit_image_description_div");
        });

        $("#edit_image_name").keydown(function (e) {
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if (keynum == 32) {
                return false;
            }
        });
    }

    function display_check_info(check_div, success, message) {
        if (success) {
            $(check_div + " .success").removeClass("hide");
            $(check_div + " .error").addClass("hide");
            $(check_div + " .error_info").addClass("hide");

            return true;
        } else {
            $(check_div + " .success").addClass("hide");
            $(check_div + " .error").removeClass("hide");
            $(check_div + " .error_info").removeClass("hide");
            $(check_div + " .error_info" + " span").html(message);

            return false;
        }
    }

    function check_name_vaild(name, name_div) {
        if (name) {
            if (name.length >= 1 && name.length <= 60) {
                if (check_name_format(name)) {
                    return display_check_info(name_div, true, "")
                } else {
                    return display_check_info(name_div, false, "格式不正确")
                }
            } else {
                return display_check_info(name_div, false, "长度范围为1-60个字符")
            }

        } else {
            return display_check_info(name_div, false, "名称不能为空");
        }
    }

    function check_name_format(name) {
        return true;
    }

    function check_description_vaild(desc, desc_div) {
        if (desc.length > 1000) {
            return display_check_info(desc_div, false, "长度范围为0-1000个字符");
        } else {
            return display_check_info(desc_div, true, "");
        }
    }

    $('#min_disk').slider();
    $('#min_ram').slider();

    function keyup_search_image() {
        $("#search_image_input").keyup(function () {
            //console.log($("#search_image_input").val());
            get_all_images($("#search_image_input").val());
        });
    }

    function click_search_image() {
        $("#search_image_img").click(function () {
            get_all_images($("#search_image_input").val());
        });
    }

    function render_image_danger_info(msg) {
        if (msg == "") {
            $("#image_warnning_container").hide();
        } else {
            $("#image_warnning_container").show();
        }
        $("#image_warnning").html(msg)
    }

    /*
    Download image
    */
    $(function(){
        register_download_image();
        jQuery.download = function (url, method) {
            jQuery('<form action="' + url + '" method="' + (method || 'post') + '">' + '</form>')
                .appendTo('body').submit().remove();
        };
    });

    function register_download_image(){
        $("#download_confirm_button").off("click").on("click", function(){
            var $images_td = $("#image_table tbody tr input:checked");
            var image_id = $($images_td[0]).closest('tr').attr('id');

            var path = project_url + "/download_image/" + image_id;
            $.download(path, 'get');
            $("#download_image_modal").modal("hide")
        })
    }

}]);

