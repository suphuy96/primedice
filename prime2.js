var RollBet = null;
var ChatBot = require("./libs/chatbot");
var Database = require("./libs/database");
var
    config = Database.GetConfig();
var request = require("./libs/request");
if (!config.isTest) {
    // chơi thật
    ChatBot.initListen();
    RollBet = request.RollBet;
} else {
    // chơi thử

    var fakebet = require("./libs/fakebet");
    // fakebet.init("5b33b22b1049e3ff713d3b5d9f9a3db3b8ce9077b69224a96d0f62560fa7b817","9169941893568768")
    RollBet = fakebet.rollBet;
}
console.time("timetest");

var doneTest = false;
var betOne = config.betOne;
var username = config.username;
var balance = config.balance;
var levelBet = config.levelBet;
var LevelBetNow = parseInt(levelBet);
var levelPayout = config.levelPayout;
var continueBet = true;
var maxLost = 0;
var maxLost2 = 0;
var totalBest = 0;
var TimePlay = 0;
var mapLost = Database.Get("mapLost");
if (!mapLost || !mapLost.length || mapLost.length < 5)
    mapLost = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var bet = 1;
var startBalanceBet = balance;
var startBalance = balance;
var payout = 30;
var multiply = 600;
var rollOverUnder = "above";
var chainLost = 0;
var totalLost = 0;
var sleepBet = 1411;
var chainLostDemo = 0;
var betDemo = 0;
var cachedowndown = 0.87;
var cachelimitLost = true;
var chance = (Math.random() * (6) + 3).toFixed(2);
var betInfo = {
    continueBet: continueBet,
    timePlay: TimePlay,
    startBalance: startBalance,
    balanceNow: balance,
    bet: bet,
    betDemo: betDemo,
    chainLost: chainLost,
    chainLostDemo: chainLostDemo,
    multiply: multiply,
    levelBet: LevelBetNow,
    levelPayout: levelPayout,
    maxLost: maxLost,
    maxLost2: maxLost2,
    totalBet: totalBest,
    totalLost: totalLost
};
var IsReFrofit = config.IsReFrofit;
var ReFrofit = config.ReFrofit;
var cacheLost = {isLost: false, lost: 0, ReFrofit: 0, countBet: 0, Perbet: 0, finished: 0};
var checkCacheLost = true;
multiply = (1 / ((100 / (chance)) - 1.002));
var realMultiply = multiply;
var isCache = config.isCache;
var isLog = config.isLog;
var Log = function (content) {
    if (isLog)
        console.log(content)
}
var countWin = 0;
var Wagered=0;
var winss = parseInt(ReFrofit*0.6);
var tinh = 0;
var ramdon = 4;
var cacheRolling = {
    betInfo: betInfo,
    cacheLost: cacheLost,
    totalBest: totalBest,
    bet: bet,
    mapLost: mapLost,
    payout: payout,
    rollOverUnder: rollOverUnder,
    startBalanceBet: startBalanceBet,
    balance: balance,
    chainLost: chainLost,
    cachedowndown: cachedowndown,
    multiply: multiply,
    chance: chance,
    payout: payout,
    LevelBetNow: LevelBetNow,
    levelBet: levelBet,
    betDemo: betDemo,
    maxLost: maxLost,
    maxLost2: maxLost2,
    totalLost: totalLost,
    chainLostDemo: chainLostDemo,
    cachelimitLost: cachelimitLost
};

/*-----Function change payout-------*/

