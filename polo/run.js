var getpairs = require('./getpairs'),
    buy = require('./buy')

var params = {}
params.pairs = 2 //Maximum number of traded pairs
params.balance = 0.07 //BTC
params.profit = 0.02 //%
params.ticker_ = []
params.close_orders = []
params.orderNumbers = []
params.polo_key = "6VOZJLTB-OZZCQJSS-G3IRTAJD-52DX25XZ"
params.polo_secret = "7eab4caaf4efc029569b872fc0c9f6eab0623f7b47dd1726725abe9fe029ed254764900ada6c6787f861e3ea5689ec1dfb8d8ad8342aef144453582bd7830989"


getpairs(params)
buy(params)