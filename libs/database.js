const fs = require("fs");
var cache = require('memory-cache');
var path = require("path");
var cacheConfig = null;
var t = null;
var cacheRoll = '{"betInfo":{"continueBet":true,"balance":4444,"timePlay":0,"startBalance":3733972,"balanceNow":3733972,"bet":1,"betDemo":0,"chainLost":0,"chainLostDemo":0,"multiply":600,"levelBet":5,"levelPayout":7.5,"maxLost":0,"maxLost2":0,"totalBet":0,"totalLost":0},"cacheLost":{"isLost":false,"lost":0},"totalBest":0,"bet":1,"mapLost":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"payout":30,"rollOverUnder":"above","startBalanceBet":3733972,"chainLost":0,"cachedowndown":0.87,"multiply":0.05823156044700663,"chance":"5.50","LevelBetNow":5,"levelBet":5,"betDemo":0,"maxLost":0,"maxLost2":0,"totalLost":0,"chainLostDemo":0,"cachelimitLost":true}\n';

module.exports = {
    Get: function (name) {
        let t = null;
        let temp = cache.get(name);
        try {
            t = JSON.parse(temp);

        } catch (e) {
            t = null;
        }
        return t;
    }, Save: function (name, object, callback) {
        cache.put(name, JSON.stringify(object));
    }, UpdateConfig: function (object,callback) {
        fs.writeFile('config.json', JSON.stringify(object), 'utf8', function read(err) {
if(callback)
    callback(err);
        });
    },
    GetConfig: function () {

        let temp = null;
        try {
            temp = fs.readFileSync('config.json', 'utf8');
            temp=temp.trim();
            t = JSON.parse(temp);

        } catch (e) {
            if (temp) {
                try {
                    t = JSON.parse(temp.substring(0, temp.length - 1));
                } catch (e) {
                    if (cacheConfig) {
                        t = cacheConfig;
                    }
                }
            }else{
                t = cacheConfig;
            }
            console.log(e);

        }
        cacheConfig = t;
        return t;
    },
    UpdateCache: function (object,callback) {
        fs.writeFile('cache.json', JSON.stringify(object), 'utf8', function read(err) {
            if(callback)
            callback(err);
        });
    },
    GetCache: function () {
        let tcache = null;
        let temp = null;
        try {
            temp = fs.readFileSync('cache.json', 'utf8');
            tcache = JSON.parse(temp);

        } catch (e) {
            if (temp) {
                try {
                    tcache = JSON.parse(temp.substring(0, temp.length - 1));
                } catch (e) {
                    console.log(e)
                    if (cacheRoll) {

                    }
                }
            }else {
                tcache = cacheRoll;
            }

            console.log(e);
        }
        cacheRoll = tcache;
        return tcache;
    }
};
