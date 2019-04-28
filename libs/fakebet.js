var server_seed = randomHexString(128);
var client_seed = randomHexString(40);
var position = 0;
var Database = require("./database");
var config = Database.GetConfig();
var balance = config.balance;
const crypto = require('crypto');
function randomHexString(r) {
    for (var n = ""; n.length < r;) n += Math.random().toString(16).slice(2);
    return n.substr(0, r)
};
module.exports = {
    rollBet(amount, target, condition, coin, callback, realMultiply) {
        position++;
        var iwin = false;
        var profitbet = 0;
        const hash = crypto
            .createHmac('sha512', server_seed)
            .update(client_seed + "-" + position)
            .digest('hex');
        let index = 0;
        let lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
        while (lucky >= Math.pow(10, 6)) {
            index++;
            lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
            if (index * 5 + 5 > 128) {
                lucky = 9999;
                break;
            }
        }
        lucky %= Math.pow(10, 4);
        lucky /= Math.pow(10, 2);
        if ((condition == "below" && lucky < target) || (condition == "above" && lucky > target)) {
            iwin = true;
            profitbet = amount * realMultiply;
        } else {
            profitbet = -amount;
        }
        balance += profitbet;
        // console.log(i + " " + luckyNumber + " " + current_amount.toFixed(8) + " " + balance.toFixed(8));
        var reqdata = {
            user: {balance: balance},
            bet: {
                win: iwin,
                profit: profitbet,
                payout: lucky,
                id: "isTest"
            }
        };
        callback(false, reqdata);
    }
    , init(server_se, client_se) {
        if (server_se.length > 0) {
            server_seed = server_se;
        }
        if (client_se.length > 0) {
            client_seed = client_se;
        }
    }
};
