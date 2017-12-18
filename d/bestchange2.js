var mysql = require('mysql');
var fs = require("fs");
var connection = mysql.createPool({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});

function bestchange2(params) {
    console.log("bestchange2");
    var spooky_params = [params["link_bestchange_buy"],
        params["reserv_min_btc"],
        params["exchange_min_review"]];
    var url = params["link_bestchange_buy"];
    try {
        var Spooky = require('spooky');
    } catch (e) {
        var Spooky = require('../lib/spooky');
    }

    var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            verbose: true,
            logLevel: 'debug',
            exitOnError: false,
            ignoreSslErrors: true,
            clientScripts: "/var/www/html/wp-content/plugins/investbox/premium/js/jquery.min.js",
            pageSettings: {
                javascriptEnabled: true,
                loadImages: true,
                loadPlugins: true,
                localToRemoteUrlAccessEnabled: true,
                userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
                XSSAuditingEnabled: false,
                logLevel: 'debug'
            }
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }

        spooky.start(url);
        spooky.then([{params: spooky_params}, function () {
            console.log(222);
            this.capture('screenshots/amazon-search-3.png');
            this.emit('hello', '<meta charset="UTF-8"> ' + this.evaluate(function (params) {
                // var s = document.querySelector("#rates_block .bi").innerHTML.replace(/[^.\d]+/g, "").replace(/^([^\.]*\.)|\./g, '$1');
                var p = $("#content_table").find("tbody").find("tr").find(".ar").prev().prev();//price
                var r = $("#content_table").find("tbody").find("tr").find(".ar");//reserv
                var l = $("#content_table").find("tbody").find("tr").find(".ar").next().find(".pos");//positive response
                var string = "";
                var search_pattern = "";
                $.each(r, function (k, v) {
                    v = v.innerHTML.replace(/ /g, '');
                    var positive = l[k].innerHTML;
                    if (v / 1 > params[1] && string == "" && positive / 1 > params[2]) {

                        search_pattern += p[k].innerHTML;
                        string += p[k].innerHTML.replace(/[^.\d]+/g, "").replace(/^([^\.]*\.)|\./g, '$1');
                    }
                });
                var str = '<div id="rates_block" style="height:300px; overflow-y: scroll">' + $("#rates_block").html() + '</div>';
                var marker = "<span style='background-color:greenyellow; border:2px solid #0f0f0f; padding:5px;'>" + string + "</span>";
                return str.replace(search_pattern, "<span style='background-color:greenyellow; border:1px dotted #0f0f0f; padding:5px;'>" +
                    string + "</span>")
                    .replace("<img ", "<span") + marker + "|||" + string;
            }, {params: params}));
        }]);

        spooky.run();
    });

    spooky.on('error', function (e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });


    // Uncomment this block to see all of the things Casper has to say.
    // There are a lot.
    // He has opinions.
    spooky.on('console', function (line) {
        console.log(line);
    });


    spooky.on('hello', function (greeting) {
        var g = greeting.split("|||");
        var report = "<h3><a target='_blank' href='" + url + "'>" + url + "</a></h3>" + g[0];
        var price = g[1] / 1;

        if (params["step_size_rub"]) {
            var price_new = g[1] / 1 - params["step_size_rub"];
        }
        if (params["step_size_percent"]) {//1000*35:100=350 рублей
            var price_new = g[1] / 1 - g[1] / 1 * params["step_size_percent"] / 100;
        }


        var price_parser = 0;
        //SELECT price_cron from upd_naps WHERE price_cron!=0 ORDER BY id DESC LIMIT 1
        connection.query('SELECT price_parser_buy from upd_naps ORDER BY id DESC LIMIT 1', function (err, rows, fields) {
            if (!err) {
                price_parser = rows[0]["price_parser_buy"] / 1;
                if (price_parser != 0 && price_parser > price_new) {
                    price_new = price_parser;
                }
            }
        });

        connection.query('UPDATE `upd_naps` SET price_bestchange_buy="' + price.toFixed(2) + '", price_new_buy="' + price_new.toFixed(2) + '" WHERE price_bestchange_buy = 0', function (err, rows, fields) {
            if (!err) {
                var str = '<br />************************************************************************************';
                //console.log('<br/> ', 'Обновлена запись в таблице `upd_naps`' + str);
                report += '<br/> Обновлена запись в таблице `upd_naps`' + str;
            }
            else {
                report += err;
                console.log("bestchange2 err: " + err);
            }

            fs.appendFile("report_temp.html", report, function (error) {
                if (error) throw error; // если возникла ошибка
                console.log("bestchange2 report");
            });

        });
        setTimeout(function () {
            connection.end();
        }, 10000);


    });


    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });
}

module.exports = bestchange2;


/*var params = [];
params["link_bestchange_buy"] = 'https://www.bestchange.ru/bitcoin-to-visa-mastercard-rur.html';
params["step_size_rub"] = '1000';
params["step_size_percent"] = '0';
params["reserv_min_btc"] = '2';

bestchange2(params);*/

