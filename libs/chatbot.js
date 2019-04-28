var fs = require("fs");
const login = require("facebook-chat-api");
var Database = require("./database");
var config = Database.GetConfig();
var childProcess = require('child_process');
var Botfb = null;
var ArFB = Database.Get("FB");
if (ArFB == null || !ArFB.length) {
    ArFB = []
    var temp = Database.GetConfig();
    ArFB = temp.ArFB;
}
var ArFBRT = Database.Get("FBRT");
if (ArFBRT == null || !ArFBRT.length) {
    var temp = Database.GetConfig();
    ArFBRT = temp.ArFBRT;
}
var FunSendFB = function (type, content) {
    if (Botfb != null) {
        if (type == "INFO") {
            // console.log(ArFB);
            if (ArFB.length > 0)
                for (let i = 0; i < ArFB.length; i++) {
                    Botfb.sendMessage(content, ArFB[i]);
                }
        } else {
            // console.log(ArFBRT)
            if (ArFBRT.length > 0)
                for (let i = 0; i < ArFBRT.length; i++) {
                    Botfb.sendMessage(content, ArFBRT[i]);
                }
        }
    }
};
var initChatBot = function () {
    var appstate = {
        appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
    }
    var credentials = {email: config.chatBot.username, password: config.chatBot.password};

    var configchat = config.chatBot.loginByAppstate ? appstate : credentials;
    login(configchat, (err, api) => {
        if (err) return console.error(err);
        config.chatBot.loginByAppstate = true;
        Database.UpdateConfig(config);
        fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
        console.log("_________đã kết nối bot______________");
        api.listen((err, event) => {
            Botfb = api;
            console.log(err);
            if (event.body.toUpperCase().indexOf("PRIME") >= 0) {
                if (event.body.toUpperCase() == "PRIME " + config.username.toUpperCase()) {
                    if (ArFB.indexOf(event.threadID) == -1) {
                        api.sendMessage("❤️kết nối bot❤️", event.threadID);
                        ArFB.push(event.threadID);
                        Database.Save("FB", ArFB);
                        let tem = Database.GetConfig();
                        tem.ArFB = ArFB;
                        Database.UpdateConfig(tem);
                    } else
                        api.sendMessage("❤️bạn đã kết nối bot❤️", event.threadID);
                }
            } else if (event.body.toUpperCase() === 'LOGOUT') {
                if (ArFB.indexOf(event.threadID) >= 0) {
                    api.sendMessage("❤️❤️Goodbye…..", event.threadID);
                    ArFB.splice(ArFB.indexOf(event.threadID), 1)
                    Database.Save("FB", ArFB);
                    let tem = Database.GetConfig();
                    tem.ArFB = ArFB;
                    Database.UpdateConfig(tem);
                }
                if (ArFBRT.indexOf(event.threadID) >= 0) {
                    ArFBRT.splice(ArFBRT.indexOf(event.threadID), 1)
                }
            } else if (ArFB.indexOf(event.threadID) >= 0) {
                var betInfo = Database.Get("betInfo");
                if (event.body.toUpperCase().indexOf("RT") >= 0) {
                    if (event.body.toUpperCase() == "RT " + config.username.toUpperCase()) {
                        if (ArFBRT.indexOf(event.threadID) == -1) {
                            ArFBRT.push(event.threadID);
                            Database.Save("FBRT", ArFBRT);
                            let tem = Database.GetConfig();
                            tem.ArFBRT = ArFBRT;
                            Database.UpdateConfig(tem);
                            api.sendMessage("❤️Bạn vừa kết nối Realtime❤️", event.threadID);
                        } else
                            api.sendMessage("❤️Đã kết nối Realtime❤️", event.threadID);
                    }
                } else if (event.body.toUpperCase() === "SRT" || event.body.toUpperCase() === "STOPRT") {
                    if (ArFBRT.indexOf(event.threadID) >= 0) {
                        ArFBRT.splice(ArFBRT.indexOf(event.threadID), 1)
                        api.sendMessage("👉🏼 Đã ngắt realtime", event.threadID);
                        Database.Save("FBRT", ArFBRT);
                        let tem = Database.GetConfig();
                        tem.ArFBRT = ArFBRT;
                        Database.UpdateConfig(tem);
                    }
                } else if (event.body.toUpperCase().indexOf("SET LEVELBET") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseInt(stringne.substring(13, 15)))) {
                            console.log("set ting LEVELBET");
                            config.isNowUpdate=true;
                            config.levelBet=parseInt(stringne.substring(13, 15));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update levelBet: " +   config.levelBet, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set levelBet⚡\n vui lòng nhập lại" + stringne.substring(13, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                } else if (event.body.toUpperCase().indexOf("SET REPROFIT") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseInt(stringne.substring(13, 15)))) {
                            console.log("set ting LEVELBET");
                            config.isNowUpdate=true;
                            config.ReFrofit=parseInt(stringne.substring(13, 15));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update levelBet: " +   config.ReFrofit, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set levelBet⚡\n vui lòng nhập lại" + stringne.substring(13, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                }  else if (event.body.toUpperCase().indexOf("SET BALANCE") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseInt(stringne.substring(12, stringne.length)))) {
                            console.log("set ting BALANCE");
                            config.isNowUpdate=true;
                            config.balance=parseInt(stringne.substring(12, stringne.length));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update balance: " + config.balance, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set balance⚡\n vui lòng nhập lại" + stringne.substring(12, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                }else if (event.body.toUpperCase().indexOf("SET LEVELPAYOUT") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseFloat(stringne.substring(15,stringne.length)))) {
                            console.log("set ting levelPayout");
                            config.isNowUpdate=true;
                            config.levelPayout=parseFloat(stringne.substring(15, stringne.length));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update levelPayout: " +  config.levelPayout, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set levelPayout⚡\n vui lòng nhập lại" + stringne.substring(15, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                } else if (event.body.toUpperCase().indexOf("SET PAYOUTMIN") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseFloat(stringne.substring(13,stringne.length)))) {
                            console.log("set ting PAYOUTMIN");
                            config.isNowUpdate=true;
                            config.limitPayout.min=parseInt(stringne.substring(13, stringne.length));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update levelBet: " +  config.limitPayout.min, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set PAYOUTMIN⚡\n vui lòng nhập lại" + stringne.substring(13, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                }else if (event.body.toUpperCase().indexOf("SET PAYOUTMAX") >= 0 && event.body.toUpperCase().indexOf(config.username.toUpperCase()) >= 0) {
                    try {
                        let stringne = event.body;
                        if (!isNaN(parseFloat(stringne.substring(13,stringne.length)))) {
                            console.log("set ting PAYOUTMax");
                            config.isNowUpdate=true;
                            config.limitPayout.max=parseInt(stringne.substring(13, stringne.length));
                            Database.UpdateConfig(config);
                            api.sendMessage("ℹ️đã update levelBet: " +   config.limitPayout.max, event.threadID);
                        } else {
                            api.sendMessage("⚡không thể set PAYOUTMIN⚡\n vui lòng nhập lại" + stringne.substring(13, stringne.length), event.threadID);
                        }
                    } catch (e) {
                    }
                }
                else if (event.body.toUpperCase() === "STOPNOW " + config.username.toLocaleUpperCase()) {
                    betInfo.continueBet = false;
                    Database.Save("betInfo");
                    api.sendMessage("\"--❤❤STOP BOT❤❤--\"", event.threadID);
                }else if (event.body.toUpperCase() === "STOP " + config.username.toLocaleUpperCase()) {
                    config.continueBet = false;
                    Database.UpdateConfig(config);
                    api.sendMessage("\"--❤❤STOP BOT❤❤--\"", event.threadID);
                } else if (event.body.toUpperCase() === "START" || event.body.toUpperCase() === "STARTBOT" || event.body.toUpperCase() === "START BOT") {
                    betInfo.continueBet = true;
                    Database.Save("betInfo");
                    config.continueBet = true;
                    Database.UpdateConfig(config,function () {
                        api.sendMessage("\"--❤❤START BOT❤❤--\"", event.threadID);
                        let stop = childProcess.exec('pm2 restart primedice', function(err, stdout, stderr) {
                            console.log(err)
                        });
                    });


                } else if (event.body.toUpperCase() === "HHH") {
                    let stringne = "";
                    let temp = Database.Get("mapLost");
                    let check = false;
                    for (let i = temp.length - 1; i >= 0; i--) {
                        if (temp[i] != 0 || check) {
                            stringne += "-" + i + " :" + temp[i] + "\n"
                            if (i == 1) {
                                stringne += "-" + 0 + " :" + temp[0] + "\n"
                                break;
                            }
                            check = true;
                        }
                    }
                    api.sendMessage(config.username + ": " + stringne, event.threadID);
                } else {
                    var Profitaday = parseInt((betInfo.balanceNow - betInfo.startBalance) / betInfo.timePlay * 60 * 60 * 24);

                    let ct = "______---❤💰💰💰💰❤---______" +
                        "\n👉🏼 Username_ : " + config.username +
                        "\n👉🏼 Bet Now___ : " + betInfo.bet.toFixed(2) +
                        "\n👉🏼 Multip_____ : " + (1 / betInfo.multiply).toFixed(2) +
                        "\n👉🏼 CountBet__ : " + betInfo.chainLost + "(" + (betInfo.chainLost * betInfo.multiply).toFixed(1) + ")" +
                        "\n👉🏼 chiuC______: " + betInfo.chainLostDemo + "(" + (betInfo.chainLostDemo * betInfo.multiply).toFixed(1) + ")" +
                        "\n👉🏼 maxLost__ : " + betInfo.maxLost +
                        "\n👉🏼 maxLost%_ : " + betInfo.maxLost2 + "%" +
                        "\n👉🏼 cacheLost_ : " + betInfo.cacheLost.isLost + "";
                    if (betInfo.cacheLost.isLost) {
                        ct +=
                            "\n👉🏼 count_ : " + betInfo.cacheLost.ReFrofit + "%";
                        "\n👉🏼 lost_ : " + betInfo.cacheLost.lost + "%";
                        "\n👉🏼 Perbet_ : " + betInfo.cacheLost.Perbet + "%";
                    }
                    ct +=

                        "\n👉🏼 LevelBet___ : " + betInfo.levelBet +
                        "\n👉🏼 LevelPayout: " + betInfo.levelPayout +
                        "\n👉🏼 SBalance__ : " + betInfo.startBalance +
                        "\n👉🏼 BalanceNow: " + betInfo.balanceNow +
                        "\n👉🏼 ProfitNow__ : " + (betInfo.balanceNow - betInfo.startBalance) +
                        "\n👉🏼 ProfitADay : " + Profitaday +
                        "\n👉🏼 TtimeStart : " + (betInfo.timePlay / 60).toFixed(2);
                    api.sendMessage(ct, event.threadID);
                }
            }

        });
    });
}
module.exports = {initListen: initChatBot, SendFB: FunSendFB};
