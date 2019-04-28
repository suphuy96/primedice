var server_seed = randomHexString(128);
var client_seed = randomHexString(40);
var position = 0;
var Database = require("./database");
var config = Database.GetConfig();
var balance = config.balance;

function randomHexString(r) {
    for (var n = ""; n.length < r;) n += Math.random().toString(16).slice(2);
    return n.substr(0, r)
};

function sha1(d) {
    var l = 0, a = 0, f = [], b, c, g, h, p, e, m = [b = 1732584193, c = 4023233417, ~b, ~c, 3285377520], n = [],
        k = unescape(encodeURI(d));
    for (b = k.length; a <= b;) n[a >> 2] |= (k.charCodeAt(a) || 128) << 8 * (3 - a++ % 4);
    for (n[d = b + 8 >> 2 | 15] = b << 3; l <= d; l += 16) {
        b = m;
        for (a = 0; 80 > a; b = [[(e = ((k = b[0]) << 5 | k >>> 27) + b[4] + (f[a] = 16 > a ? ~~n[l + a] : e << 1 | e >>> 31) + 1518500249) + ((c = b[1]) & (g = b[2]) | ~c & (h = b[3])), p = e + (c ^ g ^ h) + 341275144, e + (c & g | c & h | g & h) + 882459459, p + 1535694389][0 | a++ / 20] | 0, k, c << 30 | c >>> 2, g, h]) e = f[a - 3] ^ f[a - 8] ^ f[a - 14] ^ f[a - 16];
        for (a = 5; a;) m[--a] = m[a] + b[a] | 0
    }
    for (d = ""; 40 > a;) d += (m[a >> 3] >> 4 * (7 - a++ % 8) & 15).toString(16);
    return d
};

function hexdec(a) {
    return a = (a + "").replace(/[^a-f0-9]/gi, ""), parseInt(a, 16)
};

function round(v, d) {
    return parseFloat(Math.round(v.toFixed(d + 1) + 'e' + d) + 'e-' + d)
};

module.exports = {
    rollBet(amount, target, condition, coin, callback, realMultiply) {
        var seed = server_seed + '-' + client_seed + '-' + position;
        position++;
        var iwin = false;
        var profitbet = 0;
        var lucky = 0;
        do {
            var seed = sha1(seed);
            lucky = hexdec(seed.substr(0, 8));
        }
        while (lucky > 4294960000);
        var luckyNumber = (lucky % 10000) / 100;
        if (luckyNumber < 0) luckyNumber = -luckyNumber;


        if ((condition == "below" && luckyNumber < target) || (condition == "above" && luckyNumber > target)) {
            iwin = true;
            profitbet = amount * realMultiply;
        } else {
            profitbet = -amount;
        }
        balance+=profitbet;
        // console.log(i + " " + luckyNumber + " " + current_amount.toFixed(8) + " " + balance.toFixed(8));
        var reqdata = {
            user: {balance: balance},
            bet: {
                win: iwin,
                profit: profitbet,
                payout: luckyNumber,
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