var FunChangePayout = function () {

    realMultiply=config.limitPayout.min;
    chance = 100 / realMultiply;
    //  payout chỉ nằm trong khoảng config.limitPayout.min đến config.limitPayout.max
    if ((realMultiply > config.limitPayout.max) || (realMultiply < config.limitPayout.min))
        FunChangePayout();
    realMultiply -= 1.002;
    multiply = 1 / realMultiply;
}
/*---------Function init Before---------*/
var initBefore = function () {
    if (isCache && !config.isTest) {
        cacheRolling = Database.GetCache();
        if (cacheRolling.balance == balance && cacheRolling.limitPayout == ("huy" + config.limitPayout.min + config.limitPayout.max)) {
            betInfo = cacheRolling.betInfo,
                cacheLost = cacheRolling.cacheLost,
                totalBest = cacheRolling.totalBest,
                bet = cacheRolling.bet,
                mapLost = cacheRolling.mapLost,
                payout = cacheRolling.payout,
                rollOverUnder = cacheRolling.rollOverUnder,
                startBalanceBet = cacheRolling.startBalanceBet,
                chainLost = cacheRolling.chainLost,
                cachedowndown = cacheRolling.cachedowndown,
                multiply = cacheRolling.multiply,
                chance = cacheRolling.chance,
                payout = cacheRolling.payout,
                LevelBetNow = cacheRolling.LevelBetNow,
                levelBet = cacheRolling.levelBet,
                betDemo = cacheRolling.betDemo,
                maxLost = cacheRolling.maxLost,
                maxLost2 = cacheRolling.maxLost2,
                totalLost = cacheRolling.totalLost,
                chainLostDemo = cacheRolling.chainLostDemo,
                cachelimitLost = cacheRolling.cachelimitLost;
            realMultiply = 1 / multiply;
            console.log("_________get data in cache________");

            if (rollOverUnder == "below") {
                payout = 100 - chance, rollOverUnder = "above";
            } else {
                payout = chance, rollOverUnder = "below";
            }
        } else {
            FunChangePayout();

            var initramdom = Math.floor((Math.random() * 10));
            if (rollOverUnder == "below" && initramdom > 5) {
                payout = 100 - chance, rollOverUnder = "above";
            } else {
                payout = chance, rollOverUnder = "below";
            }
        }
    }
    FunChangePayout();
}
/*--------clock------*/
setInterval(function () {
    TimePlay += 5;
}, 5000);
var SaveBetInfo = function () {
    betInfo = {
        cacheLost: cacheLost,
        continueBet: continueBet,
        timePlay: TimePlay,
        startBalance: startBalance,
        balanceNow: balance,
        bet: bet,
        betDemo: betDemo,
        chainLost: chainLost,
        chainLostDemo: chainLostDemo,
        multiply: multiply,
        levelBet: LevelBetNow,
        levelPayout: levelPayout,
        maxLost: maxLost,
        maxLost2: maxLost2,
        totalBet: totalBest,
        totalLost: totalLost
    };
    Database.Save("betInfo", betInfo);
}
SaveBetInfo();


