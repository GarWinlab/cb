var mysql = require('mysql');
var fs = require("fs");

function analysis(params) {
    var connection = mysql.createConnection({
        host: process.env.CB_HOST,
        user: process.env.CB_USER,
        password: process.env.CB_PASS,
        database: process.env.CB_DB
    });

    var naps = '';
    console.log("start analysis ");
    var check = 0;
    connection.query('SELECT * from upd_naps ORDER BY id DESC LIMIT 700', function (err, rows, fields) {

        if (!err) {
            var exp_sell = 0;
            var exp_buy = 0;
            var str = '' +
                '' +
                '        <section class="mbr-section mbr-section--relative mbr-section--fixed-size" id="msg-box3-n" data-rv-view="19" style="background-color: rgb(255, 255, 255);">\n' +
                '    \n' +
                '    <div class="mbr-section__container container mbr-section__container--first" style="padding-top: 93px;">\n' +
                '        <div class="mbr-header mbr-header--wysiwyg row">\n' +
                '            <div class="col-sm-8 col-sm-offset-2">\n' +
                '                <h3 class="mbr-header__text">MODERN STYLES</h3>\n' +
                '                \n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '    <div class="mbr-section__container container mbr-section__container--middle">\n' +
                '        <div class="row">\n' +
                '' +
                '<meta charset="UTF-8"><table style="border:1px solid;">';
            str += '<h3>Сравнение цен на cyber.money - localbitcoins.com - bestchange.ru</h3>';
            str += '<tr><td style="width:120px;  padding:5px; float:left"> ' +
                'Анализ </td><td style="width:120px; font-size:12px; border:2px solid white; padding:5px; float:left">cyber.money btc sell</td>' +
                '<td style="width:115px;  padding:5px; font-size:12px; border:2px solid white; float:left">cyber.money btc buy</td>' +
                '<td style="width:115px;  padding:5px; font-size:12px; border:2px solid white; float:left">localbitcoins btc sell</td>' +
                '<td style="width:115px;  padding:5px; font-size:12px; border:2px solid white; float:left">localbitcoins btc buy</td>' +
                '<td style="width:115px;  background-color:#b9def0; border:2px solid white; padding:5px; font-size:12px; float:left">bestchange btc sell</td>' +
                '<td style="width:115px;  background-color:greenyellow; border:2px solid white; padding:5px; font-size:12px; float:left">bestchange btc buy</td>' +
                '<td style="width:115px;  padding:5px; margin: 0 1px 0 0; font-size:12px; border:2px solid black; float:left">new price sell</td>' +
                '<td style="width:115px;  padding:5px; font-size:12px; border:2px solid black; float:left">new price buy</td>' +
                '</tr>';
            for (var c in rows) {
                if (c % 2) {
                    var color = 'lightgrey';
                } else {
                    var color = 'lavender';
                }
                str += '<tr  style="background-color: ' + color + ';">';
                for (var i in rows[c]) {
                    if (i == 'price_new_sell') {
                        exp_sell = rows[c]["price_new_sell"] / 1;
                    }
                    if (i == 'price_new_buy') {
                        exp_buy = rows[c]["price_new_buy"] / 1;
                    }
                    var mark = "";

                    if (rows[c]["price_parser_sell"] / 1 != 0 && rows[c]["price_parser_sell"] / 1 != rows[c]["price_new_sell"] / 1 && i == 'price_new_sell') {
                        mark = "background-color: green; color: white; ";
                    }

                    if (rows[c]["price_parser_buy"] / 1 != 0 && rows[c]["price_parser_buy"] / 1 != rows[c]["price_new_buy"] / 1 && i == 'price_new_buy') {
                        mark = "background-color: green; color: white; ";
                    }

                    if (i == 'upd_time') {
                        var w = 250;
                        var font = 'font-size:10px;';

                    } else {
                        var w = 120;
                        var font = '';
                    }

                    str += '<td style="height:20px; ' + font + ' padding:5px; ' + mark + ' width:' + w + 'px; float:left;"> ' +
                        rows[c][i] + '</td>';

                }
            }
            str += '</table>' +
                '' +
                '        </div>\n' +
                '    </div>\n' +
                '    <div class="mbr-section__container container mbr-section__container--last" style="padding-bottom: 93px;">\n' +
                '        <div class="row">\n' +
                '            <div class="col-sm-8 col-sm-offset-2">\n' +
                '                <div class="mbr-buttons mbr-buttons--center"><a class="mbr-buttons__btn btn btn-lg btn-default" href="https://mobirise.com">SEE ALL TEMPLATES</a></div>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</section>' +
                '' +
                '<footer class="mbr-section mbr-section--relative mbr-section--fixed-size" id="footer1-g" data-rv-view="3" style="background-color: rgb(68, 68, 68);">\n' +
                '    \n' +
                '    <div class="mbr-section__container container">\n' +
                '        <div class="mbr-footer mbr-footer--wysiwyg row" style="padding-top: 36.9px; padding-bottom: 36.9px;">\n' +
                '            <div class="col-sm-12">\n' +
                '                <p class="mbr-footer__copyright"></p>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</footer>\n' +
                '\n' +
                '\n' +
                '  <script src="assets/web/assets/jquery/jquery.min.js"></script>\n' +
                '  <script src="assets/bootstrap/js/bootstrap.min.js"></script>\n' +
                '  <script src="assets/smooth-scroll/smooth-scroll.js"></script>\n' +
                '  <!--[if lte IE 9]>\n' +
                '<script src="assets/jquery-placeholder/jquery.placeholder.min.js"></script>\n' +
                '<![endif]-->\n' +
                '  <script src="assets/mobirise/js/script.js"></script>\n' +
                '  <script src="assets/dropdown-menu/script.js"></script>\n' +
                '  <script src="assets/formoid/formoid.min.js"></script>\n' +
                '  \n' +
                '  \n' +
                '</body>';
            //console.log('<h3>Сравнение цен на cyber.money - localbitcoins.com - bestchange.ru</h3>', str);
//SELECT id, tech_name, naps_name, curs1, curs2 from rwil_naps


            console.log("analysis before update");
            /*    connection.query('UPDATE rwil_naps SET curs2 = col1  WHERE id = 22', function (err, rows, fields) {
                    if (!err) {
                        //UPDATE t1 SET col1 = col1 + 1, col2 = col1;
                        // console.log('<h3>Сравнение цен на cyber.money - localbitcoins.com - bestchange.ru</h3>', str);
                    }
                    else {
                        console.log("analysis err" . err);
                    }
                });*/


        } else {
            var str = err;
            // console.log(err);
        }

        var data_head = '<!DOCTYPE html>\n' +
            '<html >\n' +
            '<head>\n' +
            '    <meta charset="UTF-8">\n' +
            '    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
            '    <meta name="generator" content="Mobirise v4.5.2, mobirise.com">\n' +
            '    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">\n' +
            '    <link rel="shortcut icon" href="assets/images/logo.png" type="image/x-icon">\n' +
            '    <meta name="description" content="">\n' +
            '    <title>Home</title>\n' +
            '    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:700,400&subset=cyrillic,latin,greek,vietnamese">\n' +
            '    <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">\n' +
            '    <link rel="stylesheet" href="assets/mobirise/css/style.css">\n' +
            '    <link rel="stylesheet" href="assets/dropdown-menu/style.css">\n' +
            '    <link rel="stylesheet" href="assets/mobirise/css/mbr-additional.css" type="text/css">\n' +
            '\n' +
            '    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>\n' +
            '\n' +
            '</head>\n' +
            '<body>' +
            '' +
            '' +
            '' +
            '<script>' +
            '  $(function() {\n' +
            'setInterval("location.reload();",180000);' +
            '  });' +
            '</script>' +
            '' +
            '<section id="dropdown-menu-2btn-i" data-rv-view="5">\n' +
            '\n' +
            '    <nav class="navbar navbar-dropdown navbar-fixed-top">\n' +
            '\n' +
            '        <div class="container">\n' +
            '\n' +
            '            <div class="navbar-brand">\n' +
            '                <a class="text-gray" href="http://cyber.money">CYBER.MONEY</a>\n' +
            '            </div>\n' +
            '\n' +
            '            <button class="navbar-toggler pull-xs-right hidden-md-up" type="button" data-toggle="collapse" data-target="#exCollapsingNavbar">\n' +
            '                <div class="hamburger-icon"></div>\n' +
            '            </button>\n' +
            '\n' +
            '            <ul class="nav-dropdown collapse pull-xs-right navbar-toggleable-sm nav navbar-nav" id="exCollapsingNavbar"><li class="nav-item dropdown"><a class="nav-link link dropdown-toggle" data-toggle="dropdown-submenu" href="https://mobirise.com/">FEATURES</a><div class="dropdown-menu"><a class="dropdown-item" href="https://mobirise.com/">Mobile friendly</a><a class="dropdown-item" href="https://mobirise.com/">Based on Bootstrap</a><div class="dropdown"><a class="dropdown-item dropdown-toggle" data-toggle="dropdown-submenu" href="https://mobirise.com/">Trendy blocks</a><div class="dropdown-menu dropdown-submenu"><a class="dropdown-item" href="https://mobirise.com/">Image/content slider</a><a class="dropdown-item" href="https://mobirise.com/">Contact forms</a><a class="dropdown-item" href="https://mobirise.com/">Image gallery</a><a class="dropdown-item" href="https://mobirise.com/">Mobile menu</a><a class="dropdown-item" href="https://mobirise.com/">Google maps</a><a class="dropdown-item" href="https://mobirise.com/">Social buttons</a><a class="dropdown-item" href="https://mobirise.com/">Google fonts</a><a class="dropdown-item" href="https://mobirise.com/">Video background</a></div></div><a class="dropdown-item" href="https://mobirise.com/">Host anywhere</a></div></li><li class="nav-item"><a class="nav-link link" href="https://mobirise.com/">HELP</a></li><li class="nav-item nav-btn"><a class="nav-link btn btn-default btn-default-outline" href="https://mobirise.com/">FOR WINDOWS</a></li><li class="nav-item nav-btn"><a class="nav-link btn btn-danger" href="https://mobirise.com/">FOR MAC</a></li></ul>\n' +
            '\n' +
            '        </div>\n' +
            '\n' +
            '    </nav>\n' +
            '\n' +
            '</section>' +
            '' +
            '<section class="mbr-section mbr-section--relative mbr-section--fixed-size mbr-after-navbar" id="pricing-table1-j" data-rv-view="7" style="background-color: rgb(240, 240, 240);">\n' +
            '    \n' +
            '    <div class="mbr-section__container mbr-section__container--std-top-padding container" style="padding-top: 93px; margin-bottom: 0px;">\n' +
            '        <div class="row">\n' +
            '            <div class="mbr-plan col-xs-12 mbr-plan--first col-md-3 col-sm-6">\n' +
            '                <div class="mbr-plan__box">\n' +
            '                    <div class="mbr-plan__header">\n' +
            '                        <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                            <h3 class="mbr-header__text">SELL</h3>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__number">\n' +
            '                        <div class="mbr-number mbr-number--price">\n' +
            '                            <div class="mbr-number__num">\n' +
            '                                <div class="mbr-number__group">\n' +
            '                                    <sup class="mbr-number__left">‎₽</sup><span class="mbr-number__value">' + exp_sell + '</span>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="mbr-plan col-xs-12 mbr-plan--success col-md-3 col-sm-6">\n' +
            '                <div class="mbr-plan__box">\n' +
            '                    <div class="mbr-plan__header">\n' +
            '                        <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                            <h3 class="mbr-header__text">BUY</h3>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__number">\n' +
            '                        <div class="mbr-number mbr-number--price">\n' +
            '                            <div class="mbr-number__num">\n' +
            '                                <div class="mbr-number__group">\n' +
            '                                    <sup class="mbr-number__left">‎₽</sup><span class="mbr-number__value">' + exp_buy + '</span>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="mbr-plan col-xs-12 mbr-plan--danger mbr-plan--favorite col-md-3 col-sm-6">\n' +
            '                <div class="mbr-plan__box">\n' +
            '                    <div class="mbr-plan__header">\n' +
            '                        <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                            <h3 class="mbr-header__text">NEW SELL</h3>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__number">\n' +
            '                        <div class="mbr-number mbr-number--price">\n' +
            '                            <div class="mbr-number__num">\n' +
            '                                <div class="mbr-number__group">\n' +
            '                                    <sup class="mbr-number__left">$</sup><span class="mbr-number__value">0</span>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                            <div class="mbr-number__caption">per month</div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__details"><ul><li><strong>100 GB</strong> Storage</li><li><strong>Unlimited</strong> Users</li><li><strong>50 GB</strong> Bandwidth</li></ul></div>\n' +
            '                    <div class="mbr-plan__buttons">\n' +
            '                        <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">DEMO LINK</a></div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="mbr-plan col-xs-12 mbr-plan--warning mbr-plan--last col-md-3 col-sm-6">\n' +
            '                <div class="mbr-plan__box">\n' +
            '                    <div class="mbr-plan__header">\n' +
            '                        <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                            <h3 class="mbr-header__text">NEW BUY</h3>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__number">\n' +
            '                        <div class="mbr-number mbr-number--price">\n' +
            '                            <div class="mbr-number__num">\n' +
            '                                <div class="mbr-number__group">\n' +
            '                                    <sup class="mbr-number__left">$</sup><span class="mbr-number__value">0</span>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                            <div class="mbr-number__caption">per month</div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                    <div class="mbr-plan__details"><ul><li><strong>Unlimited</strong> Storage</li><li><strong>Unlimited</strong> Users</li><li><strong>1 TB</strong> Bandwidth</li></ul></div>\n' +
            '                    <div class="mbr-plan__buttons">\n' +
            '                        <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">DEMO LINK</a></div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            \n' +
            '        </div>\n' +
            '    </div>\n' +
            '</section>\n' +
            '\n' +
            '<section class="mbr-section mbr-section--relative mbr-section--fixed-size" id="features1-k" data-rv-view="10" style="background-color: rgb(255, 255, 255);">\n' +
            '    \n' +
            '    \n' +
            '    <div class="mbr-section__container container mbr-section__container--std-top-padding" style="padding-top: 93px;">\n' +
            '        <div class="mbr-section__row row">\n' +
            '            <div class="mbr-section__col col-xs-12 col-md-3 col-sm-6">\n' +
            '                <div class="mbr-section__container mbr-section__container--center mbr-section__container--middle">\n' +
            '                    <figure class="mbr-figure"><img src="assets/images/bootstrap.png" class="mbr-figure__img"></figure>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                        <h3 class="mbr-header__text">BOOTSTRAP 3</h3>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-article mbr-article--wysiwyg">\n' +
            '                        <p>Bootstrap 3 has been noted as one of the most reliable and proven frameworks and Mobirise has been equipped to develop websites using this framework.</p>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--last" style="padding-bottom: 93px;">\n' +
            '                    <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">LEARN MORE</a></div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="mbr-section__col col-xs-12 col-md-3 col-sm-6">\n' +
            '                <div class="mbr-section__container mbr-section__container--center mbr-section__container--middle">\n' +
            '                    <figure class="mbr-figure"><img src="assets/images/responsive.png" class="mbr-figure__img"></figure>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                        <h3 class="mbr-header__text">RESPONSIVE</h3>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-article mbr-article--wysiwyg">\n' +
            '                        <p>One of Bootstrap 3\'s big points is responsiveness and Mobirise makes effective use of this by generating highly responsive website for you.</p>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--last" style="padding-bottom: 93px;">\n' +
            '                    <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">LEARN MORE</a></div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="clearfix visible-sm-block"></div>\n' +
            '            <div class="mbr-section__col col-xs-12 col-md-3 col-sm-6">\n' +
            '                <div class="mbr-section__container mbr-section__container--center mbr-section__container--middle">\n' +
            '                    <figure class="mbr-figure"><img src="assets/images/google-fonts.png" class="mbr-figure__img"></figure>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                        <h3 class="mbr-header__text">WEB FONTS</h3>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-article mbr-article--wysiwyg">\n' +
            '                        <p>Google has a highly exhaustive list of fonts compiled into its web font platform and Mobirise makes it easy for you to use them on your website easily and freely.</p>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--last" style="padding-bottom: 93px;">\n' +
            '                    <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">LEARN MORE</a></div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            \n' +
            '            <div class="mbr-section__col col-xs-12 col-md-3 col-sm-6">\n' +
            '                <div class="mbr-section__container mbr-section__container--center mbr-section__container--middle">\n' +
            '                    <figure class="mbr-figure"><img src="assets/images/unlimited-websites.png" class="mbr-figure__img"></figure>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-header mbr-header--reduce mbr-header--center mbr-header--wysiwyg">\n' +
            '                        <h3 class="mbr-header__text">UNLIMITED WEBSITES</h3>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--middle">\n' +
            '                    <div class="mbr-article mbr-article--wysiwyg">\n' +
            '                        <p>Mobirise gives you the freedom to develop as many websites as you like given the fact that it is a desktop app.</p>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class="mbr-section__container mbr-section__container--last" style="padding-bottom: 93px;">\n' +
            '                    <div class="mbr-buttons mbr-buttons--center"><a href="https://mobirise.com" class="mbr-buttons__btn btn btn-wrap btn-xs-lg btn-default">LEARN MORE</a></div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            \n' +
            '            \n' +
            '            \n' +
            '        </div>\n' +
            '    </div>\n' +
            '</section>';

        fs.appendFile("report_temp.html", str, function (error) {
            if (error) throw error; // если возникла ошибка
            console.log("analysis report");
            var data = fs.readFileSync("report_temp.html", "utf8");
            fs.writeFile("report.html", data_head + data, function (error) {
                if (error) throw error; // если возникла ошибка
                console.log("report.html");
            });
            //console.log(data);  // выводим считанные данные
        });
    });
    var price_new_sell = 0;
    var price_new_buy = 0;

    var price_export_sell = 0;
    var price_export_buy = 0;

    connection.query('SELECT price_new_sell, price_new_buy from upd_naps WHERE price_new_buy!=0 ORDER BY id DESC LIMIT 1', function (err, rows, fields) {
        if (!err) {
            var s = "{";

            for (var c in rows) {
                var count = 0;
                for (var i in rows[c]) {
                    if (count == 0) {
                        s += '"sell":"' + rows[c][i] + '",';
                        price_export_sell = rows[c][i] / 1.01; //  yandex -1% = qiwi
                        price_export_sell = price_export_sell.toFixed(2)
                        price_new_sell = rows[c][i] / 1.03; //yandex
                    }
                    if (count == 1) {
                        s += '"buy":"' + rows[c][i] + '"';
                        price_export_buy = rows[c][i] * 1.01 //  yandex +1% = qiwi
                        price_export_buy = price_export_buy.toFixed(2)
                        // % yandex
                        price_new_buy = 103000 / rows[c][i]; //yandex
                        price_new_buy = price_new_buy.toFixed(3);
                    }
                    count++;
                }
            }
            s += "}";


            var e = "<rates>\n" +
                "\n" +
                "<item>\n" +
                "<from>BTC</from>\n" +
                "<to>QWRUB</to>\n" +
                "<in>1</in>\n" +
                "<out>" + price_export_sell + "</out>\n" +
                "<amount>11.99</amount>\n" +
                "<minfee>2 %</minfee>\n" +
                "<param>manual, floating</param>\n" +
                "</item>\n" +
                "\n" +
                "<item>\n" +
                "<from>QWRUB</from>\n" +
                "<to>BTC</to>\n" +
                "<in>" + price_export_buy + "</in>\n" +
                "<out>1</out>\n" +
                "<amount>50000</amount>\n" +
                "<minfee>2 %</minfee>\n" +
                "<tofee>2 %</tofee>\n" +
                "<param>manual, floating</param>\n" +
                "</item>\n" +
                "\n" +
                "</rates>";
            fs.writeFile("export.xml", e, function (error) {
                if (error) throw error; // если возникла ошибка
                console.log("export.xml");
            });

            fs.writeFile("prices.html", s, function (error) {
                if (error) throw error; // если возникла ошибка
                console.log("prices.html");
            });
            console.log(s);
            connection.query('UPDATE `rwil_naps` SET curs2="' + price_new_sell + '" WHERE id = 22 OR id = 28 ', function (err, rows, fields) {
                if (err) console.log(err);
            });

            connection.query('UPDATE `rwil_naps` SET curs2="' + price_new_buy + '" WHERE id = 23 OR id = 27 ', function (err, rows, fields) {
                if (err) console.log(err);
            });
            //console.log(" ============" + price_new_sell + " ============" + price_new_buy);

        }
    });
    setTimeout(function () {
        connection.end();
    }, 7000);
}

module.exports = analysis;

//analysis();
