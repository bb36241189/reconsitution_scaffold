app.controller('SecurityController',['$scope','$http','SAlert',function ($scope,$http,SAlert) {
    $(function () {
        get_all_securities();
        disabled_button();
        disabled_rule_button();
        disabled_delete_rule_button();
        set_navigator();

        form_check_event();

        init_close_button();
    });

    function init_close_button(){
        $("#btn_close_detail").click(function(){clear_detail_data()});
    }

    function set_navigator() {
        if ($("#network_resource").hasClass('active')) {
            var lis = $('#demo1').children("li");
            lis.each(function () {
                $(this).addClass('active');
                $(this).removeClass('dhbg');
            })
            //console.log("has");
            $("#network_resource").removeClass('active');
            $("#network_resource").addClass('dhbg');
            ///.log($('#demo1:not(this)').children("li"));
        }
        $(".navbar-words").html("网络资源 > 安全组");

        //$("#network_resource .sub-menu").css("display", "block");
    }


    function security_table_pagination(data) {
        var page_num = 10;
        var data_length = data.length;
        /*
         if(!data_length){
         $("#room_table_num").hide();
         }
         $("#room_total_num").html(data_length);
         */
        if (!data_length || data_length <= page_num) {
            render_security_list(data);
            return;
        }
        //加入分页的绑定
        $("#security_pagination").pagination(data_length, {
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
            render_security_list(data.slice(start, end));
            //refresh_rule_list(data.slice(start, end));
        }
    }

    function security_rule_table_pagination(data) {
        //console.log(data);
        var page_num = 10;
        var data_length = data.length;
        /*
         if(!data_length){
         $("#room_table_num").hide();
         }
         $("#room_total_num").html(data_length);
         */
        if (!data_length || data_length <= page_num) {
            $("#security_rule_pagination").hide();
            render_security_detail(data);
            return;
        }
        $("#security_rule_pagination").show();
        //加入分页的绑定
        $("#security_rule_pagination").pagination(data_length, {
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
            //data.security_group_rules = data.security_group_rules.slice(start, end);
            //render_security_detail(data);
            render_security_detail(data.slice(start, end));
        }
    }

    function set__security_default_checked() {
        $("#security_list").find("tr:eq(0)").addClass("table_body_tr_change");
        $("#security_list").find("tr:eq(0)").children("td").eq(0).find("input").prop("checked", true);
        var tr_id = $("#security_list").find("tr:eq(0)").attr("id");

        enabled_button();
        enabled_rule_button();
        init_security_detail(tr_id);

    }

    function set_rule_default_checked() {
        $("#security_rule_tbody").find("tr:eq(0)").addClass("table_body_tr_change");
        //var tr_id = $("#security_rule_tbody").find("tr:eq(0)").attr("id");

        enable_delete_rule_button();


    }

    function get_all_securities() {
        var path = project_url + "/security-groups";
        $.ajax(,PermitStatus);
    }

    function render_security_list(data) {
        disabled_button();
        clear_detail_data();

        var $securities = $("#security_list");
        $securities.html("");
        if (data.length) {
            //var securities = data.security_groups;
            var securities = data;
            for (var i = 0, l = securities.length; i < l; i++) {
                var $table_tr = $("<tr></tr>");
                $table_tr.attr("id", securities[i].id);

                var table_body =
                    '<td><input type="checkbox"></td>' +
                    '<td class="security_data" item_tag="security_name"><a class="animate_name">' + securities[i].name + '</a></td>' +
                    '<td class="security_data">' + securities[i].department_name + '</td>' +
                    '<td class="security_data">' + securities[i].description + '</td>';

                $table_tr.append(table_body);
                $securities.append($table_tr);
            }
            click_security_table_tr();

            //set__security_default_checked();
        }
        else {
            var table_tr = '<tr><td colspan="3">没有安全组</td></tr>';
            $securities.append(table_tr);
        }
    }

    function click_security_table_tr() {
        $("#security_table .animate_name").click(function(e){
            var this_id = $(this).parent().parent().attr("id");
            $(".operation_1").stop(true).animate({"right":"-1000px"},function(){
                /*
                var checked_trs = $("#security_table tbody tr");
                checked_trs.each(function () {
                    if ($(this).hasClass("table_body_tr_change")) {
                        $(this).removeClass("table_body_tr_change");
                        //$(this).children("td").eq(0).find("input").css('display', 'none');
                        $(this).children("td").eq(0).find("input").prop("checked", false);
                        //disabled_add_rule_button();

                    }
                });
                */
                //init_security_detail(this_id);
            }).animate({"right":"0px"});
        });

        $("#security_table tbody tr").click(function (e) {
            if(e.target.tagName!="TD"){

            }
            else{
                clear_detail_data();
            }

            if (e.target.tagName=="TD"&&$(this).hasClass("table_body_tr_change")) {
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_trs = $("#security_table tbody tr");
                checked_trs.each(function () {
                    if ($(this).hasClass("table_body_tr_change")) {
                        $(this).removeClass("table_body_tr_change");
                        //$(this).children("td").eq(0).find("input").css('display', 'none');
                        $(this).children("td").eq(0).find("input").prop("checked", false);
                        //disabled_add_rule_button();

                    }
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'block');
                $(this).children("td").eq(0).find("input").prop("checked", true);
                var this_id = $(this).attr("id");
                init_security_detail(this_id);
            }
            if ($("#security_table tbody tr input:checked").length) {
                enabled_button();
                enabled_rule_button();
                //enable_add_rule_button();
                //enable_delete_rule_button();
            }
            else {
                disabled_button();
                disabled_rule_button();
                disabled_delete_rule_button();
            }
        });
    }

    function clear_detail_data() {
        var $securities = $("#security_rule_tbody");
        $securities.html("");
        $("#security_rule_title").html("管理规则");
        disabled_rule_button();
        disabled_delete_rule_button();
        $("[action-type=rule_life_circle]").unbind('click');
        $("#create_confirm_button_in_rule").unbind("click");

        $("#security_rule_pagination").hide();
        $(".operation_1").animate({"right":"-1000px"});
    }

    function init_security_detail(security_id) {
        var path = project_url + "/security-groups";
        $.ajax(,PermitStatus);
    }

    /*
     Define button init click status
     */
    function disabled_button() {
        $('#edit_security').attr('disabled', "disabled");
        $("#edit_security").css("cursor", "not-allowed");
        $("#edit_security").addClass("disabled_button");
        $("#edit_security").removeClass("general_button");

        $('#delete_security').attr('disabled', "disabled");
        $("#delete_security").css("cursor", "not-allowed");
        $("#delete_security").addClass("disabled_button");
        $("#delete_security").removeClass("danger_button");


        /*
         $('#edit_security').attr('disabled', "disabled")
         .attr("src", "/static/images/table_operate_button/disabled_edit.png");
         $('#security_group_show_more').addClass("cursor_disabled")
         .attr("style", "color: #7a7c7f").attr("src", "/static/images/navigation/pull.png");
         $('#security_group_more_tag').attr("src", "/static/images/navigation/pull.png");
         */
    }

    function enabled_button() {
        $("#edit_security").removeAttr('disabled');
        $("#edit_security").css("cursor", "pointer");
        $("#edit_security").removeClass("disabled_button");
        $("#edit_security").addClass("general_button");

        $("#delete_security").removeAttr('disabled');
        $("#delete_security").css("cursor", "pointer");
        $("#delete_security").removeClass("disabled_button");
        $("#delete_security").addClass("danger_button");
        /*
         $('#edit_security').removeAttr('disabled').attr("src", "/static/images/table_operate_button/edit.png");
         $('#security_group_show_more').removeClass('cursor_disabled').attr("style", "color: #5FB1EF");
         $('#security_group_more_tag').attr("src", "/static/images/navigation/pullblue.gif");
         */
    }


    function render_detail_table(data, security_id) {
        if (data) {
            var securities = data.security_groups;
            for (var i = 0; i < securities.length; i++) {
                if (securities[i].id == security_id) {
                    //console.log(securities[i]);
                    //return;
                    //render_security_detail(securities[i]);
                    security_rule_table_pagination(securities[i].security_group_rules);
                    //security_rule_table_pagination(securities[i]);
                    break;
                }
            }
        }
    }

    function render_security_detail(security) {
        //console.log(security);
        var $security_rule = $('#security_rule_tbody');
        $security_rule.html("");
        if (security.length) {
            //var security_rules = security.security_group_rules;
            var security_rules = security;
            //var security_id = security.id;
            var security_id = $("#security_table tbody tr input[type=checkbox]:checked").parents("tr").attr("id");
            var security_name = $("#security_table tbody tr input[type=checkbox]:checked").parents("tr").children("td").eq(1).text();
            //console.log(security_rules);
            for (var rule=0;rule<security_rules.length;rule++) {
                //console.log(rule);
                var sec_dir = security_rules[rule].direction;
                var sec_protocol = security_rules[rule].protocol;
                var sec_min_port = security_rules[rule].port_range_min;
                var sec_max_port = security_rules[rule].port_range_max;
                var sec_port_range;
                var sec_remote_prefix = security_rules[rule].remote_ip_prefix;
                var sec_ethertype = security_rules[rule].ethertype;
                sec_dir == "egress" ? sec_dir = "外出" : sec_dir = "进入";

                if (!sec_protocol) {
                    sec_protocol = "任何"
                }

                if (!sec_min_port && !sec_max_port) {
                    sec_port_range = "不限制"
                }
                else if (sec_min_port == sec_max_port) {
                    sec_port_range = sec_min_port;
                } else {
                    sec_port_range = sec_min_port + "~" + sec_max_port;
                }
                if (!sec_remote_prefix) {
                    sec_remote_prefix = sec_ethertype == "IPv4" ? '0.0.0.0/0' : '::/0';
                }
                var security_detail_body =
                    "<tr id=" + security_rules[rule].id + ">" +
                    '<td><input type="checkbox"></td>' +
                    "<td>" + sec_dir + "</td>" +
                    "<td>" + sec_protocol + "</td>" +
                    "<td>" + sec_ethertype + "</td>" +
                    "<td>" + sec_port_range + "</td>" +
                    "<td>" + sec_remote_prefix + "</td>" +
                    "</tr>";
                $security_rule.append(security_detail_body);

                //$("#security_rule_title").html("管理安全组规则：" + security.name);
                $("#security_rule_title").html("管理规则");
            }
            click_rule_table_tr();
            register_delete_rules();
            register_create_rule(security_id);

            //set_rule_default_checked();
        }
        else {
            var table_tr = '<tr><td colspan="6">安全组没有规则</td></tr>';
            $security_rule.append(table_tr);
        }

    }

    /*
     Register button click event
     */
    $(function () {
        register_refresh_list();
        register_delete_securities();
        register_edit_security();
    });

    function register_refresh_list() {
        $("#refresh_security").click(function () {
            get_all_securities();
            disabled_button();
            clear_detail_data();
            $("#security_rule_pagination").hide();
        })
    }

    function register_delete_securities() {
        $("[action-type=security_life_circle]").click(function () {
            delete_securities();
        })
    }

    function delete_securities() {
        var root_path = project_url + "/security-groups/";
        var $securities_td = $("#security_table tbody tr input:checked");
        for (var i = 0; i < $securities_td.length; i++) {
            //console.log("Delete securities id is :  " + $($securities_td[i]).closest('tr').attr('id'));
            var security_id = $($securities_td[i]).closest('tr').attr('id');
            var query_path = root_path + security_id;
            //console.log("security delete query_path is " + query_path);
            $.ajax(,PermitStatus);
        }
    }

    function delete_relevant_row(resource_id) {
        //console.log("Delete resource in success func: " + resource_id);
        $("#" + resource_id).remove();
        //disabled_add_rule_button();
        disabled_delete_rule_button();

    }

    /*
     Modal hook function
     */

    $(function () {
        $('[closetype=close_button]').click(function () {
            refresh_security_list();
        });
    });

    function refresh_security_list() {
        $("#refresh_security").click();
    }


    /*
     Edit security info
     */
    $('#edit_security_modal').on('show.bs.modal', function () {
        clean_edit_modal();
    });

    function clean_edit_modal() {
        var $securities_td = $("#security_table tbody tr input:checked");
        var security_name = $($securities_td[0]).closest('tr').children("[item_tag=security_name]").children("a").html();
        $("#security_name").val("").attr("placeholder", security_name);
        $("#security_description").val("");
    }

    function register_edit_security() {
        $("#edit_confirm_button").click(function () {
            //console.log("click event edit security");
            edit_security();
        })
    }

    function edit_security() {
        var security_name = $("#security_name").val();
        var description = $("#security_description").val();
        var $securities_td = $("#security_table tbody tr input:checked");
        var security_id = $($securities_td[0]).closest('tr').attr('id');
        var origin_data = {
            'name': security_name,
            'description': description
        };

        var request_data = {};

        for (var key in origin_data) {
            if (origin_data[key]) {
                request_data[key] = origin_data[key];
            }
        }

        if (request_data.name || request_data.description) {
            //console.log("Json body is " + JSON.stringify(request_data));
            $.ajax(,PermitStatus);
        } else {
            $("#edit_security_modal").modal('hide');
        }
    }


    /*
     Create security
     */
    $(function () {
        register_create_security();
    })

    $('#create_security_modal').on('show.bs.modal', function () {
        clear_modal_content();
        reset_name_display();
    });

    function clear_modal_content() {
        $("#security_name_in_create").val("").html("").removeClass("warning_border");
        $("#security_description_in_create").val("");
    }

    function reset_name_display() {
        $("#security_name_in_create").click(function () {
            if (!$("#security_name_in_create").val()) {
                $(this).html("").removeClass("warning_border");
            }
        })
    }

    function register_create_security() {
        $("#create_confirm_button").click(function () {
            create_security();
        });
    }

    function create_security() {
        var name = $("#security_name_in_create").val();
        var description = $("#security_description_in_create").val();
        if (name) {
            var request_data = {
                "name": name,
                "description": description
            };
            $.ajax(,PermitStatus);
        } else {
            $("#security_name_in_create").html("--请输入安全组名称--").addClass("warning_border");
        }
    }

    /*
     Rule table
     */
    function click_rule_table_tr() {
        $("#rule_table tbody tr").click(function () {
            //console.log("click a click_rule_table_tr tbody row");
            if ($(this).hasClass("table_body_tr_change")) {
                $(this).removeClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            }
            else {
                var checked_trs = $("#rule_table tbody tr");
                checked_trs.each(function () {
                    $(this).removeClass("table_body_tr_change");
                    //$(this).children("td").eq(0).find("input").css('display', 'none');
                    $(this).children("td").eq(0).find("input").prop("checked", false);
                });

                $(this).addClass("table_body_tr_change");
                //$(this).children("td").eq(0).find("input").css('display', 'block');
                $(this).children("td").eq(0).find("input").prop("checked", true);
            }

            //console.log("whether been checked: " + $("#rule_table tbody tr input:checked").length);
            if ($("#rule_table tbody tr input:checked").length) {
                //enabled_rule_button();
                enable_delete_rule_button();
            }
            else {
                //disabled_add_rule_button();
                disabled_delete_rule_button();
            }
        });
    }

    function disabled_rule_button() {
        $('#refresh_rule').attr('disabled', "disabled");
        $("#refresh_rule").css("cursor", "not-allowed");
        $("#refresh_rule").addClass("disabled_button");
        $("#refresh_rule").removeClass("general_button");

        $('#create_rule').attr('disabled', "disabled");
        $("#create_rule").css("cursor", "not-allowed");
        $("#create_rule").addClass("disabled_button");
        $("#create_rule").removeClass("general_button");


        /*
         $('#refresh_rule').attr('disabled', "disabled")
         .attr("src", "/static/images/table_operate_button/disabled_refresh.png");
         $('#create_rule').attr('disabled', "disabled")
         .attr("src", "/static/images/table_operate_button/disabled_add.png");
         $('#security_rule_show_more').addClass("cursor_disabled")
         .attr("style", "color: #7a7c7f").attr("src", "/static/images/navigation/pull.png");
         $('#security_rule_more_tag').attr("src", "/static/images/navigation/pull.png");*/
    }


    function disabled_delete_rule_button() {
        $('#delete_rule').attr('disabled', "disabled");
        $("#delete_rule").css("cursor", "not-allowed");
        $("#delete_rule").addClass("disabled_button");
        $("#delete_rule").removeClass("danger_button");

        /*
         $('#security_rule_show_more').addClass("cursor_disabled")
         .attr("style", "color: #7a7c7f").attr("src", "/static/images/navigation/pull.png");
         $('#security_rule_more_tag').attr("src", "/static/images/navigation/pull.png");
         */
    }

    function enable_delete_rule_button() {

        $("#delete_rule").removeAttr('disabled');
        $("#delete_rule").css("cursor", "pointer");
        $("#delete_rule").removeClass("disabled_button");
        $("#delete_rule").addClass("danger_button");
        /*
         $('#refresh_rule').removeAttr('disabled').attr("src", "/static/images/table_operate_button/refresh.png");
         $('#create_rule').removeAttr('disabled').attr("src", "/static/images/table_operate_button/add.png");
         */
    }


    function enabled_rule_button() {
        $("#refresh_rule").removeAttr('disabled');
        $("#refresh_rule").css("cursor", "pointer");
        $("#refresh_rule").removeClass("disabled_button");
        $("#refresh_rule").addClass("general_button");

        $("#create_rule").removeAttr('disabled');
        $("#create_rule").css("cursor", "pointer");
        $("#create_rule").removeClass("disabled_button");
        $("#create_rule").addClass("general_button");

        /*
         $('#refresh_rule').removeAttr('disabled').attr("src", "/static/images/table_operate_button/refresh.png");
         $('#create_rule').removeAttr('disabled').attr("src", "/static/images/table_operate_button/add.png");
         $('#security_rule_show_more').removeClass('cursor_disabled').attr("style", "color: #5FB1EF");
         $('#security_rule_more_tag').attr("src", "/static/images/navigation/pullblue.gif");
         */
    }


    /*
     Delete security rule
     */
    function register_delete_rules() {
        //console.log("Enter rule delete function");
        $("[action-type=rule_life_circle]").bind('click', function () {
            delete_rule();
        })
    }

    function delete_rule() {
        var root_path = project_url + "/security-group-rules/";
        var $rules_tr = $("#rule_table tbody tr.table_body_tr_change");
        //console.log("rule length is: " + $rules_tr.length)
        for (var i = 0; i < $rules_tr.length; i++) {
            //console.log("Delete rules id is :  " + $($rules_tr[i]).attr('id'));
            var rule_id = $($rules_tr[i]).attr('id');
            var query_path = root_path + rule_id;
            //console.log("rule delete query_path is " + query_path);
            $.ajax(,PermitStatus);
        }
    }

    /*
     Refresh rule list table
     */

    $(function () {
        refresh_rule_list();
    });

    function refresh_rule_list() {
        $("#refresh_rule").click(function () {
            //console.log("Rule refresh func: security id is: " +
            //    $("#security_table tbody tr input:checked").closest('tr').attr('id'));
            init_security_detail($("#security_table tbody tr input:checked").closest('tr').attr('id'))
            //disabled_add_rule_button();
            disabled_delete_rule_button();
        });
    }

    /*
     Create security rule
     */
    $(function () {
        port_toggle();
        ethertype_toggle();
        clear_warnning_style()
    });

    function clear_warnning_style() {
        $("#min_port_in_create, #max_port_in_create, #cidr, #port_in_create").focusin(function () {
            if ($(this).hasClass("warning_border")) {
                $(this).val("").removeClass("warning_border")
            }
            ;
        })
    };

    function port_toggle() {
        $("#enable_port_in_create").change(function () {
            var select_value = $(this).children(":selected").attr("enable_port");
            //console.log("select value is " + select_value)
            if (select_value == "single_port") {
                $("[port_type=port_group]").css("display", "none");
                $("[port_type=single_port]").css("display", "block");
            } else {
                $("[port_type=port_group]").css("display", "block");
                $("[port_type=single_port]").css("display", "none");
            }
        })
    }

    function ethertype_toggle() {
        $("#network_protocol_in_create").change(function () {
            var select_value = $(this).children(":selected").attr("network_protocol");
            //console.log("select ethertype value is " + select_value);
            if (select_value == "udp") {
                $("#ethertype_container").css("display", "block");
                $("#select_port_type").css("display", "block");
                $("#enable_port_in_create").val("端口");
                $("[port_type=single_port]").css("display", "block");
                $("[port_type=port_group]").css("display", "none");
            } else if (select_value == "icmp") {
                $("#ethertype_container").css("display", "block");
                $("#select_port_type").css("display", "none");
                $("[port_type=single_port]").css("display", "none");
                $("[port_type=port_group]").css("display", "none");
            } else if (select_value == "tcp") {
                $("#ethertype_container").css("display", "block");
                $("#select_port_type").css("display", "block")
                $("#enable_port_in_create").val("端口");
                $("[port_type=single_port]").css("display", "block");
                $("[port_type=port_group]").css("display", "none");
            }
        })
    }

    $('#create_rule_modal').on('show.bs.modal', function () {
        clear_rule_create_modal_content();
        reset_display();
    });

    function clear_rule_create_modal_content() {
        $("#network_protocol_in_create").val("tcp");
        $("#direction_in_create").val("进入");
        $("#ethertype").val("IPv4");
        $("#enable_port_in_create").val("端口");
        $("#port_in_create").val("").removeClass("warning_border");
        $("#min_port_in_create").val("").removeClass("warning_border");
        $("#max_port_in_create").val("").removeClass("warning_border");
        $("#cidr").val("").removeClass("warning_border");
        $("[port_type=port_group]").css("display", "none");
        $("[port_type=single_port]").css("display", "block");
    }

    function reset_display() {
        $("#ethertype_container").css("display", "block");
        $("#select_port_type").css("display", "block")
        $("#enable_port_in_create").val("端口");
        $("[port_type=single_port]").css("display", "block");
        $("[port_type=port_group]").css("display", "none");
    }

    function register_create_rule(security_id) {
        //console.log("register create rule");
        $("#create_confirm_button_in_rule").unbind("click").bind("click", function () {
            get_rule_create_params(security_id);
        });
    }

    function get_rule_create_params(security_id) {
        var protocol = $("#network_protocol_in_create").children(":checked").attr("network_protocol");
        var direction = $("#direction_in_create").children(":checked").attr("direction");
        var cidr = $("#cidr").val();
        var ethertype = $("#ethertype").children(":checked").attr("ethertype");
        var port_type = $("#enable_port_in_create").val();
        var max_port, min_port;
        if (port_type == "端口") {
            var port_number = $("#port_in_create").val();
            max_port = port_number;
            min_port = port_number;
        } else {
            var min_port = $("#min_port_in_create").val();
            var max_port = $("#max_port_in_create").val();
        }

        var data = {
            "direction": direction,
            "remote_ip_prefix": cidr,
            "protocol": protocol,
            "port_range_max": max_port,
            "port_range_min": min_port,
            "security_group_id": security_id,
            "ethertype": ethertype
        };

        var request_data = reformat_create_rule_params(data);
        if (!check_create_rule_params(request_data)) {
            return false;
        }
        create_security_rule(request_data)
    }

    function reformat_create_rule_params(data) {
        var type = data.protocol;
        if (type == "icmp") {
            delete data.port_range_max;
            delete data.port_range_min;
        }
        return data
    }

    function check_create_rule_params(request_data) {
        var valid = true;
        if (request_data.protocol != "icmp") {
            var _min = request_data.port_range_min;
            var _max = request_data.port_range_max;
            var min = Number(_min);
            var max = Number(_max);
            //console.log("min" + isNaN(min));
            //console.log("max" + isNaN(max));

            var port_type = $("#enable_port_in_create option:checked").attr("enable_port");
            if (port_type == "single_port") {
                if (isNaN(min)) {
                    $("#port_in_create").val("请输入数字!").addClass("warning_border");
                    valid = false;
                } else if(min < 1 || min > 65535){
                    $("#port_in_create").val("端口范围1到65535").addClass("warning_border");
                    valid = false;
                }
            } else if (port_type == "port_group") {
                if (isNaN(min) || isNaN(max)) {
                    $("#min_port_in_create").val("请输入数字！").addClass("warning_border");
                    $("#max_port_in_create").val("请输入数字！").addClass("warning_border");
                    valid = false;
                } else {
                    if (min > 65535 || max > 65535 || min < 1 || max < 1) {
                        $("#min_port_in_create").val("端口范围1到65535！").addClass("warning_border");
                        $("#max_port_in_create").val("端口范围1到65535！").addClass("warning_border");
                        valid = false;
                    } else if (min > max) {
                        $("#min_port_in_create").val("起始端口号必须小于终止端口号！").addClass("warning_border");
                        $("#max_port_in_create").val("起始端口号必须小于终止端口号！").addClass("warning_border");
                        valid = false;
                    }
                }
            }
        }

        var cidr = request_data.remote_ip_prefix;
        var ethertype = request_data.ethertype;
        //console.log("Ethertype is" + ethertype + ",and CIDR validate result is: " + validate_cidr(cidr, ethertype));
        if (!validate_cidr(cidr, ethertype)) {
            $("#cidr").val("请输入合法的CIDR").addClass("warning_border");
            valid = false;
        }
        return valid
    }

    function validate_cidr(cidr, ethertype) {
        var v4_exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\/(\d{1}|[1-2]\d|3[0-2]))?$/;
        //var v6_exp = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(([1-9])|([1-9][0-9])|(1[0-1][0-9]|12[0-8]))?$/;
        //TODO: Add the ipv6 regexp
        var v6_exp = /^.*$/;

        var exp = (ethertype == "IPv4" ? v4_exp : v6_exp);
        //console.log("Exp is: " + exp);
        var flag = cidr.match(exp);
        return flag != undefined && flag != "";
    }

    function create_security_rule(request_data) {
        //console.log("Enter security create request");
        $.ajax(,PermitStatus);
    }

    //form check


    function form_check_event(){
        $("#security_name_in_create").blur(function(){
            var input_name = $("#security_name_in_create").val();
            check_name_vaild(input_name, "#create_security_name_div");
        });

        $("#security_name").blur(function(){
            var input_name = $("#security_name").val();
            check_name_vaild(input_name, "#edit_security_name_div");
        });

        $("#security_description").blur(function(){
           var input_desc = $("#security_description").val();
            check_description_vaild(input_desc, "#edit_security_description_div");
        });

        $("#security_description_in_create").blur(function(){
           var input_desc = $("#security_description_in_create").val();
            check_description_vaild(input_desc, "#create_security_description_div");
        });


        $("#security_name_in_create").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
        });

        $("#security_name").keydown(function(e){
            //alert(event.keyCode);
            var keynum = window.event ? e.keyCode : e.which;
            //console.log(keynum);
            if(keynum==32){
                return false;
            }
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
        if(desc.length>1000){
            return display_check_info(desc_div, false, "长度范围为0-1000个字符");
        }else{
            return display_check_info(desc_div, true, "");
        }
    }

}]);

