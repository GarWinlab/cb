Poloniex = require('poloniex-api-node');
var mysql = require('mysql');

function getpairs(params) {
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    poloniex.returnTicker().then((ticker) => {
        if (true) {
            let rank_array = [];
            let c = 0;
            for (var key in ticker) {
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
                    if (c < params.pairs) {
                        console.log(x.name + "  rank : " + x.rank + " highestBid : " + x.highestBid);
                        //balance - percent of loses
                        let qnt = params.balance / params.pairs / x.highestBid
                        let highestBid = x.highestBid / 1
                        let new_price = x.highestBid / 1 + x.highestBid / 1 * params.profit
                        poloniex.buy(x.name, highestBid, qnt, 0, 0, 1, function (err, data) {
                            params.orderNumbers.push(data.orderNumber)
                            console.log("buy data................", data);
                            console.log("buy err.................", err);

                            if (!err) {
                                var connection = mysql.createConnection({
                                    host: process.env.CB_HOST,
                                    user: process.env.CB_USER,
                                    password: process.env.CB_PASS,
                                    database: process.env.CB_DB
                                });
                                connection.query('INSERT INTO `p_orders`(`id`, `pair`, `price`, `qnt`, `order_sell`, `status`, `balance`, `upd_time`, `order`) VALUES (NULL, "' +
                                    x.name + '", "' + highestBid.toFixed(15) + '","' + qnt + '","' + new_price.toFixed(15) + '", "open","1",NOW(),"' + data.orderNumber + '" )', function (err, rows, fields) {
                                    if (!err) {
                                        var str = 'new data in `p_orders`';
                                    }
                                    else
                                        console.log(err);
                                })
                                connection.end();
                            }
                        })
                    }
                    c++
                }
            })
        }

        // return ticker;
    })
}

module.exports = getpairs;