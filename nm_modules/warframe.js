const url = "https://ws.warframestat.us/pc";
const axios = require("axios");

module.exports = {
    commands: ["wf", "warframe"],
    summary: "Get the latest Warframe PC worldstate data",
    picture: "https://i.imgur.com/wiwwzmZ.png",

    arguments: {
        "alerts": {
            commands: ["alerts", "alert"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    var i = wf.data.alerts.length > 0 ?  wf.data.alerts.length : "No";
                    return i + " mission alert" + (i != 1 ? "s" : "") + " available";
                })}},
        "deals": {
            commands: ["deals", "deal", "darvo"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    var i = wf.data.dailyDeals.length > 0 ? wf.data.dailyDeals.length : "No";
                    return i + " daily deal" + (i != 1 ? "s" : "") + " available";
                })}},
        "fissures": {
            commands: ["fissures", "fissure"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    var i = wf.data.fissures.length > 0 ? wf.data.fissures.length : "No";
                    return i + " void fissure" + (i != 1 ? "s" : "") + " available";
                })}},
        "invasions": {
            commands: ["invasions", "invasion"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    var i = 0; // accurate invasions total
                    wf.data.invasions.forEach(function(j) {
                        if (!j.completed) i++;
                    })
                    
                    return (i > 0 ? i : "No") + " faction invasion" + (i != 1 ? "s" : "") + " available";
                })}},
        "sortie": {
            commands: ["sorties", "sortie"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    return "Sortie changes in " + formatEta(wf.data.sortie.eta, true);
                })}},
        "void trader": {
            commands: ["baro", "trader"],
            summary: function() {
                return axios.get(url).then(function(wf) {
                    return wf.data.voidTrader.character + " " + (wf.data.voidTrader.active ? 
                        "departs in " + formatEta(wf.data.voidTrader.endString, true) : "returns in " + formatEta(wf.data.voidTrader.startString, true)); 
                })}},
    },

    function: function(request, argument, message, nm) {
        axios.get(url).then(function(response) {
            var thumbnail = module.exports.picture,
                embed = "";
            
            var footer = {
                timestamp: "*Stored on " + response.data.timestamp + "*",
                charLimit: "*Links removed due to discord char limit*\n"
            }

            switch (argument) {
                case "alerts":
                    embed = nm.core.embed(
                        "Here's Warframe's mission alerts",
                        response.data.alerts.length + " mission alert" + (response.data.alerts.length != 1 ? "s" : "") + " available", 
                        generateAlerts(response.data.alerts, footer), 
                        thumbnail
                    );
                    break;

                case "deals":
                    embed = nm.core.embed(
                        "Here's Warframe's daily deals", //console.log(wf.flashSales);
                        response.data.dailyDeals.length + " daily deal" + (response.data.dailyDeals.length != 1 ? "s" : "") + " available", 
                        generateDeals(response.data.dailyDeals, footer),
                        thumbnail
                    ); 
                    break;

                case "fissures":
                    embed = nm.core.embed(
                        "Here's Warframe's void fissures",
                        response.data.fissures.length + " void fissure" + (response.data.fissures.length != 1 ? "s" : "") + " available", 
                        generateFissures(response.data.fissures, footer), 
                        thumbnail
                    );
                    break;

                case "invasions":
                    var i = 0; // data.invasions.length is not accurate
                    response.data.invasions.forEach(function(invasion) {
                        if (!invasion.completed) i++; // thanks DE >:(
                    });

                    embed = nm.core.embed(
                        "Here's Warframe's faction invasions",
                        i + " faction invasion" + (response.data.invasions.length != 1 ? "s" : "") + " available",
                        generateInvasions(response.data.invasions, footer),
                        thumbnail
                    );
                    break;

                case "sortie":
                    var sortie = "**Sortie boss:** " + response.data.sortie.boss + ", " + response.data.sortie.faction + "\n\n";

                    response.data.sortie.variants.forEach(function(s) {
                        sortie += "**" + s.missionType + "**, " + s.node;
                        sortie += "\n" + s.modifier + "\n\n";
                    })

                    embed = nm.core.embed(
                        "Here's Warframe's sortie missions",
                        "Changes in " + formatEta(response.data.sortie.eta, true),
                        sortie, thumbnail
                    );
                    break;
                
                case "void trader":                   
                    if (!response.data.voidTrader.active) {
                        embed = nm.core.embed( // void trader hasn't arrived
                            "[Farewell, Tenno. Until we meet again.](https://vignette.wikia.nocookie.net/warframe/images/5/5c/BaroKiTradeLeave2.ogg/revision/latest?cb=20150202164653)",
                            "The Void Trader returns in " + formatEta(response.data.voidTrader.startString, true),
                            response.data.voidTrader.character + " will arrive next at the **" + response.data.voidTrader.location + "**\n\n" + footer.timestamp,
                            thumbnail
                        );
                    } else {
                        embed = nm.core.embed( // void trader is here
                            "[The wait is over Tenno, Baro Ki\'Teer has arrived.](https://vignette.wikia.nocookie.net/warframe/images/c/c6/BaroKiIntro1.ogg/revision/latest?cb=20141216235729)",
                            "The Void Trader is now at " + response.data.voidTrader.location,
                            "**" + response.data.voidTrader.inventory.length + " void items for sale.** " + response.data.voidTrader.character + " will depart in " + formatEta(response.data.voidTrader.endString, true) + ".",
                            thumbnail
                        );        

                        response.data.voidTrader.inventory.forEach(function(i) {
                            embed.embed.fields.push({
                                name: i.item,
                                value: "[**" + i.ducats + " ducats**, " + i.credits + " credits](" + generateWikiUrl(i.item) + ")",
                                inline: true
                            });
                        });

                        // push empty data to add white space for embedded message
                        embed.embed.fields.unshift({ name: "_ _", value: "_ _" });         
                        embed.embed.fields.push({ name: "_ _", value: footer.timestamp });                        
                    }
                    break;
            }

            nm.core.speak(embed, message);
        });
    }
}

