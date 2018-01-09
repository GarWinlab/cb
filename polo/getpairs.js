Poloniex = require('poloniex-api-node');
var mysql = require('mysql');

function getpairs(params) {
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    poloniex.returnBalances(function (err, balances) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("balances.BTC " + balances.BTC);
            /**
             *  max pair limit
             *
             * */
            if (params.balance > balances.BTC) {
                console.log("balance is over")
                return
            }
        }
    });
    let rank_array = [];
    let ask_bid = [];
    var connection = mysql.createConnection({
        host: process.env.CB_HOST,
        user: process.env.CB_USER,
        password: process.env.CB_PASS,
        database: process.env.CB_DB
    })
    let polo = new Promise(function (res, rej) {


        connection.query('SELECT count(*) as count FROM `p_orders`', function (err, rows, fields) {
            if (!err) {
                if (params.pairs > rows[0]["count"] / 1) {
                    console.log("=---------> " + rows[0]["count"])
                    params.pairs = params.pairs - rows[0]["count"] / 1


                    poloniex.returnTicker().then((ticker) => {
                        if (true) {
                            let c = 0
                            let pairs = []
                            connection.query('SELECT `pair` FROM `p_orders` WHERE `status`="open" OR `status`="pending"', function (err, rows, fields) {
                                if (!err) {
                                    rows.map(x => {
                                        pairs.push(x["pair"])
                                    })
                                    var polo = []
                                    for (var key in ticker) {
                                        let rank = (ticker[key].lowestAsk - ticker[key].highestBid) / ticker[key].highestBid * ticker[key].baseVolume;
                                        console.log(key)
                                        if (key.indexOf("BTC") + 1
                                            && !(pairs.indexOf(key) + 1)
                                            && !(key.indexOf("BTCD") + 1)
                                            && !(key.indexOf("DOGE") + 1)
                                            && !(key.indexOf("USDT") + 1)) {
                                            /**
                                             *  compare bids_sum and asks_sum
                                             *
                                             * */
                                            let bids_sum = 0
                                            let asks_sum = 0
                                            let p = []

                                            p[key] = new Promise(function (resolve, reject) {
                                                var that = this
                                                that.key = key
                                                that.c = c
                                                var forbind = {
                                                    key: that.key,
                                                    getKey: function () {
                                                        return this.key;
                                                    }
                                                }
                                                var retrieveKey = forbind.getKey;
                                                polo[key] = poloniex.returnOrderBook(that.key, params.depth, (er, re) => {
                                                    var boundKey = retrieveKey.bind(forbind)
                                                    if (!er) {
                                                        for (var x in re['bids']) {
                                                            let item_bid = re['bids'][x][0] * re['bids'][x][1]
                                                            bids_sum = bids_sum + item_bid;
                                                        }
                                                        for (var x in re['asks']) {
                                                            let item_ask = re['asks'][x][0] * re['asks'][x][1]
                                                            asks_sum = asks_sum + item_ask;
                                                        }

                                                        /**
                                                         *   bid - sell
                                                         *   ask - buy
                                                         *
                                                         *   BTC_PPC ask -- 0.00031071 3.5402948
                                                         *   BTC_PPC bids -- 0.00031709 0.32652527
                                                         *   if (asks_sum > bids_sum)
                                                         *
                                                         * */

                                                        //console.log(boundKey() + " asks_sum " + asks_sum + "  bids_sum " + bids_sum);
                                                        if (asks_sum > bids_sum) {
                                                            ask_bid.push(boundKey())
                                                        }
                                                        resolve();
                                                    } else {
                                                        reject();
                                                    }
                                                })

                                                rank_array[this.c] = {
                                                    rank: rank,
                                                    name: key,
                                                    // ask_bid: ask_bid,
                                                    lowestAsk: ticker[key].lowestAsk,
                                                    highestBid: ticker[key].highestBid,
                                                    percentChange: ticker[key].percentChange
                                                }
                                            }).catch(function (e) {
                                                //console.log(e)
                                            })
                                        }
                                        c++
                                    }

                                } else {
                                    console.log(err)
                                }
                            })
                            setTimeout(function () {
                                res();
                            }, 12000)

                        }
                    })


                } else {
                    console.log("<---------= " + rows[0]["count"])
                    params.livetrade = 0
                    return
                }
            } else {
                console.log(err)
            }
        })

        console.log("need by more " + params.pairs)


    })
    polo.then(function () {
        console.log("then")
        var ranks = rank_array.sort(function (a, b) {
            return a.rank - b.rank
        })
        ranks.reverse()
        let c = 0
        ranks.map(x => {
            if (x.percentChange > 0 && (ask_bid.indexOf(x.name) + 1)) {
                if (c < params.pairs) {
                    console.log(x.name + "  rank : " + x.rank + " highestBid : " + x.highestBid);
                    let qnt = params.balance / params.pairs / x.highestBid
                    let highestBid = x.highestBid / 1
                    let new_price = x.highestBid / 1 + x.highestBid / 1 * params.profit
                    let stop_loss = x.highestBid / 1 - x.highestBid / 1 * params.stop_loss
                    if (params.livetrade) {
                        /**
                         *  buy
                         *
                         * */
                        poloniex.buy(x.name, highestBid, qnt, 0, 0, 1, function (errs, data) {
                            // params.orderNumbers.push(data.orderNumber)
                            console.log("buy data................", data)
                            if (!errs) {
                                if (typeof(data.orderNumber) != "undefined") {
                                    connection.query('INSERT INTO `p_orders`(`id`, `pair`, `price`, `qnt`, `order_sell`, `stop_loss`, `status`, `balance`, `upd_time`, `order`) VALUES (NULL, "' +
                                        x.name + '", "' + highestBid.toFixed(8) + '", "' + qnt + '", "' + new_price.toFixed(8) + '", "' + stop_loss.toFixed(8) + '", "open","1",NOW(),"' + data.orderNumber + '" )', function (errors, rows, fields) {
                                        if (errors) {
                                            console.log(errors);
                                        }
                                    })
                                    /*
                                    *
                                    * log
                                    *
                                    * */
                                    connection.query('INSERT INTO `p_orders_log`(`id`, `pair`,  `qnt`, `order_sell`, `order_buy`, `upd_time`, `order`, `status`) VALUES (NULL, "' +
                                        x.name + '", "' + qnt + '","' + new_price.toFixed(8) + '", "' + highestBid.toFixed(8) + '", NOW(), "' + data.orderNumber + '", "pending" )', function (errors, rows, fields) {
                                        if (!errors) {
                                            console.log(errors);
                                        }
                                    })
                                } else {
                                    console.log("...............................try again................................")
                                }
                            } else {

                                connection.query('INSERT INTO `p_orders`(`id`, `pair`, `price`, `qnt`, `order_sell`, `stop_loss`, `status`, `balance`, `upd_time`, `order`) VALUES (NULL, "' +
                                    x.name + '", "' + highestBid.toFixed(8) + '","' + qnt + '","' + new_price.toFixed(8) + '", "' + stop_loss.toFixed(8) + '", "pending","1",NOW(),"' + data.orderNumber + '" )', function (errors, rows, fields) {
                                    if (errors) {
                                        console.log(errors);
                                    }
                                })

                            }
                        })


                    } else {
                        return
                    }
                }
                c++
            }
        })

    })
    polo.then(function () {
        connection.query('SELECT `pair` FROM `p_orders` WHERE `status`="pending"', function (err, rows, fields) {
            if (!err) {
                rows.map(x => {

                    //  pairs.push(x["pair"])


                })
            }

        })
    })
    polo.then(function () {

        setTimeout(function () {
            connection.end();
        }, 10000)

    })
}


module.exports = getpairs;