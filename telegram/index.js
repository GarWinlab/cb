Poloniex = require('poloniex-api-node');
var TelegramBot = require('node-telegram-bot-api')
var getpairs = require('./getpairs'), getbalance = require('./getbalance')

var params = {}
//change for best result

params.livetrade = 0 // if you need only advice livetrade = 0, real orders livetrade = 1
params.pairs = 5 // Maximum pairs number
params.balance = 0.014 // BTC
params.profit = 0.03 // 0.02 is 2%
params.stop_loss = 0.03 // 0.02 is 2%
params.depth = 20 // 0.02 is 2%

params.ticker_ = []
params.close_orders = []
params.orderNumbers = []
params.polo_key = ""
params.polo_secret = ""


// Устанавливаем токен, который выдавал нам бот.
var token = '514893703:AAEPZnZ-LBt_lscdnrNlBjz7v2gBkKd4ZCc';
// Включить опрос сервера
var bot = new TelegramBot(token, {polling: true});

// Написать мне ... (/echo Hello World! - пришлет сообщение с этим приветствием.)
bot.onText(/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(fromId, resp);
});

bot.onText(/rank (.+)/, function (msg, match) {
    var chatId = msg.chat.id
    var num = match[1] / 1

    if (!isNaN(num)) {
        //bot.sendMessage(chatId, "rank " + typeof (num) + num)
        rank_array = getpairs(params)
        bot.sendMessage(chatId, "rank " + typeof (rank_array) + num)
    } else {
        bot.sendMessage(chatId, "Error, parameter need to be a number \n example: /rank 5")
    }

});

/*
* balance
*
* */
bot.onText(/\/status/, function (msg, match) {
    var chatId = msg.chat.id;
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);

    poloniex.returnBalances(function (err, balances) {
        if (err) {
            bot.sendMessage(chatId, "returnBalances " + err.message);
        } else {
            bot.sendMessage(chatId, "available BTC " + balances.BTC);
        }
    });

    setTimeout(function(){
        poloniex.returnAvailableAccountBalances(null, function (err, balances) {
            if (err) {
                bot.sendMessage(chatId, "returnBalances " + err.message);
            } else {
                var str =""
                for(var i in balances){
                    //str += i + " : " + balances[i] + "\n"
                    for(var x in balances[i]){
                        str += x + " : " + balances[i][x] + "\n"
                    }
                }
                bot.sendMessage(chatId, "all coins \n" + str);
            }
        });
    },2000)



/*    poloniex.returnTradableBalances(function (err, ticker) {
        if (!err) {
            var str =""
            for(var i in ticker){
                str += i + " : " + ticker[i] + "\n"
            }
            bot.sendMessage(chatId, "ticker " + str);
        } else {
            bot.sendMessage(chatId, "returnLoanOrders " + err.message);
        }
    })*/
});

// Простая команда без параметров.
bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "hi Kostya");
});

/*// Простая команда без параметров.
bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "hi guy!!");
    // Фотография может быть: путь к файлу, поток(stream) или параметр file_id
    /!*    var photo = 'cats.png';
        bot.sendPhoto(chatId, photo, {caption: 'Милые котята'});*!/
});*/

