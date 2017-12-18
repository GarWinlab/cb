var mysql = require('mysql');
var fs = require("fs");

function analysis(params) {
    var connection = mysql.createPool({
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
            var str = '<meta charset="UTF-8"><table style="border:1px solid;">';
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
                        exp_buy = rows[c]["price_new_sell"] / 1;
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
            str += '</table>';

            console.log("analysis before update");


        } else {
            var str = err;
            // console.log(err);
        }

        fs.appendFile("report_temp.html", str, function (error) {
            if (error) throw error; // если возникла ошибка
            console.log("analysis report");
            var data = fs.readFileSync("report_temp.html", "utf8");
            fs.writeFile("report.html", data, function (error) {
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
                        price_export_sell =  rows[c][i] / 1.01 ; //  yandex -1% = qiwi
                        price_export_sell =  price_export_sell.toFixed(2)
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

analysis();
