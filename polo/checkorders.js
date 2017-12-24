Poloniex = require('poloniex-api-node');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});


function checkorders(params) {
    if (!params.livetrade) return
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    connection.query('SELECT * from `p_orders_log` WHERE `status`="buy"', function (err, rows, fields) {
        if (!err) {
            rows.map(x => {

                poloniex.getMarginPosition(x["pair"], (error, data) => {
                    console.log("getMarginPosition ---------------------- " + error);
                    console.log("getMarginPosition ---------------------- " + data);
                    let str = "";
                    for(var x in data){
                        str+= x + " ^^^^^-------------> " + data[x]
                    }
                    console.log(str)
                })
                poloniex.returnOrderTrades(x["order"], function (error, data) {
                    console.log("returnOrderTrades data................", data);
                    console.log("returnOrderTrades err.................", error);

                    if (!error) {
                        console.log("data.length ---------------------- " + data.length);
                        console.log("data ---------------------- " + data);
                        // if (true) {
                        console.log("sell................" + x["pair"]);
                        console.log("x[qnt]................" + x["qnt"]);
                        var qnt = x["qnt"] / 1;
                        qnt = (qnt - qnt * 0.01).toFixed(8)

                        poloniex.sell(x["pair"], x["order_sell"], qnt, 0, 0, 1, function (errs, resp) {
                            console.log("resp................", resp);
                            console.log("qnt " + qnt + " pair" + x["pair"])
                            console.log("errs.................", errs);
                            if (!errs) {
                                console.log("errs.................", errs);
                                connection.query('INSERT INTO `p_orders_log`(`id`, `pair`,  `qnt`, `order_sell`, `order_buy`, `upd_time`, `order`, `status`) VALUES (NULL, "' +
                                    x["pair"] + '", "' + x["qnt"] + '","' + x["order_sell"] + '", "' + x["order_buy"] + '", NOW(), "' + resp.orderNumber + '", "sell" )', function (err, rows, fields) {
                                    if (!err) {
                                        console.log('new data log record');
                                    }
                                    else
                                        console.log('new data log err' + err);
                                })
                            }
                        })
                        //  }
                        console.log("returnOpenOrders data................", data);
                        console.log("returnOpenOrders err.................", error);

                    }
                })
            })
        }
    });
    setTimeout(function () {
        connection.end()
    }, 4000)
}

module.exports = checkorders;