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
        // key: private key pls no steal,
        // cx: private key pls no steal
    });

    // fast debug info
    var Debug = true;

    var Names = {
        "admin" : ["bot", "slave"],
        //"users" : ["hurr", "durr"], (reminder I can do this if needed)
        "guest" : ["nm", "mutiny bot", "not mutiny", "@!318244733975658496"],
    }
    
    var wf = "";
    // warframestat.us/pc
    UpdateWarframeJSON();

        /*  [reference]     ( * means required! )
        *
        *   Object key* :    
        *       command* : ["words", "to", "invoke", "key"] || false
        *       summary* : command description || false hide in help
        *       picture  : image link that spawns thumbnails in help
        *       require  : (requires account lvl) "users" || "admin" 
        *       options  : extra commands for easier method building
        *       methods  : code that fires on aforementioned command
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
                    desc : "Deletes the previous comment from <username>" },
                Listening : {
                    cmds : ["listen", "listening"],
                    desc : "Changes <username>s (global) listening activity"},
                Playing : {
                    cmds : ["game", "play", "playing"],
                    desc : "Changes <username>s (global) playing activity"},
                Nickname : {
                    cmds : ["nickname", "name"],
                    desc : "Changes <username>s nickname on this server"},
                Uptime : {
                    cmds : ["uptime", "session"],
                    desc : "Responds <username>s current session uptime"},
                Watching : {
                    cmds : ["watch", "watching"],
                    desc : "Changes <username>s (global) watching activity"}},
            methods : function(command, message){
                var option = Object.keys(command.more)[0];
                var string = message.content;
    
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
                    case "Listening" :
                    case "Playing" :
                    case "Nickname" :
                    case "Watching" :
                        var task = command.more[option], result = "";
                        var i = string.indexOf(task) + task.length + 1;
                        var result = string.substring(i, string.length);
                        
                        if (result) {
                            if (option == "Playing") bot.user.setGame(result);
                            //if (option == "Username") bot.user.setUsername(result); disabled to prevent abuse
                            if (option == "Nickname") message.guild.members.get(bot.user.id).setNickname(result);
                            if (option == "Listening") bot.user.setActivity(result, { type: "LISTENING" });
                            if (option == "Watching") bot.user.setActivity(result, { type: "WATCHING" });
                        } else console.log("Error: "+command.key+" could not generate "+option.toLowerCase()+"!");
                        break;
                }
            }
        },
    
        Faces : { // convert to generic responses
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
                var trigger = command.more[emotion];
                var sentence = GetSentence(message);
                if (sentence.indexOf(trigger) == -1) return;

                var face = RandomValue(core.Faces.response[emotion]);
                Speak(face, message);
            }
        },

        Logs : {
            command : ["logs", "log"],
            summary : "Check history or config <username>s logs",
            require : "admin",
            options : {
                View : {
                    cmds : ["view", "post"],
                    desc : "View the last few log entries"}},
            methods : function(command, message) {
                // will add this later probably
                var task = Object.keys(command.more)[0].toLowerCase();

                switch (task) {
                    case "view" :
                        //console.log(Logs);
                }
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
                var SitePhrase = SearchSite ? command.more[SearchSite] : "";
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
            picture : "https://i.imgur.com/uv7IKNG.png", //"https://i.imgur.com/Ik6B7YF.png",
            summary : "Change <username>s whitelisted users",
            require : "admin",
            options : {
                Save : {
                    cmds : ["add", "save", "listen"],
                    desc : "Saves target(s) to <username>s whitelist"},
                Remove : {
                    cmds : ["delete", "remove"],
                    desc : "Deletes target(s) from <username>s whitelist"},
                List : {
                    cmds : ["list", "print", "who"],
                    desc : "Returns the list of whitelisted user data"}},
            methods : function(command, message) {
                var option = Object.keys(command.more)[0];
                var target = message.mentions.users;

                if (option == "List") { // builds saved users list
                    var res = GetEmbed(command), embed = res.embed;
                    var str = Users.length > 1 ? "users" : "user";

                    embed.description = embed.description.replace("<header>", "Here's a list of my saved users");
                    embed.fields[0].name += String.format("{0} whitelisted {1}", Users.length, str);
                    embed.thumbnail.url = core.Users.picture;

                    Users.forEach(function(u){ // generates each users information
                        embed.fields[0].value += String.format("**{0}**", u.name);
                        if (u.sudo) embed.fields[0].value += "  ( bot admin )";
                        embed.fields[0].value += String.format("\n`[ {0} ]`\n\n", u.id);
                    })

                    Speak(res, message);
                    return;
                }

                // else edit saved user
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

                if ((option == "Save" && exists) || (option == "Remove" && !exists)) { // throw error
                    if (option == "Save") response += (cache.length > 1 ? " are already saved users" : " is already a saved user");
                    if (option == "Remove") response += (cache.length > 1 ? " are not saved users" : " is not a saved user");
                    Speak(response, message);
                }

                else { // request valid, success!
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
                    desc : "<#d> daily deals from Darvo" },
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
                var result = GetEmbed(command), embed = result.embed;
                var value = embed.fields[0].value, name = embed.fields[0].name;

                switch (option) {
                    case "Trader" : 
                        if(!wf.voidTrader.active) {
                            Speak("the void trader returns in "+wf.voidTrader.startString, message);
                            break; // expand this later
                        }

                    case "Alerts" :
                        embed.description = embed.description.replace("<header>", "Here's the current mission alerts");
                        wf.alerts.forEach(function(a){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", a.mission.reward.asString, a.eta);
                            embed.fields[0].value += String.format("{0}, {1} \n\n", a.mission.type, a.mission.node);
                            i++;
                        }); break;

                    case "Deals" :
                        embed.description = embed.description.replace("<header>", "Here's the current daily deals");
                        wf.dailyDeals.forEach(function(d){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", d.item, d.eta);
                            embed.fields[0].value += String.format("{0} sold at {1}% off!  *~~{2}~~*  {3} platinum \n\n", d.sold, d.discount, d.originalPrice, d.salePrice);
                            i++;
                        }); break;

                    case "Fissures" :
                        embed.description = embed.description.replace("<header>", "Here's the current void fissues");
                        wf.fissures.forEach(function(f){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", f.tier, f.eta);
                            embed.fields[0].value += String.format("{0}, {1} \n\n", f.missionType, f.node);
                            i++;
                        }); break;

                    case "Invasions" :
                        embed.description = embed.description.replace("<header>", "Here's the current faction invasions");
                        wf.invasions.forEach(function(w){
                            if(w.completed) return;
                            if(w.attackerReward.asString)
                                embed.fields[0].value += String.format("**{0}**", w.attackerReward.asString);
                            if(w.defenderReward.asString) {
                                if(w.attackerReward.asString) embed.fields[0].value += ", ";
                                embed.fields[0].value += String.format("**{0}**", w.defenderReward.asString);
                            }
                            embed.fields[0].value += String.format(" `{0}` \n{1} vs {2}, {3} \n\n", w.eta, w.attackingFaction, w.defendingFaction, w.node);
                            i++;
                        }); break;

                    default :
                        var help = GetHelp(command, message);
                        if (help) Speak(help, message);
                }

                if(!embed.description.includes("<header>")) { // if result
                    if(i == 1) option = option.slice(0, option.length - 1);
                    embed.fields[0].name += i + " " + option.toLowerCase() + " available";
                    embed.fields[0].value += "*Stored on "+wf.timestamp+"*";
                    Speak(result, message);
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

            else {
                var error = String.format("Locked! {0} does not meet level for {1}!", message.author.username, command.key);
                console.log(error); // save error to log when im not lazy
            }
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

    // <-- convenience methods --> //

    // automates callback methoding
    function Think(command, message) {
        core[command.key].methods(command, message);
    }

    // use for sending channel comments
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
    
    // returns random number
    function Random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // returns random array item
    function RandomValue(array) {
        if (!Array.isArray(array)) return;
        var res = array[Random(0, array.length)];
        return res;
    }

    // String.format("{0}", myString); ( <3 c# )
    if (!String.format) { // blackmagic I stole from stackoverflow
        String.format = function(format) { // wiggity wherp how does this werk
            var args = Array.prototype.slice.call(arguments, 1); // ??? *confused squinty eyes*
            return format.replace(/{(\d+)}/g, function(match, number) { // "ohh I get it" <- (doesnt get it at all)
                return typeof args[number] != 'undefined'
                    ? args[number] : match;
            });
        };
    }
    
    // <-- functional methods --> //

    // embed with default values
    function GetEmbed(command) {
        var target = command.key != "$DEFAULT" ? command.key : "Faces"; // this is a hack pls dont do this

        return {embed: {
            description : "<header>  " + RandomValue(core.Faces.response.embed),
            // modify description in other scope w/ .replace("<header>", value);
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

    /**
     * Generates help embed, forks between $DEFAULT (no command) and command object
     * @param { command{} } command 
     * @param { message{} } message 
     */
    function GetHelp(command, message) {
        var res = GetEmbed(command), embed = res.embed;
        var user = GetUser(message);

        var level = user || "guest"; // gets user level of author
        if(typeof level.sudo == "boolean") level = level.sudo ? "admin" : "whitelisted"; 

        if(command.key == "$DEFAULT") { // if no command is supplied
            embed.description = embed.description.replace("<header>", "Here's a list of my commands");
            embed.fields[0].name = ":black_small_square:  Made with https://discord.js.org/ !";
            
            // generate commands and respective parent fields
            var g = 1, guest = ":unlock:  **<g> guest commands** \n\n";
            var u = 0, users = ":lock:  **<u> whitelist commands** \n\n";
            var a = 0, admin = ":closed_lock_with_key:  **<a> administrator commands** \n\n";
            guest += "`[ help ]`  Returns bot data if paired with a command \n\n";

            for(var key in core) {
                if (core[key].summary) { // formats cmd, adds to string
                    var cmd = core[key].command[0] || key.toLowerCase();
                    var braces = core[key].command[0] ? "`[ "+cmd+" ]`" : "`{ "+cmd+" }`";
                    var element = String.format("{0}  {1}\n\n", braces, core[key].summary);
    
                    switch (core[key].require) {
                        case "users" :
                            u += 1, users += element; 
                            break;
                        case "admin" :
                            a += 1, admin += element;
                            break;
                        default :
                            g += 1, guest += element;
                            break;
                    }
                }
            }

            // adds total number of commands
            guest = guest.replace("<g>", g);
            users = users.replace("<u>", u);
            admin = admin.replace("<a>", a);

            // fixes plural commands with singular number
            if(g < 2) guest = guest.replace("commands", "command");
            if(u < 2) users = users.replace("commands", "command");
            if(a < 2) admin = admin.replace("commands", "command");

            // generates user level + flavor text footer
            var AdminText = ["Too OP pls nerf.", "Am I behaving well?", "Glory be upon you."];
            var UsersText = ["Entries with { } don't use a command!", "Try combining help and a command!"];
            var GuestText = ["Uh oh, stranger danger!", "Entries with { } don't use a command!", "Try combining help and a command!"];

            switch(level) {

                case "admin" :
                    var flavor = RandomValue(AdminText);
                    level = String.format("an {0}! {1}", level, flavor);
                    break;

                case "whitelisted" :
                    var flavor = RandomValue(UsersText);
                    level = String.format("{0}. {1}", level, flavor);
                    break;

                default :
                    var flavor = RandomValue(GuestText);
                    level = String.format("a {0}. {1}", level, flavor);
                    break;
            }

            // combine everything generated to make embed
            embed.fields[0].value = guest + users + admin;
            embed.fields[0].value += String.format("( *You're {0}* )", level);

        } else { // command is specified, dump all info about it

            var i = 0, target = core[command.key];
            if(target.summary == false) return;

            var subject = command.word || Object.keys(command.more)[0].toLowerCase();
            embed.description = embed.description.replace("<header>", "Here's what I know about **" + subject + "**");
            embed.fields[0].name += target.summary || "No summary available!";
            if(target.picture) embed.thumbnail.url = target.picture;

            // generates commands row
            var commands = target.command ? "" : "n/a";
            embed.fields[0].value = String.format("**Commands**  `[ {0}", commands);

            if(!commands) target.command.forEach(function(c){
                i++, embed.fields[0].value += c;
                embed.fields[0].value += i != target.command.length ? ", " : " ]`";
            }); else embed.fields[0].value += " ]`";

            // generates options column
            i = 0, embed.fields[0].value += "\n\n**<i> options available**\n\n";

            for(var keys in target.options) {
                var options = target.options[keys].cmds.join(", ");
                embed.fields[0].value += String.format("    **{0}**  `[ {1} ]` \n", keys, options);
                embed.fields[0].value += String.format("    {0} \n\n", target.options[keys].desc);
                i++;
            }

            // generates account footer
            var privacy = "whitelisted";
            if(target.require == null) privacy = "guest";
            if(target.require == "admin") privacy = "admin";

            embed.fields[0].value += String.format("( *Requires {0} account. You're {1}!* )", privacy, level);      
        }

        var replace = [
            { "<i>" : i },
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
                else return "mutiny is an idiot and didnt set this up yet"; }},
            { "<username>" : bot.user.username },
        ]

        replace.forEach(function(r){
            var key = Object.keys(r);
            while(embed.fields[0].name.includes(key))
                embed.fields[0].name = embed.fields[0].name.replace(key, r[key]);
            
            while(embed.fields[0].value.includes(key))
                embed.fields[0].value = embed.fields[0].value.replace(key, r[key]);
        })
        
        return res;
    }

    // cleans string.split results
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

    // checks if robot was called
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

    // find user{} in JSON cache
    function GetUser(message) {
        var res = null;

        for (var u in Users) {
            u = Users[u];
            if(message.author.id == u.id) {
                res = u;
                break;
            }
        }

        return res;
    }
    
    // compare string[] for elements in source
    function IncludesElement(source, search) {
        if(typeof source != "string") return; // crashes pls go
        if(!Array.isArray(search)) return;    // ok arrays only
        var sentence = source.split(" ");
        var result = "";

        for(var item in search) {
            item = search[item];

            // if item has whitespace, check whole string
            if(item.includes(" ") && source.includes(item)) {
                result = item;
                break;

            } else {

                // else iterate for accuracy
                for(var words in sentence) {
                    words = sentence[words];
                    if(words.includes(item)) {
                        result = item;
                        break;
                    }
                }
            }
        }

        return result;
    }
    
    /**
     * Tries to find any commands in source message
     * Sorted into parts: key, options, help, lock
     * key, more, lock reqired, help cancels method
     */
    function GetCommand(message, summoned) {
        if(!summoned) return;

        // (cleaned) string[] gen from input
        var sentence = GetSentence(message);
        var cmdCache = []; // found commands
        var optCache = []; // found options
        
        var res = {
            key : "",
            word : "",
            lock : true,
            more : {},
        };

        // look for any commands
        for(var keys in core) {
            var task = core[keys];
            var cmds = task.command; // string[] of keywords
            var optn = task.options; // object with keywords

            for(var word in sentence) {
                word = sentence[word].toLowerCase();

                // if command is found, push to cache
                if(cmds && cmds.indexOf(word) != -1) {
                    cmdCache.push([keys, word]);
                } else if (word == keys.toLowerCase()) {
                    cmdCache.push([keys, word]);
                }

                // if task has options, lookup
                if(optn) for(var o in optn) {
                    var array = optn[o];
                    if(!Array.isArray(array)) // allows me to shorthand
                        array = array.cmds;   // remove if restructured

                    // if option is found, push cache
                    if (array.indexOf(word) != -1) {
                        if(!cmds) cmdCache.push([keys, word]);
                        optCache.push([keys, word, o]);
                    }
                }
            }
        }

        // determine res
        if (!res.key) {
            var c = -1; // command index cache
            var o = -1; // option index cache
            
            // finds index based on options
            if(cmdCache.length == 1) c = 0;
            for(var cmd in cmdCache) {
                // named cmd key, value pair
                var cmdKey = cmdCache[cmd][0];
                var cmdVal = cmdCache[cmd][1]

                for(var opt in optCache) {
                    // named opt key, value pair
                    var optKey = optCache[opt][0];
                    var optVal = optCache[opt][1];

                    // cmd && opt share key
                    if(cmdKey == optKey) {
                        c = c == -1 ? cmd : c; // don't overwrite twice
                        o = o == -1 ? opt : o; // ( see above comment )
                        break;
                    }
                }
            }
                    
            if (c != -1) { // set keys
                res.key = cmdCache[c][0];
                res.word = cmdCache[c][1];
            }

            if (o != -1) // set options
                res.more[optCache[o][2]] = optCache[o][1];
        }
        
        // checks for help requests
        var HelpCommands = ["help"];
        for (var help in HelpCommands) {
            help = HelpCommands[help];
            if(message.content.includes(help)) {
                if (res.key) { // [help] [warframe], [help] [nickname], etc - if(!res.key) ?
                    if (message.content.indexOf(help) < message.content.indexOf(res.word)) {
                        var help = GetHelp(res, message);
                        if (help) Speak(help, message);
                        return;
                    }
                } else { // only help (merge these two paths later)
                    res.key = "$DEFAULT";
                    var help = GetHelp(res, message);
                    if (help) Speak(help, message);
                    return;
                }
            }
        }

        if(!res.key) return;

        // gets .lock w/ permissions
        var user = GetUser(message);
        if(user && user.sudo) res.lock = false;
        else if(user && core[res.key].require != "admin") res.lock = false;
        else if(!core[res.key].require) res.lock = false;

        return res;
    }

    function UpdateWarframeJSON() { // return this
        axios.get('https://ws.warframestat.us/pc')
        .then(function(response){
            wf = response.data;
        });
    }

    bot.login(/* private key pls no steal */);
}
