/**
 * prepared data
 * btc - usd | https://www.bitstamp.net
 * usd - rub | http://cbr.ru
 */
//setInterval(function(){

var mysql = require('/var/www/html/analysis/node_modules/mysql');
var fs = require("fs");

try {
    var Spooky = require('/var/www/html/analysis/node_modules/spooky');
} catch (e) {
    var Spooky = require('../lib/spooky');
}

function localbitcoins(params) {
    console.log("============== " + params["link_localbitcoins"]);
    var connection = mysql.createConnection({
        host: process.env.CB_HOST,
        user: process.env.CB_USER,
        password: process.env.CB_PASS,
        database: process.env.CB_DB
    });
    var spooky = new Spooky({
        casper: {
            logLevel: 'debug',
            verbose: true
        },
        child: {
            transport: 'http',
            port: 8080
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }

        spooky.start(params["link_localbitcoins"]);
        spooky.then(function () {
            this.emit('hello', '<meta charset="UTF-8"> ' + this.evaluate(function () {

                var sell = $('#sell-bitcoins-online .column-price');
                var s = sell[0].innerHTML.replace(",", "").replace("RUB", "");
                var buy = $('#purchase-bitcoins-online .column-price');
                var b = buy[0].innerHTML.replace(",", "").replace("RUB", "");
                var str = '<br />************************************************************************************';
                str += "<h3><a target='_blank' href='https://localbitcoins.com/places/570819/moscow-ru/'>https://localbitcoins.com/places/570819/moscow-ru/</a></h3>" +
                    "<table id=\"sell-bitcoins-online\" class=\"col-md-12\">" +
                    document.querySelector("#sell-bitcoins-online .table-bitcoins").innerHTML
                    + "</table> <br /><b>" + s + "</b>";

                str += "<br /><table id=\"purchase-bitcoins-online\" class=\"col-md-12\">" +
                    document.querySelector("#purchase-bitcoins-online .table-bitcoins").innerHTML
                    + "</table> <br /><b>" + b + "</b>";

                return str + "iiiiiii" + s + "|||" + b;
            }));
        });
        spooky.run();
    });

    spooky.on('error', function (e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });


/*
    // Unprice_new_buy this block to see all of the things Casper has to say.
    // There are a lot.
    // He has opinions.

    spooky.on('console', function (line) {
        console.log(line);
    });
*/


    spooky.on('hello', function (greeting) {
        var g = greeting.split("iiiiiii");
        //console.log(g[0]);
        var price = g[1].split("|||");

        var report = g[0];

        fs.appendFile("report_temp.html", report, function (error) {
            if (error) throw error; // если возникла ошибка
            console.log("localbitcoins report ");
        });
        connection.query('UPDATE `upd_naps` SET price_localbitcoins_buy="' + price[1] + '", price_localbitcoins_sell="' + price[0] + '" WHERE price_bestchange_sell = 0', function (err, rows, fields) {
       // connection.query('UPDATE `upd_naps` SET price_localbitcoins_buy="' + price[1] + '", price_localbitcoins_sell="' + price[0] + '" WHERE price_localbitcoins_sell = 0', function (err, rows, fields) {
            if (err)  console.log(err);
        });

        connection.end();
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*!/, ''));
        }
    });
}

//}, 10*1000);

module.exports = localbitcoins;

//localbitcoins();
