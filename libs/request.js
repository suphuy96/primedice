var request = require('superagent');
var Database = require("./database");

var config = Database.GetConfig();
var balance = config.balance;
var ChangeServerSeed = function (callback) {
    request.post("https://api.primedice.com/graphql")
        .set('x-access-token', config.token)
        .set('Content-type', 'application/json;charset=UTF-8')
        .send([{
                "operationName": "RotateServerSeedMutation",
                "variables": {},
                "query": "mutation RotateServerSeedMutation {\n  rotateServerSeed {\n    id\n    seedHash\n    nonce\n    user {\n      id\n      activeServerSeed {\n        id\n        seedHash\n        nonce\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
            }]
        )
        .end(function (error, res) {
            if (callback)
                return callback(res);
        });
}
var RollBet = function (amount, target, condition, coin, callback) {
    var chuyen = parseInt(amount) + "";

    var huytam = "0.";
    for (var i = 0; i < 8 - chuyen.length; i++) {
        huytam += "0";
    }
    huytam += amount;
    if (target < 0.04) {
        target = 1.9;
    } else if (target > 99.9) {
        target = 98.4;
    }
    request.post("https://api.primedice.com/graphql")
        .set('x-access-token', config.token)
        .set('Content-type', 'application/json;charset=UTF-8')
        .send([{
            "operationName": 'primediceRoll',
            "variables": {
                "amount": parseFloat(huytam), "target": parseFloat(target),
                "condition": condition, "currency": coin
            },
            "query": "mutation primediceRoll($amount: Float!, $target: Float!, $condition: CasinoGamePrimediceConditionEnum!, $currency: CurrencyEnum!) {  primediceRoll(amount: $amount, target: $target, condition: $condition, currency: $currency) {   ...CasinoBetFragment    state {      ...PrimediceStateFragment     __typename   }    __typename }}fragment CasinoBetFragment on CasinoBet { id  active  payoutMultiplier  amountMultiplier amount  payout updatedAt  currency  game  user {    id    name    __typename  }  __typename}fragment PrimediceStateFragment on CasinoGamePrimedice {  result  target  condition  __typename}"
        }])
        .end(function (error, res) {
            try {
                var dl = JSON.parse(res.text)[0].data;
                var bientinh = false;
                var loilo = 0;

                if (dl.primediceRoll.payout == 0) {
                    bientinh = false;
                    loilo = -amount;
                    balance -= amount;
                } else {
                    loilo = parseInt(amount * (dl.primediceRoll.payoutMultiplier - 1));
                    if (loilo < 1)
                        loilo = 1;
                    balance += loilo;
                    bientinh = true;
                }
                var result = 11111;
                if (dl.primediceRoll.state && dl.primediceRoll.state.result)
                    result = dl.primediceRoll.state.result;
                var reqdata = {
                    user: {balance: balance},
                    bet: {
                        win: bientinh,
                        profit: loilo,
                        payout: result,

                        id: dl.primediceRoll.iid
                    }
                };
                var error = false;
                callback(error, reqdata);

            } catch (err) {
                console.log(err)
                console.log(res)
                console.log(amount, target, condition, coin)
                setTimeout(function () {
                    RollBet(amount, target, condition, coin, callback);
                }, 1150);
            }
        });
};


module.exports = {RollBet:RollBet,ChangeServerSeed:ChangeServerSeed};
