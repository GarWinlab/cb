Poloniex = require('poloniex-api-node');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});


function checkorders(params) {

    console.log("livetrade " + params.livetrade + ", maximum pairs limit " + params.pairs)
    if (!params.livetrade) {
        return
    }
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    connection.query('SELECT * from `p_orders` WHERE `status`="open" OR `status`="pending" LIMIT 1', function (err, rows, fields) {
        if (!err) {
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            console.log("///////////////////////////////////////////////////////////");
            rows.map(x => {

                /* poloniex.getMarginPosition(x["pair"], (error, data) => {
                     console.log("getMarginPosition ---------------------- " + error);
                     console.log("getMarginPosition ---------------------- " + data);
                     let str = "";
                     for (var x in data) {
                         str += x + " ^^^^^-------------> " + data[x]
                     }
                     console.log(str)
                 })*/


                if (x["order"] != "undefined") {

                    poloniex.returnOrderTrades(x["order"], function (error, data) {
                        if (typeof(data) == "undefined") return
                        console.log("returnOrderTrades data................", data);
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


                                //console.log("qnt " + qnt + " pair" + x["pair"])
                                //console.log("errs.................", errs);

                                if (!errs) {

                                    connection.query('INSERT INTO `p_orders_log`(`id`, `pair`,  `qnt`, `order_sell`, `order_buy`, `upd_time`, `order`, `status`) VALUES (NULL, "' +
                                        x["pair"] + '", "' + x["qnt"] + '","' + x["order_sell"] + '", "' + x["order_buy"] + '", NOW(), "' + resp.orderNumber + '", "sell" )', function (err, rows, fields) {
                                        if (err) throw err;
                                        if (!err) {
                                            console.log(x["pair"] + ' sell log record');
                                        }


                                    })
                                } else {

                                    /**
                                     * todo: test
                                     * delete sold
                                     *
                                     * */


                                    //
                                    connection.query('UPDATE `p_orders_log` SET status = `sold` WHERE `pair` LIKE "' + x["pair"] + '"', function (err, result) {
                                        if (err) throw err;
                                        console.log("///////////////////////////////////////////////////////////");
                                        console.log("Delete from pairs collection : " + x["pair"]);
                                        console.log("Number of records UPDATE: " + result.affectedRows);
                                        console.log("///////////////////////////////////////////////////////////");

                                    })
                                    connection.query('INSERT INTO `p_orders_log`(`id`, `pair`,  `qnt`, `order_sell`, `order_buy`, `upd_time`, `order`, `status`) VALUES (NULL, "' +
                                        x["pair"] + '", "' + x["qnt"] + '","' + x["order_sell"] + '", "' + x["order_buy"] + '", NOW(), "' + resp.orderNumber + '", "removed" )', function (err, rows, fields) {
                                        if (err) throw err;
                                    })
                                }
                            })
                            //  }
                            console.log("returnOpenOrders data................", data);
                            // console.log("returnOpenOrders err.................", error);

                        }
                    })
                }else{
                    console.log("undefined order")
                }
            })
        }
    });
    setTimeout(function () {
        console.log("setTimeout 4000 connection.end")
        connection.end()
    }, 4000)
}

module.exports = checkorders;