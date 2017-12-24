Yobit = require('./index.js')

params = []
process.argv.forEach((val, index) => {
    if (index == 2) {
        params["deposit"] = val
    }
    console.log(`${index}: ${val}`);
    if (index == 3) {
        params["profit"] = val
    }
    if (index == 4) {
        params["coin"] = val
    }
});

let deposit = params["deposit"]
let coin = params["coin"]
let profit = params["profit"] / 1
let pair = coin + "_btc"
let step = 0.05 //% for improove price to buy
let step2 = 0.1 //% next attemt to improove price to buy
let API_KEY = 'F7C4B986B74D35AA0821868B58663656'
let API_SECRET = '8bea956e19d97052c671826e76b7f538'

// Test public data APIs
var publicClient = new Yobit()
var privateClient = new Yobit(API_KEY, API_SECRET)

/**
 API_KEY = "F7C4B986B74D35AA0821868B58663656"
 API_SECRET = "8bea956e19d97052c671826e76b7f538"

 // get BTCUSD ticker
 publicClient.getTicker(function(err,data){
    console.log(data)
    return true}, 'btc_usd')

 // get BTCUSD Order Book
 publicClient.getOrderBook(function(err,data){
    console.log(data)
    return true}, 'btc_usd')

 // get BTCUSD trades
 publicClient.getTrades(function(err,data){
    console.log(data)
    return true}, 'btc_usd')
 **/

// get Account Balance

publicClient.getTicker(function (err, data) {
    for (var i in data) {
        console.log(i + " - " + data[i])
    }
    console.log("=============> " + data)
    console.log("=============> " + pair)
    console.log("=============> " + data[pair].last)
    console.log("qnt " + deposit / data[pair].last)
    console.log(data)
    let qnt = deposit / data[pair].last / 3
    let buyPrice = data[pair].sell + data[pair].sell * step
    let sellPrice = buyPrice * profit
    console.log("------------------+++ " + profit)
    //price is + 0.5% from last sell order
    privateClient.addTrade(function (err, data) {
        if (data.success) {
            //ставим ордер на продажу
            //   setTimeout(function(){
            privateClient.putOrderSale(pair, qnt, sellPrice * 0.01)
            //    },200)

        } else {
            console.log("................... bnb.........ups")
            console.log(err)
        }
        return true
    }, pair, 'buy', qnt, buyPrice + buyPrice * 0.09)    //price is + 0.5% from last sell order
    setTimeout(function () {
        privateClient.addTrade(function (err, data) {
            if (data.success) {
                //ставим ордер на продажу
                setTimeout(function () {
                    privateClient.putOrderSale(pair, qnt, sellPrice * 0.02)
                }, 1200)

            } else {
                console.log("................... bnb.........ups")
                console.log(err)
            }
            return true
        }, pair, 'buy', qnt, buyPrice + buyPrice * 0.15)    //price is + 0.5% from last sell order
    }, 200)
    console.log("buy price " + (buyPrice + buyPrice * 0.15));
    setTimeout(function () {
        privateClient.addTrade(function (err, data) {
            if (data.success) {
                //ставим ордер на продажу
                setTimeout(function () {
                    privateClient.putOrderSale(pair, qnt, sellPrice * 0.03)
                }, 1200)

            } else {
                console.log("................... bnb.........ups")
                console.log(err)
            }
            return true
        }, pair, 'buy', qnt, buyPrice + buyPrice * 0.3)    //price is + 0.5% from last sell order
    }, 400)
    console.log("buy price " + (buyPrice + buyPrice * 0.07));


    return true
}, pair)


privateClient.getInfo(function (err, data) {
    // console.log(data)
    return true
}, {})


Yobit.prototype.putOrderSale = function putOrderSale(pair, qnt, price) {
    console.log('putOrderSale...............' + qnt + '.................' + price + '.......................');
    privateClient.addTrade(function (err, data) {
        if (!err) {
            if (data.success) {
                //ставим ордер на продажу
                console.log("............................new order SELL")
            } else {
                console.log("............................ups")
            }
        } else {
            console.log("............................ups" + err)
        }

    }, pair, 'sell', qnt, price)
}
