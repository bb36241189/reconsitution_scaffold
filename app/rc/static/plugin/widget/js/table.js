$(function (){

    	$("#room_table tbody tr").click(function(){



		if($(this).hasClass("table_body_tr_change")){

    	    $(this).removeClass("table_body_tr_change");
    	    $(this).children("td").eq(0).find("input").css('display','none');
            $(this).children("td").eq(0).find("input").prop("checked", false);
        }
        else {

            var checked_rooms = $("#room_table tbody tr");
            console.log(checked_rooms);
            checked_rooms.each(function(){
                $(this).removeClass("table_body_tr_change");
                $(this).children("td").eq(0).find("input").css('display','none');
                $(this).children("td").eq(0).find("input").prop("checked", false);
            });

        $(this).addClass("table_body_tr_change");
        $(this).children("td").eq(0).find("input").css('display','block');
        $(this).children("td").eq(0).find("input").prop("checked", true);

        }

        checked_table_tr("#room_table");



    });

    $("#delete_room").tooltip();
    $("#add_room").tooltip();
    $("#edit_room").tooltip();
    $("#refresh_room").tooltip();


    function checked_table_tr(table_id) {
        var checked_tr = $(table_id + " tbody"+" tr"+" input[type=checkbox]:checked");
        console.log(checked_tr.length);
        if (checked_tr.length) {
            console.log(true);
            return true;
        }
        else{
            console.log(false);
            return false
        }
        // body...
    }


    $("#delete_room").tooltip();
    $("#add_room").tooltip();
    $("#edit_room").tooltip();
    $("#refresh_room").tooltip();


});