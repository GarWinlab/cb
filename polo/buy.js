Poloniex = require('poloniex-api-node');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});


function buy(params) {
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    setTimeout(function () {
        connection.query('SELECT `pair`, `price`, `qnt`, `order_sell`, `order` from `p_orders` WHERE `status`="open"', function (err, rows, fields) {
            if (!err) {
                rows.map(x => {
                    poloniex.returnOpenOrders(x["pair"], function (err, data) {
                        if (!err) {
                            if (!data.length) { //bouth
                                x["order_sell"] = x["order_sell"] / 1
                                poloniex.sell(x["pair"], x["order_sell"].toFixed(8), x["qnt"], 0, 0, 1, function (err, data) {
                                    console.log("data................", data);
                                    console.log("err.................", err);
                                })
                            } else {
                                console.log("data................", data);

                                poloniex.cancelOrder(x["order"], function (err, data) {
                                    console.log("cancel data................", data);
                                    console.log("cancel err.................", err);
                                })
                                poloniex.returnOrderBook(x["pair"], null, function (err, data) {
                                    if (!err) {
                                        console.log("----------------------------------------------------")
                                        console.log(data.bids[1][0])
                                        poloniex.buy(x["pair"], data.bids[1][0], x["qnt"], 0, 0, 1, function (err, data) {
                                            console.log("buy data................", data);
                                            console.log("buy err.................", err);
                                        })
                                    }
                                    console.log(x["pair"] + " data................", data);
                                    console.log(x["pair"] + " err.................", err);

                                })
                            }
                            console.log("data................", data);
                            console.log("err.................", err);

                        }
                    })
                })
            }
        });
        connection.end()
    }, 22000);
}

module.exports = buy;