/*---------------logic----------------*/
function play() {
    Wagered +=bet;
    RollBet(bet, payout, rollOverUnder, config.coin, function (error, response) {
            totalBest++
            balance = parseFloat(response.user.balance);
            if (response.bet.win == false) {
                if ((balance - startBalanceBet) < maxLost) {
                    maxLost = (balance - startBalanceBet);
                    maxLost2 = (((startBalanceBet - balance) / startBalanceBet) * 100).toFixed(2);
                }
                totalLost = startBalanceBet - balance;
                LevelBetNow = parseInt(levelBet);
                if (cacheLost.isLost && checkCacheLost) {
                    cacheLost.lost = startBalanceBet - balance + 5;
                    cacheLost.ReFrofit = parseInt(ReFrofit * 1.25);
                    cacheLost.countBet = 0;
                    chainLost++;
                    cacheLost.Perbet = cacheLost.lost / cacheLost.ReFrofit;
                    checkCacheLost = false;
                } else if (bet > multiply) {
                    cacheLost.isLost = true;
                    cacheLost.lost = startBalanceBet - balance + 5;
                    cacheLost.countBet = 0;
                    chainLost = 1;
                    cacheLost.ReFrofit = ReFrofit;
                    cacheLost.Perbet = cacheLost.lost / cacheLost.ReFrofit;
                }
                bet = multiply;
                countWin = 0;
                if(!config.isTest)
                    SaveBetInfo();
            } else {
                countWin++;
                var ProfitDay = parseInt((balance - startBalance) / TimePlay * 60 * 60 * 24);
                if (IsReFrofit && cacheLost.isLost && countWin <= winss) {
                    Log(cacheLost.ReFrofit + "____gỡ vốn thành công___" + cacheLost.Perbet);
                    cacheLost.lost -= cacheLost.Perbet;
                    cacheLost.ReFrofit -= 1;
                    cacheLost.countBet = 0;
                    if (cacheLost.ReFrofit <= 0 || cacheLost.lost <= 0) {
                        cacheLost.lost = 0;
                        cacheLost.isLost = false;
                        cacheLost.finished += 1;
                    }
                }
                if (cacheLost.isLost && countWin < winss) {
                    bet = (levelBet + cacheLost.Perbet) * multiply;

                } else if (countWin < winss)
                    bet = levelBet * multiply;
                else
                    bet = multiply;
                if (!config.isTest) {
                    Database.Save("mapLost", mapLost);
                    SaveBetInfo();
                }
                cacheLost.countBet = 0;
                cachelimitLost = true;
                checkCacheLost = true;
                if (balance > startBalanceBet) {
                    if (config.isNowUpdate) {
                        levelBet = config.levelBet;
                        levelPayout = config.levelPayout;
                        limitPayout = config.limitPayout;
                        balance = config.balance;
                        config.isNowUpdate = false;
                        ReFrofit = config.ReFrofit;
                    } else
                        config.balance = balance;
                    if (!config.isTest) {
                        Database.UpdateConfig(config);
                        SaveBetInfo();
                    }
                    totalLost = 0;
                    startBalanceBet = balance;
                    mapLost[tinh] += 1;
                    Log("_______________________________________________________");
                    console.log(" -TB" + totalBest + " - User :" + username + " - balance :" + balance + " - bet :" + bet + " - profit bet :" + response.bet.profit + " - profit :" + (balance - startBalanceBet) + "- CN " + (realMultiply).toFixed(2) + " - chainLost :" + chainLost + "(" + (chainLost * multiply).toFixed(2) + ")" + " - chiu :" + chainLostDemo + "(" + (chainLostDemo * multiply).toFixed(2) + ")" + " - Max lost:" + maxLost + " - ProfitDay :" + ProfitDay + " - bet.id :" + response.bet.id + " map :" + JSON.stringify(mapLost));
                    let ct = "______---❤💰💰💰💰❤---______" +
                        "\n👉🏼 Username__ : " + username +
                        "\n👉🏼 Bet Now___ : " + bet.toFixed(2) +
                        "\n👉🏼 Multiply__ : " + (1 / multiply).toFixed(2) +
                        "\n👉🏼 chainLost_ : " + chainLost + "(" + (chainLost * multiply).toFixed(2) + ")" +
                        "\n👉🏼 chiu______ : " + chainLostDemo + "(" + (chainLostDemo * multiply).toFixed(1) + ")" +
                        "\n👉🏼 ProfitBet_ : " + (balance - startBalanceBet) +
                        "\n👉🏼 TimeBet___ : " + (TimePlay / 60).toFixed(2) + "p";
                    if (cacheLost.isLost) {
                        ChatBot.SendFB("TT", "------thua dài------\n" + ct);
                    } else
                        ChatBot.SendFB("RT", ct);
                    FunChangePayout();
                    var initramdom = Math.floor((Math.random() * 10));
                    if (rollOverUnder == "below" && initramdom > 5) {
                        payout = 100 - chance, rollOverUnder = "above";
                    } else {
                        payout = chance, rollOverUnder = "below";
                    }
                    betDemo = multiply;
                    var balanceDemo = balance;
                    var demoLevelBet = levelBet;
                    chainLostDemo = 0;
                    var totalLostDemo = multiply;
                    var stopbalance = balance * config.limitStopLost;
                    while (balanceDemo > stopbalance) {
                        betDemo = (levelBet + (totalLostDemo / config.ReFrofit)) * multiply;
                        balanceDemo -= betDemo;
                        totalLostDemo = balance - balanceDemo;
                        chainLostDemo++;
                    }
                }
                chainLost = 0;
            }
            if (bet < 1)
                bet = parseInt(1);
            if (bet > balance)
                bet = balance * 0.8;
            if (!config.isTest) {
                betInfo = Database.Get("betInfo");
                levelBet = betInfo.levelBet;
                continueBet = betInfo.continueBet;
            }
            bet = parseInt((bet).toFixed(8) + 0.3);
            Log("debug chainLost:" + chainLost + " balance :" + balance + " bet :" + bet + " profit bet :" + response.bet.profit + " lostRoll :" + totalLost + " payoutIn: " + response.bet.payout.toFixed(2) + " multiply " + (1 / multiply).toFixed(2) + " chainLost :" + chainLost + "(" + (chainLost * multiply).toFixed(2) + ")" + " chiu :" + chainLostDemo + "(" + (chainLostDemo * multiply).toFixed(2) + ")" + " id :" + response.bet.id);
            if (continueBet && balance > 0 && totalLost < config.limitStopLost * startBalanceBet) {
                if (config.isTest) {
                    // config.rounds là số lượng bet
                    if ((totalBest > config.rounds && totalLost < 10 && !cacheLost.isLost) || balance < 2) {
                        doneTest = true;
                        console.log("");
                        console.log("");
                        console.log("");
                        console.log("");
                        console.log("_______________________________");
                        console.log("_______________________________");
                        console.timeEnd("timetest")
                        console.log("||Wagered____:"+Wagered)
                        console.log("||bets_______:" + totalBest);
                        console.log("||Profit_____:" + (balance - startBalance).toFixed(1));
                        console.log("||Profit%____:" + ((balance - startBalance) / startBalance * 100).toFixed(1) + "%");
                        console.log("||levelbet___:" + levelBet);
                        console.log("||levelPayout:" + levelPayout);
                        console.log("||maxLost____:" + maxLost);
                        console.log("||maxLost%___:" + maxLost2);
                        console.log("_______________________________");
                        var tinh = parseInt(chainLost * multiply);
                        console.log("||betss_____:" + chainLost);
                        console.log("||betss%____:" + tinh);
                        console.log("||multiply__:" + realMultiply);
                        console.log("||" + JSON.stringify(mapLost));
                        console.log("||" + JSON.stringify(cacheLost));
                        console.log("_______________________________");
                        console.log("_______________________________");

                    } else {
                        if (totalBest % 500 != 0) {
                            play()

                        } else
                            setTimeout(function () {
                                play()
                            }, 1);

                    }
                } else {
                    setTimeout(function () {
                        play()
                    }, 1);
                }

            } else {
                console.log("----------top bot-----------");
                doneTest = true;
                console.log("");
                console.log("");
                console.log("");
                console.log("");
                console.log("_______________________________");
                console.log("_______________________________");
                console.timeEnd("timetest")
                console.log("||Wagered____:"+Wagered)

                console.log("||bets_______:" + totalBest);
                console.log("||Profit_____:" + (balance - startBalance).toFixed(1));
                console.log("||Profit%____:" + ((balance - startBalance) / startBalance * 100).toFixed(1) + "%");
                console.log("||levelbet___:" + levelBet);
                console.log("||levelPayout:" + levelPayout);
                console.log("||maxLost____:" + maxLost);
                console.log("||maxLost%___:" + maxLost2);
                console.log("_______________________________");
                var tinh = parseInt(chainLost * multiply);
                console.log("||betss_____:" + chainLost);
                console.log("||betss%____:" + tinh);
                console.log("||multiply__:" + realMultiply);
                console.log("||" + JSON.stringify(mapLost));
                console.log("||" + JSON.stringify(cacheLost));
                console.log("_______________________________");
                console.log("_______________________________");



            }
        }
        ,realMultiply );
}

