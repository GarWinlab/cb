Poloniex = require('poloniex-api-node');

function getbalance(params) {
    let poloniex = new Poloniex(params.polo_key, params.polo_secret);
    poloniex.returnBalances(function (err, balances) {
        if (err) {
            return err.message;
        } else {
            return "balances.BTC " + balances.BTC;
        }
    });
}


module.exports = getbalance;