// clean eta provided by warframe
function formatEta(eta, useWords) {
    var array = eta.split(" ");

    if (useWords)
        array.forEach(function(a, i) {
            var s = (a.substring(0, a.length - 1) == "1" ? "" : "s"); // pesky plural
            if (array[i].includes("d")) array[i] = array[i].replace("d", " day" + s);
            else if (array[i].includes("h")) array[i] = array[i].replace("h", " hour" + s);
            else if (array[i].includes("m")) array[i] = array[i].replace("m", " minute" + s);
            else if (array[i].includes("s")) array[i] = array[i].replace("s", " second" + s);
        })

    if (array.length < 2) return array[0];
    else return array[0] + (useWords ? " and " : " ") + array[1];
}

// return formatted warframe items for discord message
function formatRewards(items, countedItems, credits) {
    var itemUrls = [],
        countedItemUrls = [];

    if (typeof items == 'string') { // alert is array, deal is string
        var item = "[" + items + "](" + generateWikiUrl(items) + ")";
        itemUrls.push(item);
    } else items.forEach(function(i) {
        var item = "[" + i + "](" + generateWikiUrl(i) + ")";
        itemUrls.push(item);
    });

    if (countedItems && countedItems.length > 0)
        countedItems.forEach(function(c) {
            var item = "[" + (c.count > 1 ? c.count + " " : "") + c.type + "](" + generateWikiUrl(c.type) + ")";
            countedItemUrls.push(item); // generate and store markdown link in [my title](http://mylink) format
        });

    var result = ""; // format items, return if items only
    if (itemUrls.length > 0) result = itemUrls.join(", ");
    if (countedItemUrls.length < 1 && !credits) return result;

    // format counted items, return if counted items only
    if (countedItemUrls.length > 0) result += (result ? " + " : "") + countedItemUrls.join(", ");
    if (!credits) return result;

    // format credits, return result
    result += (result ? " + " : "") + credits + "cr";
    return result;
}

function generateAlerts(alerts, footer) {
    var result = { raw: "", ref: "" }
    // character limit may be reached
    
    alerts.forEach(function(a) {
        if (a.eta.substring(0, 1) == "-") return; 
        // stop storing expired missions, wtf DE

        var rewards = { 
            raw: a.mission.reward.asString, // store plain text and href responses incase char limit is reached
            ref: formatRewards(a.mission.reward.items, a.mission.reward.countedItems, a.mission.reward.credits)
        }

        result.raw += "**" + rewards.raw + "** ` " + formatEta(a.eta) + "` \n" + a.mission.faction + " " + a.mission.type + ", " + a.mission.node + "\n\n";
        result.ref += "**" + rewards.ref + "** ` " + formatEta(a.eta) + "` \n" + a.mission.faction + " " + a.mission.type + ", " + a.mission.node + "\n\n";
    });
    
    if (result.raw.length < (1024 - (footer.timestamp.length + footer.charLimit.length)))
        result.raw += footer.charLimit + footer.timestamp;

    if (result.ref.length < (1024 - footer.timestamp.length))
        result.ref += footer.timestamp;

    return result.ref.length < 1024 ? result.ref : result.raw;
}

