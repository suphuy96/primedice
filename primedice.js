var RollBet = require("./libs/request");
var ChatBot = require("./libs/chatbot");
ChatBot.initListen();
var Database = require("./libs/database");
var
    config = Database.GetConfig();
var username = config.username;
var balance = config.balance; // số coin hiện tại
var levelBet = config.levelBet; // cấp độ chơi -- ảnh hưởng tới mức độ ăn levelBet càng lớn thì ăn càng nhiều,levelBet sẽ tự động bị giảm/tăng theo thuật toán
var LevelBetNow = parseInt(levelBet);
var levelPayout = config.levelPayout;
var continueBet = true; // check chơi tiếp hay không. có thể stop qua chatbot
var maxLost = 0; // Số thua lớn nhất
var maxLost2 = 0;
var totalBest = 0; // Tổng bet đã chơi
var TimePlay = 0; // Tổng giờ chạy bot
var mapLost = Database.Get("mapLost");
if (!mapLost || !mapLost.length || mapLost.length < 5)
    mapLost = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // lưu trữ tổng hợp các ván đã chơi
var bet = 1; // số coin chơi hiện tại.
var startBalanceBet = balance; // tiền bắt đầu của ván
var startBalance = balance; // số vốn ban đầu chạy
var payout = 30; // payout của ván cược
var multiply = 600; // tỉ lệ ăn 1 cược được 600
var rollOverUnder = "above";
var chainLost = 0; //chuỗi thua liên tục
var totalLost = 0; // tổng thua hiện tại
var sleepBet = 1411; // nghỉ nhịp bot
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
multiply = (1 / ((100 / (chance)) - 1.009));
var realMultiply = multiply;
var isCache = config.isCache;
var isLog = config.isLog;
var Log = function (content) {
    if (isLog)
        console.log(content)
}

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
    chance = parseFloat(Math.random() * 26).toFixed(2) / 15;
    multiply = (1 / ((100 / (chance)) - 1.099));
    realMultiply = 1 / multiply; // multiply(0.01) là 1 số bé hơn 1/ realMultiply cấp nhân của cược(100)

    //  payout chỉ nằm trong khoảng config.limitPayout.min đến config.limitPayout.max
    if ((1 / multiply > config.limitPayout.max) || (1 / multiply < config.limitPayout.min))
        FunChangePayout();
}
/*---------Function init Before---------*/
var initBefore = function () {
    if (isCache) {
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
            realMultiply = 1 / multiply; // multiply(0.01) là 1 số bé hơn 1/ realMultiply cấp nhân của cược(100)

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
}
/*--------clock------*/
setInterval(function () {
    TimePlay += 5;
}, 5000);
//*-----save bet info--------*/
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
    RollBet(bet, payout, rollOverUnder, config.coin, function (error, response) {
            totalBest++;
            balance = parseFloat(response.user.balance);
            if (response.bet.win == false) {
                chainLost++;
                if ((balance - startBalanceBet) < maxLost) {
                    maxLost = (balance - startBalanceBet);   // số thua lớn nhất
                    maxLost2 = (((startBalanceBet - balance) / startBalanceBet) * 100).toFixed(2);
                }
                totalLost = startBalanceBet - balance; // tổng thua ván hiện tại
                var Thuy = chainLost / realMultiply; // Tỉ lệ chịu đựng hiện tại
                LevelBetNow = parseInt(levelBet); //  levelBet mức độ chơi đã thiết đặt; levelBetNow mức độ chơi hiện tại
                var downdown = cachedowndown - (Thuy / 10); // cũng sẽ bớt cược lớn khi dây thua càng dài.
                if (downdown < 0.10) downdown = 0.1;
                if ((totalLost > startBalanceBet * config.limitLost / 2.5)) {
                    // khi tỉ lệ chịu đựng tăng cao gần xát với chịu đựng thực tế tức là đang thua dài.
                    // thì mức độ cược bắt đầu giảm dần
                    downdown -= 0.1;
                    if (downdown < 0.1) {
                        downdown = 0.1;
                    }
                    LevelBetNow = levelBet - parseInt(Thuy * 1.1);
                    if (LevelBetNow < 1)
                        LevelBetNow = 1;
                }
                if (totalLost > startBalanceBet * config.limitLost) {
                    downdown -= 0.35;
                    if (downdown < 0.05) {
                        downdown = 0.05;
                    }
                    LevelBetNow -= 1;
                    if(LevelBetNow<1){
                        LevelBetNow=1;
                    }
                    if (cachelimitLost) {
                        levelBet -= 1;
                        cachedowndown -= 0.05;
                        if (cachedowndown < 0.5) {
                            cachedowndown = 0.5;
                            console.log("cachedowndown" + cachedowndown)
                        }
                        levelPayout += 0.2;
                        config.levelPayout = levelPayout;
                        config.levelBet = levelBet;
                        Database.UpdateConfig(config);
                    }
                    cachelimitLost = false;
                }
                if (chainLost < realMultiply * 0.6) {
                    bet = 1;
                } else {
                    cacheLost.countBet++;
                    if (IsReFrofit && cacheLost.isLost && cacheLost.countBet < realMultiply) {
                        let morebet = cacheLost.Perbet; // tính số lượng cần bổ sung
                        bet += parseInt((totalLost + morebet + parseInt(chainLost * LevelBetNow * downdown))) * (multiply);
                    } else
                        bet = parseInt((totalLost + parseInt(chainLost * LevelBetNow * downdown))) * (multiply);
                    if (chainLost < realMultiply * 2.3)
                        bet += 1;
                }
                //qua ngưỡng thua limitLost và trong limitStopLost thì giảm 1 nửa cược nếu set config IsReFrofit =true
                if (IsReFrofit && (totalLost > startBalanceBet * config.limitLost) && (totalLost < startBalanceBet * config.limitStopLost)) {
                    bet *= 0.99;
                    // cacheLost.isLost = true;
                    // cacheLost.lost = totalLost * 0.43;
                    // if (checkCacheLost)
                    //     cacheLost.ReFrofit += ReFrofit;
                    // cacheLost.Perbet = cacheLost.lost / ReFrofit;
                    checkCacheLost = false;
                    Log("___| " + "bắt đầu thua dài __|" + totalLost);
                    ChatBot.SendFB("tt", "__Đã giảm hơn " + config.limitLost + "%" + "\n __ bet: " + bet + "\n __ CountBet :" + chainLost + "\n __ Mutil :" + multiply);
                } else if (IsReFrofit && totalLost > startBalanceBet * config.limitStopLost) {
                    bet = 1;
                    // xóa phiên chơi hiện tại lưu số thua phục thù sau tạo phiên chơi mới
                    cacheLost.isLost = true;
                    cacheLost.lost = totalLost + 1;
                    if (checkCacheLost)
                        cacheLost.ReFrofit += ReFrofit;
                    cacheLost.Perbet = cacheLost.lost / ReFrofit;
                    checkCacheLost = false;
                    Log("___| " + "_saved lost_______" + totalLost);
                    ChatBot.SendFB("tt", "__Đã giảm hơn " + config.limitStopLost + "%" + "\n __ bet: " + bet + "\n __ CountBet :" + chainLost + "\n __ Mutil :" + multiply);
                }
                SaveBetInfo();
            } else
                {
                var ProfitDay = parseInt((balance - startBalance) / TimePlay * 60 * 60 * 24);
                var tinh = parseInt(chainLost * multiply);
                // setCacheLost
                if (IsReFrofit && cacheLost.isLost && cacheLost.countBet > 0 && cacheLost.countBet < realMultiply) {
                    console.log(cacheLost.ReFrofit + "____gỡ vốn thành công___" + cacheLost.Perbet);
                    console.log(cacheLost);
                    cacheLost.lost -= cacheLost.Perbet;
                    cacheLost.ReFrofit -= 1;
                    cacheLost.countBet = 0;
                    if (cacheLost.ReFrofit <= 0) {
                        cacheLost.lost = 0;
                        cacheLost.isLost = false;
                        cacheLost.finished += 1;

                    }
                }
                mapLost[tinh] += 1;
                Database.Save("mapLost", mapLost);
                config = Database.GetConfig();
                if(config.isNowUpdate){
                    levelBet=config.levelBet;
                    levelPayout=config.levelPayout;
                    limitPayout=config.limitPayout;
                    balance=config.balance;
                    config.isNowUpdate=false;

                }else
                config.balance = balance;
                Database.UpdateConfig(config);
                SaveBetInfo();
                //log hystory


                Log("_______________________________________________________");
                console.log(" -TB" + totalBest + " - User :" + username + " - balance :" + balance + " - bet :" + bet + " - profit bet :" + response.bet.profit + " - profit :" + (balance - startBalanceBet) + "- CN " + (1 / multiply).toFixed(2) + " - chainLost :" + chainLost + "(" + (chainLost * multiply).toFixed(2) + ")" + " - chiu :" + chainLostDemo + "(" + (chainLostDemo * multiply).toFixed(2) + ")" + " - Max lost:" + maxLost + " - ProfitDay :" + ProfitDay + " - bet.id :" + response.bet.id + " map :" + JSON.stringify(mapLost));
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
                chainLost = 0;
                totalLost = 0;
                cacheLost.countBet = 0;
                cachelimitLost = true;
                checkCacheLost = true;
                startBalanceBet = balance;
                FunChangePayout();
                bet = parseInt(1);
                var balanceDemo = balance;
                betDemo = 1;
                var demoLevelBet = levelBet;
                chainLostDemo = 0;
                var balanelimitLost = startBalanceBet * config.limitLost;
                // dự đoán mức chịu đựng và cân chỉnh cược
                var stopbalance=balance * 0.55
                while (balanceDemo > stopbalance) {
                    var sothuademo = balance - balanceDemo;
                    chainLostDemo++;
                    var Thuy = chainLostDemo / realMultiply; // Tỉ lệ chịu đựng hiện tại
                    var downdown = cachedowndown - (Thuy / 10); // cũng sẽ bớt cược lớn khi dây thua càng dài.
                    if (downdown < 0.1) downdown = 0.1;
                    if ((startBalanceBet - balanceDemo > balanelimitLost / 2.5)) {
                        demoLevelBet = levelBet - parseInt(Thuy * 1.1);
                        if (demoLevelBet < 2)
                            demoLevelBet = 2;
                    }
                    if (chainLostDemo < realMultiply * 0.6) {
                        betDemo = 1;
                    } else {

                        betDemo = parseInt((sothuademo + parseInt(chainLostDemo * demoLevelBet * downdown))) * (multiply);
                        if (chainLostDemo < realMultiply * 2.3)
                            betDemo += 1;
                    }
                    betDemo = parseInt((betDemo).toFixed(8) + 0.3);
                    balanceDemo -= betDemo;
                }
                // căn chỉnh levelBet;
                let levelPayoutDemo = chainLostDemo * multiply;
                if (levelPayoutDemo < levelPayout) {
                    levelBet -= 1;
                    if (levelPayout - levelPayoutDemo > 1) {
                        levelBet -= parseInt(levelPayout - levelPayoutDemo);
                    }
                    if (levelBet < 1) levelBet = 1;
                    config.levelBet = levelBet;
                    LevelBetNow = levelBet;
                    if (isCache) {
                        cacheRolling = {
                            limitPayout: ("huy" + config.limitPayout.min + config.limitPayout.max),
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
                            checkCacheLost: checkCacheLost,
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
                        Database.UpdateCache(cacheRolling);
                    }
                    config.balance = balance;
                    Database.UpdateConfig(config);
                    SaveBetInfo();
                } else if (levelPayoutDemo > levelPayout + 0.45) {
                    levelBet += 1;
                    if (levelPayoutDemo - levelPayout > 1) {
                        levelBet += parseInt(levelPayoutDemo - levelPayout);
                    }
                    config.levelBet = levelBet;
                    LevelBetNow = levelBet;
                    Database.UpdateConfig(config);
                    SaveBetInfo();
                }
                var initramdom = Math.floor((Math.random() * 10));
                // đảo chiều roll
                if (rollOverUnder == "below" && initramdom > 5) {
                    payout = 100 - chance, rollOverUnder = "above";
                } else {
                    payout = chance, rollOverUnder = "below";
                }
            }
            // formart bet
            if (bet < 1)
                bet = parseInt(1);
            if (bet > balance)
                bet = balance * 0.8;
            betInfo = Database.Get("betInfo");

            continueBet = betInfo.continueBet;

            bet = parseInt((bet).toFixed(8) + 0.3);
            Log("debug chainLost:" + chainLost + " balance :" + balance + " bet :" + bet + " profit bet :" + response.bet.profit + " lostRoll :" + totalLost + " payoutIn: " + response.bet.payout.toFixed(2) + " multiply " + (1 / multiply).toFixed(2) + " chainLost :" + chainLost + "(" + (chainLost * multiply).toFixed(2) + ")" + " chiu :" + chainLostDemo + "(" + (chainLostDemo * multiply).toFixed(2) + ")" + " id :" + response.bet.id);
            if (continueBet && config.continueBet && balance > 0) {
                if (totalBest > sleepBet) {
                    sleepBet = totalBest + Math.floor((Math.random() * 1134) + 400), totalBest = 0;
                    setTimeout(function () {
                        play()
                    }, Math.floor((Math.random() * 1034) + 10900));
                } else {
                    setTimeout(function () {
                        play()
                    }, 15);
                }
            } else {
                config.continueBet=true;
                Database.UpdateConfig(config);
                ChatBot.SendFB("TB","Đã dừng tool");
                console.log("----------top bot-----------");
            }
        }
    );
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
    Database.UpdateConfig(config, function () {
        Database.UpdateCache(cacheRolling, function () {
            console.log("saved cache");
            console.log("---------------------[ Server stopped at" + new Date().toISOString() + " ]---------------------------");
            return process.exit(0);
        })
    });

};

process.on("SIGINT", gracefulExit).on("SIGTERM", gracefulExit);
process.on('uncaughtException', (err) => {
    console.log("lỗi --------------" + err)
});
