// Hello! You are reading the public version of mutinybot.
// This document is kept scrubbed and edited (removing lots of things).
// If you need the full code feel free to contact me and I can send it.

exports.Start = function() {

    var fs = require('fs');
    var UsersFile = 'D:/Library/Projects/Coding/Discord/mutiny_bot/saved_users.json';
    var Users = JSON.parse(fs.readFileSync(UsersFile));

    const axios = require("axios");
    
    const Discord = require('discord.js');
    const bot = new Discord.Client();

    const GoogleSearch = require('google-search');
    const search = new GoogleSearch({
        key: " private key pls no steal ",
        cx: " private key pls no steal "
    });

    var Names = {
        "admin" : ["bot", "slave"],
      //"users" : ["hurr", "durr"], (reminder I can do this if needed)
        "guest" : ["nm", "mutiny bot", "not mutiny", "@!318244733975658496"],
    }
    
    var wf = "";
    //warframestat.us/pc
    UpdateWarframeJSON();

    //fast debug info
    var Debug = false;

   /* [reference]     (* means required)
    *
    * Object key* :    
    *      command* : ["words", "to", "invoke", "key"] || (false)
    *      summary* : header description, false hides from help
    *      picture  : image link that spawns thumbnails in help
    *      require  : "users" || "admin" (< requires user level)
    *      options  : extra commands for easier method building
    *      methods  : code that fires on aforementioned command
    */

    var core = {

        Discord : {
            command : false,
            picture : "https://i.imgur.com/t6L06o0.png",
            summary : "Utilize features provided by discord.js",
            require : "users",
            options : {
                Delete : {
                    cmds : ["delete", "delet"],
                    desc : "Deletes the last post in this channel from <username>" },
                Playing : {
                    cmds : ["game", "playing", "play", "status"],
                    desc : "Changes <username>s now playing string globally"},
                Nickname : {
                    cmds : ["nickname", "name"],
                    desc : "Changes <username>s nickname on this server"},
                Uptime : {
                    cmds : ["uptime", "session"],
                    desc : "Checks <username>s current session uptime"}},
            methods : function(command, message){
                var option = Object.keys(command.more)[0];
    
                switch(option) {
                    case "Delete" :
                        var target = bot.user.lastMessage;
                        if (target == null)
                            console.log("Error: Cannot delete message");
                        else if (target.deletable) target.delete();
                        break;
                    case "Uptime" :
                        var time = msToTime(bot.uptime);
                        var h = ""; if (time[0] > 0) h = time[0] + " hours ";
                        var m = ""; if (time[1] > 0) m = time[1] + " minutes ";
                        var s = ""; if (time[2] > 0) s = time[2] + " seconds";
                        Speak("I have been running for "+h+m+s, message);
                        break;
                    case "Playing" :
                    case "Nickname" :
                        var result = "";
                        for (var flags in command.more[option]) {
                            flags = command.more[option][flags];
                            if (message.content.includes(flags)) {
                                var index = message.content.indexOf(flags) + flags.length + 1;
                                result = message.content.substring(index, message.content.length);
                                break; }}
                        if (result) {
                            if (option == "Playing") bot.user.setGame(result);
                          //if (option == "Username") bot.user.setUsername(result); disabled to prevent abuse
                            if (option == "Nickname") message.guild.members.get(bot.user.id).setNickname(result);
                        } else console.log("Error: "+command.key+" could not generate "+option.toLowerCase()+"!");
                        break;
                    default :
                        var help = GetHelp(command, message);
                        if (help) Speak(help, message);
                }
            }
        },
    
        Faces : {
            command : false,     
            summary : false, 
            require : "users",
            options : {
                angry : ["angry", "mad", "pissed", "reee"],
                happy : ["happy"],
                upset : ["sad", "cry", "cri"]},
            response : {
                angry : ["｡゜(｀Д´)゜｡","ヽ(｀Д´)ﾉ","ლಠ益ಠ)ლ", "(ノ°益°)ノ", "(つ◉益◉)つ","╯‵Д′)╯彡┻━┻ "], 
                happy : ["( ﾟヮﾟ)","(・∀・)","(╯✧▽✧)╯","◉­‿ ­◉ ","ʘ ‿  ʘ","(≧▽≦)","´ ▽ ` )ﾉ","(＾ｖ＾)","（⌒▽⌒）","(＾ω＾)","ヽ(ヅ)ノ","´･ᴗ･`","(^▽^)"],
                upset : ["（◞‸◟）","ಠ╭╮ಠ","ಡ_ಡ","ಥдಥ","(ಥ﹏ಥ)","(ಥ_ಥ)"],
    
                surprise : ["w(°ｏ°)w", "ヽ(°〇°)ﾉ", "Σ(O_O)", "Σ(°ロ°)", "(°ロ°) !"],
                confused : ["(-_-;)・・・"],
                embed : ["´ ▽ ` )ﾉ","ヾ(＾∇＾)","(´・ω・｀)","\_(:3」∠)\\\_", "(°ロ°) !"]},
            methods : function(command, message){
                var emotion = Object.keys(command.more)[0];
                var face = core.Faces.response[emotion];
                var trigger = command.more[emotion][0];
                var sentence = GetSentence(message);
    
                if (sentence.indexOf(trigger) == -1) return;
                if (face) face = face[Random(0, face.length)];
                if (face) Speak(face, message);
            }
        },
    
        Points : {
            command : ["points", "point"],
            picture : "https://i.imgur.com/ezJ3mda.png",
            summary : "Manage your collection of internet points",
            require : "users",
            options : {
                Bet : {
                    cmds : ["?", "bet", "gamble", "wager", "flash"],
                    desc : "Throw money into a hole and win big time"},
                Give : {
                    cmds : ["+", "add", "give", "donate", "throw", "slide"],
                    desc : "Give target(s) a specified amount of points"},
                Take : {
                    cmds : ["-", "del", "take", "steal", "mug", "del"],
                    desc : "Risk taking some points away from *target(s)*"},},            
            methods : function(command, message) {
                // will add this later probably
            }
        },

        Search : {
            command : ["search", "get me", "find"],
            picture : "https://i.imgur.com/eNrBN6A.png",
            summary : "Returns requested internet search results",
            require : "users",
            options : {  
                "https://www.halopedia.org/" : {
                    cmds : ["halo"],
                    desc : "Halopedia search results"},                        
                "http://warframe.wikia.com/" : {
                    cmds : ["wf", "warframe"],
                    desc : "Warframe Wiki search results"},
                "http://www.wikipedia.org/" : {
                    cmds : ["wikipedia"],
                    desc : "Wikipedia search results"},
                "http://www.youtube.com/" : {
                    cmds : ["yt", "youtube"],
                    desc : "Youtube search results"}},
            methods : function(command, message) {
                var SearchSite = Object.keys(command.more)[0] || "";
                var SitePhrase = SearchSite ? command.more[SearchSite][0] : "";
                var sentence = GetSentence(message);

                var index = message.content.search(command.word) + command.word.length + 1;
                if(sentence.indexOf(command.word) + 1 == sentence.indexOf(SitePhrase)) // eg. ["find"] ["halo"] warthog
                    index = index + SitePhrase.length + 1 > message.content.length ? index : index + SitePhrase.length + 1;
                var SearchTerm = message.content.slice(index, message.content.length);
                if(!SearchTerm) return;

                search.build({
                    q: SearchTerm, num: 1, siteSearch: SearchSite, 
                }, function(error, response) {

                    if(response.items) {
                        var res = GetEmbed(command), embed = res.embed;
        
                        // generate nice looking title
                        var trash = ["\|", " - "], cache = [];
        
                        trash.forEach(function(t) {
                            if(!response.items[0].title.includes(t)) return;
                            cache = response.items[0].title.split(t);
        
                            for(i = 0; i < cache.length; i++) cache[i] = cache[i].trim();
                        })

                        embed.fields[0].name += cache.length <= 1 ? response.items[0].title : cache[0] + " - " + cache[1];
                        embed.description = embed.description.replace("<header>", "Here's what I found for **" + SearchTerm + "**");
                        if(cache[1] == "") embed.fields[0].name = embed.fields[0].name.substring(0, embed.fields[0].name.length - 2);

                        // assigns search thumbnail
                        if(response.items[0].pagemap && response.items[0].pagemap.cse_thumbnail)
                            embed.thumbnail.url = response.items[0].pagemap.cse_thumbnail[0].src;
        
                        // generates search description
                        embed.fields[0].value = response.items[0].snippet;
                        while(embed.fields[0].value.includes("\n"))
                            embed.fields[0].value = embed.fields[0].value.replace("\n", "");
                        embed.fields[0].value += "\n\n" + response.items[0].link;

                        Speak(res, message);

                    } else if (!response.items)
                        Speak("I couldn't find any results for "+SearchTerm, message); 

                    else if (response.error && response.error.errors)
                        response.error.errors.forEach(function(err){
                            console.log("Error: "+err.reason+". Search aborted!")
                        })
                })
            }
        },
    
        Users : {
            command : ["user"],
            picture : "https://i.imgur.com/Ik6B7YF.png",
            summary : "Change the bots whitelisted users",
            require : "admin",
            options : {
                Save : {
                    cmds : ["add", "save", "listen"],
                    desc : "Saves target(s) to bot whitelist"},
                Remove : {
                    cmds : ["delete", "remove"],
                    desc : "Deletes target(s) from bot whitelist"},
                Print : {
                    cmds : ["print", "show", "say", "list"],
                    desc : "Returns the list of whitelisted users"}},
            methods : function(command, message) {
                var option = Object.keys(command.more)[0];
                var target = message.mentions.users;

                if (option == "Print") {
                    var res = GetEmbed(command), embed = res.embed;

                    embed.description = embed.description.replace("<header>", "Here's a list of my saved users")
                    embed.fields[0].name += Users.length + " saved " + (Users.length > 1 ? "users" : "user");
                    embed.thumbnail.url = core.Users.picture;

                    Users.forEach(function(u){
                        embed.fields[0].value += "**"+u.name+"**";
                        if(u.sudo) embed.fields[0].value += "  ( bot admin )";
                        embed.fields[0].value += "\n`[ "+u.id+" ]`\n\n";
                    })

                    Speak(res, message);
                    return;
                }

                var exists, cache = [];
                    
                target.forEach(function(u) {
                    var index = Users.findIndex(s => s["id"] == u.id);
                    exists = index > -1 ? true : false;
                    cache.push(u.username);

                    switch(option) {
                        case "Save" :
                            if (exists) return; // dont add what is already there
                            Users.push({ "id" : u.id, "name" : u.username, "sudo" : false });
                            fs.writeFile(UsersFile, JSON.stringify(Users), 'utf8', function(err){
                                if(err) throw err;
                            }); break;
                        case "Remove" :
                            if (!exists) return;
                            Users.splice(index, 1);
                            fs.writeFile(UsersFile, JSON.stringify(Users), 'utf8', function(err){
                                if(err) throw err;
                            }); break;
                    }
                })   

                var response = cache.join(", ");

                if ((option == "Save" && exists) || (option == "Remove" && !exists)) {
                    if (option == "Save") response += (cache.length > 1 ? " are already saved users" : " is already a saved user");
                    if (option == "Remove") response += (cache.length > 1 ? " are not saved users" : " is not a saved user");
                    Speak(response, message);
                }

                else {
                    response += " was " + (option == "Save" ? "saved to" : "removed from") + " my users";
                    if (cache.length > 1) response = response.replace("was", "were");
                    Speak(response, message);
                }
            }
        },
    
        Warframe : {
            command : ["wf", "warframe"],
            picture : "https://i.imgur.com/wiwwzmZ.png",
            summary : "Returns the latest Warframe worldstate data",
            options : {
                Alerts :  {
                    cmds : ["alerts", "alert", "reward"],
                    desc : "<#a> mission alerts available" },
                Deals : {
                    cmds : ["deals", "deal", "darvo"],
                    desc : "<#d> deals on sale from Darvo" },
                Fissures : {
                    cmds : ["fissures", "fissure"],
                    desc : "<#f> void fissure missions" },
                Invasions : {
                    cmds : ["invasions", "invasion"],
                    desc : "<#i> ongoing faction invasions" },
                Trader : {
                    cmds : ["trader", "baro"],
                    desc : "<#v>" }},
            methods : function(command, message) {
                var option = Object.keys(command.more)[0], i = 0;
                var res = GetEmbed(command), embed = res.embed;

                switch (option) {
                    case "Trader" : 
                        if(!wf.voidTrader.active) {
                            Speak("the void trader returns in "+wf.voidTrader.startString, message);
                            break; // expand this later
                        }

                    case "Alerts" :
                        embed.description = embed.description.replace("<header>", "Here's the current mission alerts");
                        wf.alerts.forEach(function(a){
                            embed.fields[0].value += "**"+a.mission.reward.asString+"**  `"+a.eta+"`\n";
                            embed.fields[0].value += a.mission.type+", "+a.mission.node+"\n\n";
                            i++;
                        }); break;

                    case "Deals" :
                        embed.description = embed.description.replace("<header>", "Here's the current daily deals");
                        wf.dailyDeals.forEach(function(a){
                            embed.fields[0].value += "**" + a.item + "**  `" + a.eta + "`\n";
                            embed.fields[0].value += a.sold + " sold at " + a.discount + "% off!  *~~"+a.originalPrice+"~~*  "+a.salePrice+" platinum \n\n";
                            i++;
                        }); break;

                    case "Fissures" :
                        embed.description = embed.description.replace("<header>", "Here's the current void fissues");
                        wf.fissures.forEach(function(a){
                            embed.fields[0].value += "**"+a.tier+"**  `"+a.eta+"`\n";
                            embed.fields[0].value += a.missionType+", "+a.node+"\n\n";
                            i++;
                        }); break;

                    case "Invasions" :
                        embed.description = embed.description.replace("<header>", "Here's the current faction invasions");
                        wf.invasions.forEach(function(a){
                            if(a.completed) return;
                            if(a.attackerReward.asString)
                                embed.fields[0].value += "**" + a.attackerReward.asString + "**";
                            if(a.defenderReward.asString) {
                                if(a.attackerReward.asString) embed.fields[0].value += ", ";
                                embed.fields[0].value += "**" + a.defenderReward.asString + "**";
                            }
                            embed.fields[0].value += " `"+a.eta+"`\n"+a.attackingFaction+" vs "+a.defendingFaction+", "+a.node+"\n\n";
                            i++;
                        }); break;
                }

                if(!embed.description.includes("<header>")) { // if result
                    if(i == 1) option = option.slice(0, option.length - 1);
                    embed.fields[0].name += i + " " + option.toLowerCase() + " available";
                    embed.fields[0].value += "*Stored on "+wf.timestamp+"*";
                    Speak(res, message);
                }
            }
        },
    }

    // discord events //
    bot.on("ready", () => {
        console.log("not mutiny has started, with "+bot.users.size+" users, in "+bot.channels.size+" channels of "+bot.guilds.size+" guilds.");
    });

    bot.on("message", (message) => {
        if (message.author.bot) return; // robots pls go
        var summoned = GetSummon(message) ? true : null;
        var command = GetCommand(message, summoned);

        if (command) {
            if (!command.lock)
                Think(command, message);

            else console.log("Locked! " + message.author.username + " does not meet level requirement for " + command.key);
        }

        if(Debug) {
            if(command) {
                console.log(command);
                console.log("Summoned: " +summoned+ "\n");
            }
        }
    })

    bot.on("messageReactionAdd", (messageReaction, user) => { 
        if(user.id == '127655681754005504') messageReaction.message.react(messageReaction.emoji);
    });
    
    bot.on("messageReactionRemove", (messageReaction, user) => {  
        if(user.id == '127655681754005504') messageReaction.remove(bot.user.id)
    });

    // convenience methods //
    function Think(command, message) {
        core[command.key].methods(command, message);
    }
    
    function Speak(response, message) {
        message.channel.startTyping();
        setTimeout(function(){
            message.channel.stopTyping();
            if (typeof response == "string") 
                message.channel.send(response);
            else if (typeof response == "object") {
                var keys = Object.keys(response);
                if(keys[0] == "embed")
                    message.channel.send(response);
                else return;
            }
        }, 250 + Math.random() * 750);
    }
    
    function Random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    // robot methods //
    function GetEmbed(command) {
        var faces = core.Faces.response;
        faces = "  " + faces.embed[Random(0,faces.embed.length)];
        var target = command.key != "$DEFAULT" ? command.key : "Faces"; // this line is a hack pls dont do this

        return {embed: {
            description : "<header>" + faces,
            color: 10249740,
            footer : {
                icon_url : "https://avatars3.githubusercontent.com/u/24806578",
                text : "https://github.com/notmutiny/" },
            thumbnail : {
                url : core[target].picture || "https://cdn.discordapp.com/avatars/318244733975658496/166fd4bc92322ed291c8515f5f2c6ff2.png" },
            fields : [
                {
                    name : ":small_orange_diamond:" + "  ",
                    value : "",
                },
            ]
        }}
    }

    function GetHelp(command, message) {
        var res = GetEmbed(command), embed = res.embed;
        var user = GetUser(message);

        var level = user || "guest"; // gets user level of author
        if(typeof level.sudo == "boolean") level = level.sudo ? "admin" : "whitelisted"; 

        if(command.key == "$DEFAULT") { // if no command is supplied
            
            embed.description = embed.description.replace("<header>", "Here are my commands");
            embed.fields[0].name = ":black_small_square:  Made with https://discord.js.org/ !";
            
            // generate commands and parent fields
            var users = ":lock:  **<i> whitelist commands** \n\n";
            var admin = ":closed_lock_with_key:  **<i> administrator commands** \n\n";
            var guest = ":unlock:  **<i> guest commands** \n\n";
            guest += "`[ help ]`  Returns bot data if paired with a command \n\n";
            var i = [0, 0, 1]; // [users, admin, guest]

            for(var key in core) { // pushes formatted commands into their respective cache
                var target = core[key], braces = target.command[0] ? "`[ - ]`" : "`{ - }`";
                var cmd = target.command[0] || key.toLowerCase(); // if no command save key

                switch (target.require) {

                    case "users" :
                        if (!target.summary) break;
                        users += braces.replace("-", cmd) + "  " + target.summary + "\n\n";
                        i[0] += 1; break;

                    case "admin" :
                        if (!target.summary) break;
                        admin += braces.replace("-", cmd) + "  " + target.summary + "\n\n";
                        i[1] += 1; break;

                    default :
                        if (!target.summary) break;
                        guest += braces.replace("-", cmd) + "  " + target.summary + "\n\n";
                        i[2] += 1; break;
                }
            }

            // adds number of category commands
            users = users.replace("<i>", i[0]);
            admin = admin.replace("<i>", i[1]);
            guest = guest.replace("<i>", i[2]);

            // fixes plural commands with singular number
            if(i[0] < 2) users = users.replace("commands", "command");
            if(i[1] < 2) admin = admin.replace("commands", "command");
            if(i[2] < 2) guest = guest.replace("commands", "command");

            switch(level) { // generates footer w/ user level and flavor text

                case "admin" :
                    var flavorText = ["Too OP pls nerf.", "Am I behaving well?", "Glory be upon you."];
                    flavorText = flavorText[Random(0, flavorText.length)];
                    level = "an " + level + "! " + flavorText; break;

                case "whitelisted" :
                    var flavorText = ["Entries with { } don't use a command!", "Try combining help and a command!"];
                    flavorText = flavorText[Random(0, flavorText.length)];
                    level = "whitelisted. " + flavorText; break;

                default :
                    var flavorText = ["Uh oh, stranger danger!", "Entries with { } don't use a command!", "Try combining help and a command!"];
                    flavorText = flavorText[Random(0, flavorText.length)];
                    level = "a " + level + ". " + flavorText; break;
            }

            embed.fields[0].value = guest + users + admin;
            embed.fields[0].value += "( *You're " + level + "* )";

        } else { // command is specified, dump all info about command

            var target = core[command.key], i = 0;

            if(target.summary == false) return; // command is excluded from help menu
            var subject = command.word || Object.keys(command.more)[0].toLowerCase();
            embed.description = embed.description.replace("<header>", "Here's what I know about **" + subject + "**");
            embed.fields[0].name += target.summary || "No summary available!";
            if(target.picture) embed.thumbnail.url = target.picture;

            // generates commands row
            if(target.command) target.command.forEach(function(c){
                if(i < 1) embed.fields[0].value = "**Commands**  `[ ";
                embed.fields[0].value += c;

                if(i != target.command.length - 1) i++, embed.fields[0].value += ", ";
                else i++, embed.fields[0].value += " ]`";
            })

            if(!i) embed.fields[0].value = "**Commands**  `[ n/a ]`";
            else i = 0;

            // generates options column
            for(var keys in target.options) {
                if(i < 1) embed.fields[0].value += "\n\n**<i> options available**\n\n";
                embed.fields[0].value += "    **" + keys + "**  `[ " + target.options[keys].cmds.join(", ") + " ]`\n";                
                embed.fields[0].value += "    " + target.options[keys].desc + " \n\n";
                i++;
            }

            var replace = [
                { "<i>" : i },
                { "<username>" : bot.user.username },
                { "<#a>" : wf.alerts.length },
                { "<#d>" : wf.dailyDeals.length },
                { "<#f>" : wf.fissures.length },
                { "<#i>" : function() {
                    var index = 0;
                    wf.invasions.forEach(function(i){
                        if(!i.completed) index++;
                    }); return index; }},
                { "<#v>" : function() {
                    if(!wf.voidTrader.active) return wf.voidTrader.startString + " until arrival";
                    else return "mutiny is an idiot and didnt set this up yet"; }
                }
            ]

            replace.forEach(function(r){
                var flag = Object.keys(r);
                
                while(embed.fields[0].value.includes(flag))
                    embed.fields[0].value = embed.fields[0].value.replace(flag, r[flag]);
            })

            // generates account footer
            var privacy = "whitelisted";
            if(target.require == null) privacy = "guest";
            if(target.require == "admin") privacy = "admin";

            embed.fields[0].value += "( *Requires " + privacy + " account. You're " + level + "!* )";      
        }
        
        return res;
    }

    function GetSentence(message) {
        var del = [".", "!", "?"];
        var raw = message.content.split(" ");
        var res = [];
    
        for (i = 0; i < raw.length; i++){
            if (raw[i] != " " && raw[i] != "") {
                var item = raw[i];
    
                del.forEach(function(e){
                    while (item.substring(item.length-1,item.length) == e) { // while item.includes(e) replace(e, "") ?
                        item = item.slice(0,item.length - 1);
                    }
                })
    
                res.push(item);
            }
        } 
    
        return res;
    }

    function GetSummon(message) {
        var user = GetUser(message);
        var res = false;

        for(var perms in Names){
            var array = Names[perms];
            for(var words in array) {
                words = array[words];
                if(message.content.includes(words)) {
                    if(user && user.sudo) res = true;
                    else if(user && perms != "admin") res = true;
                    else if(perms == "guest") res = true;
                    if(res) break;
                }
            }
        }

        return res;
    }

    function GetUser(message) {
        var res = null;

        Users.forEach(function(u){
            if(message.author.id == u.id) res = u;
        })

        return res;
    }
    
    function GetCommand(message, summoned) { // this should be cleaned
        if(!summoned) return;

        var user = GetUser(message), cache = [];

        var result = {
            key : "",
            word : "",
            lock : true,
            more : {},
        };
    
        // grabs .key and .word
        for (var keys in core) {
            var array = core[keys].command;
    
            if(!array) {
                cache.push(keys);
                array = [keys.toLowerCase()];
            } 
    
            for (var words in array) {
                words = array[words];
                if(message.content.includes(words)) {
                    result.key = keys;
                    result.word = words;
                    break;
                }
            }
        }
    
        // grabs .more
        var search = result.key != "" ? [result.key] : cache;
    
        search.forEach(function(key) {
            var options = core[key].options;
    
            // adds all defined options
            for(var keys in options) {
                var cmds = options[keys];

                // lets me shorthand like in core.Faces
                if (!Array.isArray(cmds)) cmds = cmds.cmds;

                cmds.forEach(function(a){
                    if(message.content.includes(a)){
                        if (!result.key) result.key = key;
                        if (key == result.key) {
                            if (!Array.isArray(result.more[keys])) result.more[keys] = [];
                            result.more[keys].push(a);
                        }
                    }
                })
            }
        })

        // generates help dialog
        var HelpCommands = ["help"];
        for (var help in HelpCommands) {
            help = HelpCommands[help];

            if(message.content.includes(help)) {
                if (result.key) { // help warframe, help nickname, etc
                    var input = result.word || result.more[Object.keys(result.more)[0]][0];
                    if (message.content.indexOf(help) < message.content.indexOf(input)) {
                        var help = GetHelp(result, message);
                        if (help) Speak(help, message);
                        return;
                    }
                } else { // only help (merge these two paths)
                    result.key = "$DEFAULT";
                    var help = GetHelp(result, message);
                    if (help) Speak(help, message);
                    return;
                }
            }
        }
    
        // lets me if(command)
        if(!result.key) return; 
    
        // grabs .lock, handles user permissions
        if(user && user.sudo) result.lock = false;
        else if(user && core[result.key].require != "admin") result.lock = false;
        else if(!core[result.key].require) result.lock = false;
    
        return result;
    }
    
    function UpdateWarframeJSON() { // return this
        axios.get('https://ws.warframestat.us/pc')
        .then(function(response){
            wf = response.data;
        });
    }

    bot.login(/* private key pls no steal */);
}