function generateDeals(deals, footer) {
    var result = { raw: "", ref: "" }
    // character limit may be reached

    deals.forEach(function(d) {
        var items = {
            raw: d.item,
            ref: formatRewards(d.item)
        }

        result.raw += "**" + items.raw + "**  ` " + formatEta(d.eta) + "` \n" + d.sold + " sold at " + d.discount + "% off!  *~~" + d.originalPrice + "~~*  " + d.salePrice + " platinum \n\n";
        result.ref += "**" + items.ref + "**  ` " + formatEta(d.eta) + "` \n" + d.sold + " sold at " + d.discount + "% off!  *~~" + d.originalPrice + "~~*  " + d.salePrice + " platinum \n\n";
    });

    if (result.raw.length < (1024 - (footer.timestamp.length + footer.charLimit.length)))
        result.raw += footer.charLimit + footer.timestamp;

    if (result.ref.length < (1024 - footer.timestamp.length))
        result.ref += footer.timestamp;

    return result.ref.length < 1024 ? result.ref : result.raw;
}

function generateFissures(fissures, footer) {
    var relics = { Axi: [], Neo: [], Meso: [], Lith: [] },
        result = { raw: "" }; // retain old data structure

    fissures.forEach(function(f) { // store current fissures based on tier
        if (f.eta.substring(0, 1) == "-") return; // stop storing missions that have already ended, wtf DE
        relics[f.tier].push(f.enemy + " " + f.missionType + ", " + f.node + " `" + formatEta(f.eta) + "`")
    });

    for (var key in relics) {
        var tier = relics[key];

        if (tier.length > 0) { // build response from arrays in descending order
            result.raw += "**" + tier.length + " " + key + " mission" + (tier.length != 1 ? "s" : "") + "**\n" + tier.join("\n") + "\n\n";
        }
    }

    return result.raw + footer.timestamp;
}

function generateInvasions(invasions, footer) {
    var result = { raw: "", ref: "" }
    // character limit may be reached

    invasions.forEach(function(i) {
        if (i.completed || i.eta.substring(0, 1) == "-") return; 
        // stop storing missions that have already ended, wtf DE

        var rewards = { raw: [], ref: [] }
        // attacker defender string caches 
        
        if (i.attackerReward.asString) {
            rewards.raw.push(i.attackerReward.asString);
            rewards.ref.push(formatRewards(i.attackerReward.items, i.attackerReward.countedItems, i.attackerReward.credits));
        }
        
        if (i.defenderReward.asString) {
            rewards.raw.push(i.defenderReward.asString);
            rewards.ref.push(formatRewards(i.defenderReward.items, i.defenderReward.countedItems, i.defenderReward.credits));
        }

        result.raw += "**" + rewards.raw.join(", ") + "**" + " `" + formatEta(i.eta) + "` \n" + i.attackingFaction + " vs " + i.defendingFaction + ", " + i.node + "\n\n";
        result.ref += "**" + rewards.ref.join(", ") + "**" + " `" + formatEta(i.eta) + "` \n" + i.attackingFaction + " vs " + i.defendingFaction + ", " + i.node + "\n\n";
    });

    if (result.raw.length < (1024 - (footer.timestamp.length + footer.charLimit.length)))
        result.raw += footer.charLimit + footer.timestamp;

    if (result.ref.length < (1024 - footer.timestamp.length))
        result.ref += footer.timestamp;

    return result.ref.length < 1024 ? result.ref : result.raw;
}

// best guess the items wiki url
function generateWikiUrl(item) {
    var url = "https://warframe.wikia.com/wiki/",
        res = item;

    // this is so dirty but I literally don't give a flip
    while (res.includes(" ")) res = res.replace(" ", "_");
    while (res.includes("_Of_")) res = res.replace("_Of_", "_of_");
    while (res.includes("_Weapon")) res = res.replace("_Weapon", "");
    while (res.includes("_Systems")) res = res.replace("_Systems", "");
    while (res.includes("_Blueprint")) res = res.replace("_Blueprint", "");

    // nice naming scheme warframe wiki >:(
    if (item == "Detron Mara") res = "Mara_Detron";
    else if (item.includes(" Endo")) res = "Endo";
    else if (item.includes("Mod Pack")) res = "Mod_Pack";
    else if (item.includes("Synadana")) res = "Syandana";
    else if (item.includes("Bobble Head")) res = "Orbiter";
    else if (item.includes("Sugatra")) res = "Weapon_Cosmetics";
    else if (item.includes("Nav Coordinate")) res = "Nav_Coordinates";
    else if (item == "Elixis Odonata Skin") res = "Odonata_Elixis_Skin";
    else if (item.includes("Chest Plate") || item.includes("Shoulder Plates" || item.includes("Leg Plates"))) res = "Armor_(Cosmetic\\)";
    else if (item.includes("Pet Mask") || item.includes("Pet Wings") || item.includes("Pet Tail") || item.includes("Sentinel")) res = "Sentinel_Cosmetics";

    return url + res;
}