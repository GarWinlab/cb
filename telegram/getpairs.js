Poloniex = require('poloniex-api-node');

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
    let polo = new Promise(function (res, rej) {


        poloniex.returnTicker().then((ticker) => {
            if (true) {
                let c = 0
                var polo = []
                for (var key in ticker) {
                    let rank = (ticker[key].lowestAsk - ticker[key].highestBid) / ticker[key].highestBid * ticker[key].baseVolume;
                     console.log(key)
                    if (key.indexOf("BTC") + 1
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

                        /*     p[key] = new Promise(function (resolve, reject) {
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

                                         /!**
                                          *   bid - sell
                                          *   ask - buy
                                          *
                                          *   BTC_PPC ask -- 0.00031071 3.5402948
                                          *   BTC_PPC bids -- 0.00031709 0.32652527
                                          *   if (asks_sum > bids_sum)
                                          *
                                          * *!/

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
                             })*/
                    }
                    c++
                }

                //  setTimeout(function () {
                res();

                //  }, 3000)

            }
        })
    })
    polo.then(function () {
        console.log("then")
        return "then";
        var str = ""
        var ranks = rank_array.sort(function (a, b) {
            return a.rank - b.rank
        })
        ranks.reverse()
        let c = 0
        ranks.map(x => {
            if (x.percentChange > 0 && (ask_bid.indexOf(x.name) + 1)) {
                if (c < params.pairs) {
                    str += x.name + "  rank : " + x.rank + " highestBid : " + x.highestBid + "\n";
                    //console.log(x.name + "  rank : " + x.rank + " highestBid : " + x.highestBid);
                    let qnt = params.balance / params.pairs / x.highestBid
                    let highestBid = x.highestBid / 1
                    let new_price = x.highestBid / 1 + x.highestBid / 1 * params.profit
                    let stop_loss = x.highestBid / 1 - x.highestBid / 1 * params.stop_loss
                }
                c++
            }
        })
        console.log(str)

        return str;

    })
}


module.exports = getpairs;