Poloniex = require('poloniex-api-node');
var mysql = require('mysql');
var mysql2 = require('promise-mysql');
//var async = require('async');
var fs = require("fs");
var connection = mysql.createConnection({
    host: process.env.CB_HOST,
    user: process.env.CB_USER,
    password: process.env.CB_PASS,
    database: process.env.CB_DB
});
let poloniex = new Poloniex();

/*poloniex = new Poloniex({ socketTimeout: 10000 });
poloniex = new Poloniex('myKey', 'mySecret');
poloniex = new Poloniex('myKey', 'mySecret', { socketTimeout: 130000 });*/

let pairs = 5; //Maximum number of traded pairs
let balance = 1; //BTC
let profit = 0.02; //%
let close_pair = 0.02;
let ticker_ = []
let close_orders = []

poloniex.returnTicker().then((ticker) => {
    ticker_ = ticker
    //console.log(ticker);
    //console.log(ticker.BTC_ETH);

    connection.query('SELECT `id`, `pair`, `price`, `qnt`, `order_sell` from `p_orders` WHERE `status`="open"', function (err, rows, fields) {
        if (!err) {


            //pairs_parser = rows[0]["pair"];
            rows.map(x => {
                console.log("--->" + x["pair"]);

                setTimeout(function () {


                    for (var key in ticker) {
                        if (key == x["pair"]) {

                            ticker.close_pair = 0.102;
                            if (true) {//ticker[key].lowestAsk / 1 > x["order_sell"] / 1
                                console.log("88888888888        " + x["id"]);
                                close_orders.push(x["id"])
                                /*
                                *
                                *  put order for sale
                                *
                                *
                                *
                                *
                                * */
                                // tVal = ticker[key];//some manipulation of someArr[i]
                                // (function (val) {
                                console.log("------------------------->");


                                //             connection.end();
                                // })(tVal);


                                console.log("order close");
                            } else {
                                console.log("wait");
                            }
                        }
                    }
                }, 2000);
                // console.log(eval('ticker.x["pair"]'));
            })


        } else {
            console.log(err);
        }
    });


    if (false) {
        console.log("+++" + true + "<<<<");
        let rank_array = [];
        let c = 0;
        for (var key in ticker) {
            //  console.log("========================>>> " + ticker[key].lowestAsk);
            let rank = (ticker[key].lowestAsk - ticker[key].highestBid) / ticker[key].highestBid * ticker[key].baseVolume;
            if (key.indexOf("BTC") + 1
                && !(key.indexOf("BTCD") + 1)
                && !(key.indexOf("DOGE") + 1)
                && !(key.indexOf("USDT") + 1)) {

                rank_array[c] = {
                    rank: rank,
                    name: key,
                    lowestAsk: ticker[key].lowestAsk,
                    highestBid: ticker[key].highestBid,
                    percentChange: ticker[key].percentChange
                }

                // if (ticker[key].percentChange > 2) { //grow up more then 2%

            }
            c++
        }
        var test = rank_array.sort(function (a, b) {
            return a.rank - b.rank
        })
        test.reverse()
        c = 0
        test.map(x => {
            if (x.percentChange > 0) {
                //console.log("x.percentChange ===>" + x.percentChange);
                if (c < pairs) {
                    console.log(x.name + "  rank : " + x.rank + " highestBid : " + x.highestBid);
                    //balance - percent of loses
                    let qnt = balance / pairs / x.highestBid
                    let highestBid = x.highestBid / 1
                    let new_price = x.highestBid / 1 + x.highestBid / 1 * profit
                    var tVal = test[x];
                    //(function(){
                    connection.query('INSERT INTO `p_orders`(`id`, `pair`, `price`, `qnt`, `order_sell`, `status`, `balance`, `upd_time`) VALUES (NULL, "' +
                        x.name + '", "' + highestBid.toFixed(15) + '","' + qnt + '","' + new_price.toFixed(15) + '", "open","1",NOW())', function (err, rows, fields) {
                        if (!err) {
                            var str = 'new data in `p_orders`';
                            /*
*
*  put order for buy
*
*
*
*
* */
                        }
                        else
                            console.log(err);
                    });
                    // })();
                }
                c++
            }
        })
        console.log('.....');
    }


})
    .then(() => {

        setTimeout(function () {

            console.log("¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥SSSS");
            console.log(close_orders.length);

            connection.query('UPDATE `p_orders` SET status="close" WHERE id in (' + close_orders.toString() + ')', function (error, results, fields2) {
                if (error) console.log(error);

            });


            /*    connection.query('SELECT `pair`, `price`, `qnt`, `order_sell` from `p_orders` WHERE `status`="open"', function (err, rows, fields) {
                    if (!err) {
                        setTimeout(function () {

                            connection.query('UPDATE `p_orders` SET status="close++" WHERE `status`="open"', function (err, rows, fields) {
                                if (err) console.log(err);
                            });
                            //console.log(" ============" + price_new_sell + " ============" + price_new_buy);
                        }, 1000)
                    }
                });*/
        }, 5000)

    })
    .then(() => {

        /*    connection.query('UPDATE `p_orders` SET status="close" WHERE pair = "BTC_LTC"', function (error, results, fields2) {

                //console.log(error, results, fields2);

                if (!error) {
                    console.log("---+++++---------------------->");
                    // var str = '<br />************************************************************************************';
                    //console.log('<br/> ', 'РћР±РЅРѕРІР»РµРЅР° Р·Р°РїРёСЃСЊ РІ С‚Р°Р±Р»РёС†Рµ `upd_naps`' + str);
                    // report += '<br/> РћР±РЅРѕРІР»РµРЅР° Р·Р°РїРёСЃСЊ РІ С‚Р°Р±Р»РёС†Рµ `upd_naps`' + str;
                }
                else {
                    console.log("---33333---------!!!!!!!!!!!!!!------------->");
                    console.log("+++" + error + "<<<<");
                }

            })*/

        //  connection.end();
        //222

        connection.end();
        console.log(" +++++++++++++++++++++++++++!!!!!!!!!!!!!++++++++++++++++++++++++++++ " + close_pair);


    }).catch((err) => {
    console.log(err.message);
});


/*{ id: 148,
    last: '0.05650000',
    lowestAsk: '0.05650000',
    highestBid: '0.05649999',
    percentChange: '0.11220494',
    baseVolume: '18278.25742811',
    quoteVolume: '335067.32502876',
    isFrozen: '0',
    high24hr: '0.05912120',
    low24hr: '0.04808000' }*/


/*
poloniex.subscribe('ticker');
poloniex.subscribe('BTC_ETH');

poloniex.on('message', (channelName, data, seq) => {
    if (channelName === 'ticker') {
        console.log(`Ticker: ${data}`);
    }

    if (channelName === 'BTC_ETC') {
        console.log(`order book and trade updates received for currency pair ${channelName}`);
        console.log(`data sequence number is ${seq}`);
    }
});

poloniex.on('open', () => {
    console.log(`Poloniex WebSocket connection open`);
});

poloniex.on('close', (reason, details) => {
    console.log(`Poloniex WebSocket connection disconnected`);
});

poloniex.on('error', (error) => {
    console.log(`An error has occured`);
});

poloniex.openWebSocket();*/

