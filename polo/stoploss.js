Poloniex = require('poloniex-api-node');
var mysql = require('mysql');
var fs = require("fs");

function stop_loss(params) {
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);

    var connection = mysql.createConnection({
        host: process.env.CB_HOST,
        user: process.env.CB_USER,
        password: process.env.CB_PASS,
        database: process.env.CB_DB
    })
    let polo = new Promise(function (res, rej) {
        let pairs = []
        connection.query('SELECT * FROM `p_orders` ', function (err, rows, fields) {//WHERE `status`="open"
            if (!err) {
                let strOrders = 'stop loss \n'
                rows.map(x => {
                    //pairs.push(x["pair"])
                    pairs.push(x["pair"])
                    strOrders += x["pair"] + ' : ' + x["stop_loss"] + '\n'
                    console.log(x["pair"] + ' : ' + x["stop_loss"])
                })
                poloniex.returnTicker().then((ticker) => {

                    for (var key in ticker) {
                        let rank = (ticker[key].lowestAsk - ticker[key].highestBid) / ticker[key].highestBid * ticker[key].baseVolume;
                       // console.log(key)
                        if (key.indexOf("BTC") + 1
                            && (pairs.indexOf(key) + 1)) {
                            console.log(' lowestAsk ' + key + ' : ' + ticker[key].lowestAsk)
                        }
                    }

                }).then(() => {
                    console.log("then")
                }).then(() => {
                    connection.end();
                    console.log("end")
                })

                fs.writeFile("stoploss.html", strOrders, function (error) {
                    if (error) throw error; // если возникла ошибка
                });


            } else {
                console.log(err)
            }
        })

    })
   /* polo.then(function () {

        setTimeout(function () {
            connection.end();
            console.log("end")
            return
        }, 5000)

    })*/
}


module.exports = stop_loss

var params = {}
//change for best result

params.livetrade = 1 // if you need only advice livetrade = 0, real orders livetrade = 1
params.pairs = 5 // Maximum pairs number
params.balance = 0.015 // BTC
params.profit = 0.03 // 0.02 is 2%
params.stop_loss = 0.03 // 0.02 is 2%
params.depth = 20 // 0.02 is 2%

params.ticker_ = []
params.close_orders = []
params.orderNumbers = []
params.polo_key = "6VOZJLTB-OZZCQJSS-G3IRTAJD-52DX25XZ"
params.polo_secret = "7eab4caaf4efc029569b872fc0c9f6eab0623f7b47dd1726725abe9fe029ed254764900ada6c6787f861e3ea5689ec1dfb8d8ad8342aef144453582bd7830989"

stop_loss(params)