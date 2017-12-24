var getpairs = require('./getpairs'),
    checkorders = require('./checkorders'),
    buy = require('./buy')

var params = {}
//change for best result

params.livetrade = 0 // if you need only advice livetrade = 0, real orders livetrade = 1
params.pairs = 5 // Maximum pairs number
params.balance = 0.02 // BTC
params.profit = 0.03 // 0.02 is 2%
params.depth = 20 // 0.02 is 2%

params.ticker_ = []
params.close_orders = []
params.orderNumbers = []
params.polo_key = "6VOZJLTB-OZZCQJSS-G3IRTAJD-52DX25XZ"
params.polo_secret = "7eab4caaf4efc029569b872fc0c9f6eab0623f7b47dd1726725abe9fe029ed254764900ada6c6787f861e3ea5689ec1dfb8d8ad8342aef144453582bd7830989"


getpairs(params)
checkorders(params)
//buy(params)