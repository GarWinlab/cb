 var localbitcoins = require('./localbitcoins'),
    cybermoney = require('./cybermoney'),
    bestchange = require('./bestchange'),
    bestchange2 = require('./bestchange2'),
    analysis = require('./analysis');
var request = require('request');
var mysql = require('/var/www/html/analysis/node_modules/mysql');
var connection = mysql.createPool({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});

var params = [];
var errors = 0;

cybermoney();

try {
    connection.query('SELECT * FROM upd_report', function (err, rows, fields) {
        if (!err) {
            params = rows[0];
            //var url = "https://localbitcoins.com/places/570819/moscow-ru/";
      /*      request({url: rows[0]["link_localbitcoins"], method: 'HEAD'}, function (err, res) {
                if (err) {
                    console.log("localbitcoins request error");
                } else {
                    if (/4\d\d/.test(res.statusCode) === false) {
                        if (res.statusCode == 200) {
                            if (!errors) {
                                    localbitcoins(params);
                            }
                            console.log(200);
                        } else {
                            console.log(400 + " === " + res.statusCode);
                        }

                    }
                }
            });*/
        }
    });
    setTimeout(function () {
        connection.end();
    }, 5000);
}
catch (err) {
    console.log("localbitcoins error " + err);
}
setTimeout(function () {
    try {
        if (!errors) {
            request({url: params["link_bestchange_sell"], method: 'HEAD'}, function (err, res) {
                if (err) {
                    console.log("bestchange request error");
                    errors++;
                } else {
                    if (/4\d\d/.test(res.statusCode) === false) {
                        if (res.statusCode == 200) {
                            bestchange(params);
                            console.log(200);
                        }
                    }
                }
            });
        }
    }
    catch (err) {
        console.log("bestchange error " + err);
    }
}, 30000);

setTimeout(function () {
    try {
        request({url: params["link_localbitcoins"], method: 'HEAD'}, function (err, res) {
            if (err) {
                console.log("bestchange2 request error");
                errors++;
            } else {
                if (/4\d\d/.test(res.statusCode) === false) {
                    if (res.statusCode == 200) {
                        bestchange2(params);
                        console.log(200);
                    }
                }
            }
        });
    }
    catch (err) {
        console.log("bestchange2 error " + err);
    }
}, 45000);

setTimeout(function () {
    try {
        if (!errors) analysis(params);
    }
    catch (err) {
        console.log("analysis error " + err);
    }
}, 65000);

