jQuery(function ($) {

    $("#step_size_percent, #step_size_rub, #reserv_min_btc, #reserv_min_rub, #exchange_min_review").keydown(function (event) {
        // Разрешаем: backspace, delete, tab и escape
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 190 || event.keyCode == 110 ||
            // Разрешаем: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||

            // Разрешаем: home, end, влево, вправо 190 and 110
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // Ничего не делаем
            return;
        }
        else {
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault();
            }
        }
    });

    $("#step_size_rub").keydown(function (event) {
        $("#step_size_percent").val(0);
    });

    $("#step_size_percent").keydown(function (event) {
        $("#step_size_rub").val(0);
    });


    $.saveReport = function (e) {
        var err_str = 0;
        $('#report-form').find('input, select').each(function () {
            // добавим новое свойство к объекту $data
            // имя свойства – значение атрибута name элемента
            // значение свойства – значение свойство value элемента
            //if()
            if (this.name == 'link_localbitcoins') {
                var test = $(this).val();
                if (!(test.indexOf('localbitcoins.com') + 1)) {
                    $("#report_resp").html("<span style='color:red'>Проверьте адрес localbitcoins.com</span>");
                    err_str++;
                }
            }
            if (this.name == 'link_bestchange_sell' || this.name == 'link_bestchange_buy') {
                var test = $(this).val();
                if (!(test.indexOf('bestchange.ru') + 1)) {
                    $("#report_resp").html("<span style='color:red'>Проверьте адреса bestchange.ru</span>");
                    err_str++;
                }
            }

            if ($("#step_size_rub").val() == 0 && $("#step_size_percent").val() == 0) {
                    $("#report_resp").html("<span style='color:red'>Проверьте шаг коррекции</span>");
                    err_str++;
            }
        });

        var url = "http://www.cyber.money/report.php"; // the script where you handle the form input.
        if (!err_str)
            $.ajax({
                type: "POST",
                url: url,
                data: $("#report-form").serialize(), // serializes the form's elements.
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        $("#report_resp").html("<span style='color:green'>Сохранено. Изменения будут видны в течении 3х минут</span>");
                    }
                    setTimeout(function () {
                        $("#report_resp").html("");
                    }, 10000);
                },
                fail: function (jqXHR, textStatus) {
                    $("report_resp").html("Ошибка");
                    console.log("Request failed: " + textStatus);
                }
            });

        //e.preventDefault(); // avoid to execute the actual submit of the form.
    }


    $(document).on('click', '.js_reply_close', function () {
        $(this).parents('.js_reply_wrap').fadeOut(500);

        return false;
    });

    $(document).on('click', '.premium_helptitle span', function () {
        $(this).parents('.premium_wrap_help').toggleClass('act');
        return false;
    });

    $('.pn_datepicker').datepicker({
        maxDate: "+1Y",
        dateFormat: 'dd.mm.yy',
        changeYear: true
    });

    $('.pn_timepicker').datetimepicker({
        maxDate: "+1Y",
        changeYear: true,
        dateFormat: 'dd.mm.yy',
        timeFormat: 'hh:mm',
        separator: ' '
    });

    function getCaret(el) {
        if (el.selectionStart) {
            return el.selectionStart;
        } else if (document.selection) {
            el.focus();

            var r = document.selection.createRange();
            if (r == null) {
                return 0;
            }

            var re = el.createTextRange(),
                rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);

            return rc.text.length;
        }
        return 0;
    }

    function setSelectionRange(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }

    $(document).on('click', '.prem_tagtext span', function () {
        var thet = $(this).parents('.premium_wrap_standart').find('textarea');
        var shortcode = $(this).find('.prem_span_hide').html();

        var sectionid = parseInt(getCaret(thet.get(0)));
        thet.val(thet.val().substr(0, sectionid) + shortcode + thet.val().substr(sectionid, thet.val().length));
        setSelectionRange(thet.get(0), sectionid + shortcode.length, sectionid + shortcode.length);

        return false;
    });

    $(document).on('keydown', '.premium_content .wp-list-table input', function (e) {
        if (e.which == 13) {
            $(this).parents('form').find('input[name=save]').click();
            return false;
        }
    });
});
