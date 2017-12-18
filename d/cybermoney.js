var mysql = require('/var/www/html/analysis/node_modules/mysql');
var fs = require("fs");

var prices = [];
prices['price_parser_sell'] = 0;
prices['price_parser_buy'] = 0;
prices['price_localbitcoins_sell'] = 0;
prices['price_localbitcoins_buy'] = 0;
prices['last_id'] = 0;
var prices = [];
prices['price_parser_sell'] = 0;
prices['price_parser_buy'] = 0;
prices['price_localbitcoins_sell'] = 0;
prices['price_localbitcoins_buy'] = 0;
prices['last_id'] = 0;

function cybermoney() {

    var percent = 0;
    var percent2 = 0;

    var connection = mysql.createPool({
        host: process.env.CB_HOST,
        user: process.env.CB_USER,
        password: process.env.CB_PASS,
        database: process.env.CB_DB
    });


    connection.query('SELECT id, tech_name, naps_name, curs1, curs2 from rwil_naps', function (err, rows, fields) {
        if (!err) {
            //console.log('The fields is: ', fields);
            var str = '<meta charset="UTF-8">' +
                '<head>\n' +
                '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>\n' +
                '</head>' +
                '<script>' +
                '  $(function() {\n' +
                'setInterval("location.reload();",180000);' +
                '' +
                '//$( "#b" ).load( "prices.html" );\n' +
                '' +
                '' +
                '  });' +
                '</script><div id="b"></div><table style="border:1px solid;">';
            str += '<tr><td style="width:30px;  padding:5px; float:left">id</td><td style="width:380px;  padding:5px; float:left"> ' +
                'Направление </td><td style="width:100px;  padding:5px; float:left">курс 1</td>' +
                '<td style="width:100px;  padding:5px; float:left">курс 2</td>' +
                '<td style="width:150px;  padding:5px; float:left">&nbsp;&nbsp;&nbsp;1 btc</td>' +
                '<td style="width:150px;  padding:5px; float:left">&nbsp;&nbsp;&nbsp;1 rub</td>' +
                '</tr>';
            for (var c in rows) {
                if (c % 2) {
                    var color = 'lightgrey';
                } else {
                    var color = 'lavender';
                }
                var w = 30;
                if (rows[c]['id'] == 22 || rows[c]['id'] == 23 || rows[c]['id'] == 27 || rows[c]['id'] == 28) {
                    str += '<tr  style="background-color: ' + color + ';">';
                    for (var i in rows[c]) {
                        if (i == 'tech_name') {
                            w = 350;
                        } else {
                            if (i == 'curs1' || i == 'curs2') {
                                w = 100;
                            } else {
                                w = 30;
                            }
                        }
                        if (i != 'naps_name') {
                            str += '<td style="height:20px;  padding:5px; width:' + w + 'px; float:left"> ' +
                                rows[c][i] + '</td>';
                        }
                    }

                    if (rows[c]['id'] == 22) {//22 Bitcoin BTC → Яндекс.Деньги RUB
                        prices['price_parser_sell'] = rows[c]['curs2'] * rows[c]['curs1'];
                        percent = rows[c]['curs1'];
                    }
                    if (rows[c]['id'] == 23) {//23 Яндекс.Деньги RUB → Bitcoin BTC
                        prices['price_parser_buy'] = 1/ rows[c]['curs2'] * rows[c]['curs1'];
                    }

                    if (rows[c]['id'] == 22 || rows[c]['id'] == 28) {
                        var price = rows[c]['curs2'] * rows[c]['curs1'];
                    }
                    if (rows[c]['id'] == 23 || rows[c]['id'] == 27) {
                        var price = 1/rows[c]['curs2'] * rows[c]['curs1'];
                        percent2 = rows[c]['curs1'];
                    }

                    str += '<td style="height:20px; background-color: blanchedalmond;   padding:5px; width:150px; float:left">' +
                        price + '</td>' +
                        '<td style="height:20px; background-color: blanchedalmond;   padding:5px; width:150px; float:left">' +
                        1 / price + '</td>' +
                        '<td style="height:20px;  background-color: beige; padding:5px; width:150px; float:left">' +
                        '<a target=_blank href="http://www.cyber.money/wp-admin/admin.php?page=pn_add_naps&item_id=' + rows[c]['id'] + '">редактировать</a> | ' +
                        '<a target=_blank href="http://www.cyber.money/exchange_' + rows[c]['naps_name'] + '/">сайт</a></td>' + '</tr>';

                }
            }
            str += '</table>';

            connection.query('SELECT price_cron from `upd_naps` WHERE price_cron!=0 ORDER BY id DESC LIMIT 1', function (err, rows, fields) {
                if (!err) {
                    console.log("price_cron  " + rows[0]["price_cron"]);
                    var prices = rows[0]["price_cron"].split("|");
                    console.log("price_cron  " + prices[0] * percent + " == " + 1 / (prices[1] * percent2));
                    prices['price_parser_sell'] = prices[0] * percent;
                    prices['price_parser_buy'] = prices[1] * percent2;
                }

            });
                console.log("..........................." +  prices['price_parser_buy']);
            connection.query('INSERT INTO `upd_naps`(`id`, `price_parser_sell`, `price_parser_buy`, `price_localbitcoins_buy`, `price_localbitcoins_sell`, `price_bestchange_buy`, `price_bestchange_sell`, `price_new_sell`, `price_new_buy`, `price_cron`, `upd_time`) VALUES (NULL, "' +
                prices['price_parser_sell'].toFixed(2) + '", "' +
                prices['price_parser_buy'].toFixed(2) + '", "0","0","0","0","0","0","0",NOW())', function (err, rows, fields) {
                if (!err) {
                    var str = 'Создана новая запись в таблице `upd_naps` id : ';
                    prices['last_id'] = rows.insertId;
                    //console.log('<br/> ', str + prices['last_id']);
                    str += str + prices['last_id'];
                    //res.send(str);
                }
                else
                    console.log(err);
                var str = err;
                //console.log(err);
            });

            fs.writeFile("report_temp.html", '<h3>Направления обмена cyber.money</h3>' + str, function (error) {
                if (error) throw error;
            });

            return true;
        }
        else {
            console.log(err);
            return false;
        }

    });

    setTimeout(function () {
        connection.end();
    }, 7000);

}

module.exports = cybermoney;
cybermoney();