/*-------main------*/
initBefore();
play();
console.log("-----------start bot-----------------");
console.log(config);


/* handle error*/
let gracefulExit = function () {
    cacheRolling = {
        limitPayout: ("huy" + config.limitPayout.min + config.limitPayout.max),
        betInfo: betInfo,
        cacheLost: cacheLost,
        totalBest: totalBest,
        bet: bet,
        checkCacheLost: checkCacheLost,
        mapLost: mapLost,
        payout: payout,
        rollOverUnder: rollOverUnder,
        startBalanceBet: startBalanceBet,
        balance: balance,
        chainLost: chainLost,
        cachedowndown: cachedowndown,
        multiply: multiply,
        chance: chance,
        payout: payout,
        LevelBetNow: LevelBetNow,
        levelBet: levelBet,
        betDemo: betDemo,
        maxLost: maxLost,
        maxLost2: maxLost2,
        totalLost: totalLost,
        chainLostDemo: chainLostDemo,
        cachelimitLost: cachelimitLost
    };
    config.balance = balance;
    config.levelBet = levelBet;
    if (config.isTest && !doneTest) {
        // config.rounds là số lượng bet
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("_______________________________");
        console.log("_______________________________");
        // console.timeEnd("timetest")
        console.log("||Wagered____:"+Wagered)

        console.log("||bets_______:" + totalBest);
        console.log("||Profit_____:" + (balance - startBalance));
        console.log("||Profit%____:" + ((balance - startBalance) / startBalance * 100) + "%");
        console.log("||levelbet___:" + levelBet);
        console.log("||levelPayout:" + levelPayout);
        console.log("||maxLost____:" + maxLost);
        console.log("||maxLost%___:" + maxLost2);
        console.log("||" + JSON.stringify(mapLost));
        console.log("_______________________________");
        console.log("_______________________________");

    }
    if (!config.isTest)
        Database.UpdateConfig(config, function () {
            Database.UpdateCache(cacheRolling, function () {
                console.log("saved cache");
                console.log("---------------------[ Server stopped at" + new Date().toISOString() + " ]---------------------------");
                return process.exit(0);
            })
        });
    else  return process.exit(0);

};

process.on("SIGINT", gracefulExit).on("SIGTERM", gracefulExit);
process.on('uncaughtException', (err) => {
    console.log("lỗi --------------" + err)
});



