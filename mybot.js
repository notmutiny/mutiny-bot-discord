// Hello! You are reading the public version of mutinybot.
// This document is kept scrubbed and edited (removing lots of things).
// If you need the full code feel free to contact me and I can send it.

exports.Start = function() {

    var fs = require('fs');
    var LogsFile = 'D:/Library/Projects/Coding/Discord/mutiny_bot/logs.txt';
    var UsersFile = 'D:/Library/Projects/Coding/Discord/mutiny_bot/saved_users.json';
    var Users = JSON.parse(fs.readFileSync(UsersFile));   // cache to avoid disk IO

    const ms = require('ms');
    const axios = require("axios");
    const iso8601 = require('iso8601');
    const Discord = require('discord.js');
    const bot = new Discord.Client();       

    const GoogleSearch = require('google-search');
    const search = new GoogleSearch({
        // key: private key pls no steal,
        // cx: private key pls no steal
    });

    // fast debug info
    var Debug = false;

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
    
    var Tasks = {

        Discord : {
            command : false,
            picture : "https://i.imgur.com/t6L06o0.png",
            summary : "Utilize features provided by discord.js",
            require : "users",
            options : {
                avatar : {
                    cmds : ["avatar", "picture"],
                    desc : "Gets the discord url for mentioned users avatar" },
                delete : {
                    cmds : ["delete", "delet"],
                    desc : "Deletes the previous comment from <username>" },
                listening : {
                    cmds : ["listen", "listening"],
                    desc : "Changes <username>s listening activity status"},
                playing : {
                    cmds : ["game", "play", "playing"],
                    desc : "Changes <username>s playing activity status"},
                nickname : {
                    cmds : ["nickname", "name"],
                    desc : "Changes <username>s nickname on this server"},
                uptime : {
                    cmds : ["uptime", "session"],
                    desc : "Responds <username>s current session uptime"},
                watching : {
                    cmds : ["watch", "watching"],
                    desc : "Changes <username>s watching activity status"}},
            response : {
                errNoUsers : [
                    "I also need to know whos <optn> to get", 
                    "how am I supposed to know whos <optn> im finding",
                    "you need to give me an account with that too"]},
            methods : function(command, message, task, option){
                var msg = message.content;
    
                switch(option) {
                    case "avatar" :
                        var user = message.mentions.users;
                        var urls = [];
                        var res;

                        user.forEach(function(u){
                            urls.push(u.avatarURL);
                        })

                        if (urls.length > 0) res = urls.join(" \n");
                        else res = RandomElement(task.response.errNoUsers);
                        res = res.replace("<optn>", option);
                        if (res) Speak(res, message);
                        break;

                    case "delete" :
                        var target = bot.user.lastMessage;
                        if (target == null)
                            WriteLog("Error: Cannot find message to delete");
                        else if (target.deletable) target.delete();
                        break;

                    case "uptime" :
                        var res = "I have been running for " + ms(bot.uptime);
                        if (res) Speak(res, message);
                        break;

                    case "listening" :
                    case "nickname" :
                    case "watching" :
                    case "playing" :
                        var task = command.more[option], result = "";
                        var i = msg.indexOf(task) + task.length + 1;
                        var result = msg.substring(i, msg.length);
                        
                        if (result) {
                            if (option == "playing") bot.user.setGame(result); // depreciation warning
                            if (option == "nickname") message.guild.members.get(bot.user.id).setNickname(result);
                            if (option == "listening") bot.user.setActivity(result, { type: "LISTENING" });
                            if (option == "watching") bot.user.setActivity(result, { type: "WATCHING" });
                        } break;
                }
            }
        },
    
        Faces : { // convert to generic responses
            command : false,     
            summary : false, 
            require : "users",
            options : {
                test : ["test"],
                angry : ["angry", "mad", "pissed", "reee"],
                happy : ["happy"],
                upset : ["sad", "cry", "cri"]},
            response : {
                angry : ["｡゜(｀Д´)゜｡","ヽ(｀Д´)ﾉ","ლಠ益ಠ)ლ", "(ノ°益°)ノ", "(つ◉益◉)つ","╯‵Д′)╯彡┻━┻ "], 
                happy : ["( ﾟヮﾟ)","(・∀・)","(╯✧▽✧)╯","◉­‿ ­◉ ","ʘ ‿  ʘ","(≧▽≦)","´ ▽ ` )ﾉ","(＾ｖ＾)","（⌒▽⌒）","(＾ω＾)","ヽ(ヅ)ノ","´･ᴗ･`","(^▽^)"],
                upset : ["（◞‸◟）","ಠ╭╮ಠ","ಡ_ಡ","ಥдಥ","(ಥ﹏ಥ)","(ಥ_ಥ)"],
    
                // these are unused until I find a use for them
                surprise : ["w(°ｏ°)w", "ヽ(°〇°)ﾉ", "Σ(O_O)", "Σ(°ロ°)", "(°ロ°) !"],
                confused : ["(-_-;)・・・"],

                // these are used elsewhere in code, do not remove
                embed : ["´ ▽ ` )ﾉ","ヾ(＾∇＾)","(´・ω・｀)","\_(:3」∠)\\\_", "(°ロ°) !"],
                locked : ["｡゜(｀Д´)゜｡","ლಠ益ಠ)ლ","(-_-;)・・・","\_(:3」∠)\\\_", "(°ロ°) !","w(°ｏ°)w","Σ(°ロ°)"]},
            methods : function(command, message, task, option){
                var sentence = GetSentence(message);
                var trigger = command.more[option];

                // ensures accuracy at the cost of whitespace
                if (sentence.indexOf(trigger) == -1) return;
                var res = RandomElement(task.response[option]);
                if (res) Speak(res, message);
            }
        },

        Logs : {
            command : ["logs", "log"],
            summary : "Show or configure <username>s saved logs",
            picture : "https://i.imgur.com/1NBOM2t.png",
            require : "admin",
            options : {
                clear : {
                    cmds : ["clear", "delete", "erase"],
                    desc : "Deletes all logs from <username>"},
                print : {
                    cmds : ["view", "post", "show", "history"],
                    desc : "Returns all available recent logs"}},
            response : {
                clear : [
                    "my logs have been cleared",
                    "my memory feels a little fuzzy now",
                    "I have forgotten everything I know",]},
            methods : function(command, message, task, option) {
                var charLimit = 1024; // discords message filter

                switch (option) {
                    case "clear" :
                        fs.writeFile(LogsFile, "", function(err) {
                            if(err) return console.log(err);
                            var response = RandomElement(Tasks.Logs.response.clear);
                            Speak(response, message);            
                        }); break;

                    case "print" :
                        fs.readFile(LogsFile, "utf8", function(err, data) {
                            if(err) return console.log(err);
                            var savedLogs = data.split("\n\n"); // gets saved logs
                            var resultLogs = [];                // our result logs
                            
                            // hotfix for logs saving empty element at end (\n\n)
                            savedLogs = savedLogs.slice(0, savedLogs.length - 1);

                            for (var i = savedLogs.length - 1; i > 0; i--) {
                                var length = resultLogs.join(" ").length; // total char count
                                var format = resultLogs.length * 4;       // \n\n formattings

                                // this block bolds date values
                                var item = "**" + savedLogs[i];
                                item = item.replace(": ", "**: ");

                                // this darkens new line
                                if(item.includes("\n")) {
                                    item = item.replace("\n", "\n`");
                                    item += "`";
                                }

                                // make sure we're not past the char limit
                                var total = length + format + item.length;
                                if (total >= charLimit) break;
                                else resultLogs.unshift(item);
                            }

                            // joins formatted logs
                            var count = resultLogs.length;          // cache return length
                            var string = resultLogs.join("\n\n");   // fully returned logs

                            // embed garbage to shorten the following code 
                            var res = GetEmbed(command), embed = res.embed;           
                            embed.description = "Here's my most recent activity" + embed.description;
                            embed.fields[0].name += "Displaying the last "+count+" of "+savedLogs.length+" logs";
                            embed.fields[0].value += string;     
                            if (res) Speak(res, message);
                        }); break;
                }
            }
        },
    
        Points : { // needs building
            command : ["points", "point"],
            picture : "https://i.imgur.com/ezJ3mda.png",
            summary : "Manage your collection of internet points",
            require : "users",
            options : {
                bet : {
                    cmds : ["?", "bet", "gamble", "wager", "flash"],
                    desc : "Throw money into a hole and win big time"},
                give : {
                    cmds : ["+", "add", "give", "donate", "throw", "slide"],
                    desc : "give target(s) a specified amount of points"},
                take : {
                    cmds : ["-", "del", "take", "steal", "mug", "del"],
                    desc : "Risk taking some points away from *target(s)*"},},            
            methods : function(command, message, task, option) {
                var target = message.mentions.users;
                return;           
            }
        },

        Search : { // needs cleaning, add more res
            command : ["search", "find", "google"],
            picture : "https://i.imgur.com/eNrBN6A.png",
            summary : "Returns requested internet search results",
            require : "users",
            options : {  
                "https://www.halopedia.org/" : {
                    cmds : ["halo"],
                    desc : "Halopedia, the Halo encyclopedia" },                        
                "http://warframe.wikia.com/" : {
                    cmds : ["wf", "warframe"],
                    desc : "WARFRAME Wiki - Fandom" },
                "http://www.wikipedia.org/" : {
                    cmds : ["wikipedia"],
                    desc : "Wikipedia, the free encyclopedia" },
                "http://www.youtube.com/" : {
                    cmds : ["yt", "youtube"],
                    desc : "Share your videos with the world."} },
            methods : function(command, message, task, option) {
                var optnWord = option ? command.more[option] : "";  // gets weburl trigger word
                var sentence = GetSentence(message);                // gets sentence for ez func
                var word = command.word;                            // sets command trigger word

                var i = message.content.search(word) + word.length + 1;
                if (sentence.indexOf(word) == sentence.indexOf(optnWord) - 1) // ex ["find"] ["halo"] dmr
                    i = i + optnWord.length + 1 > message.content.length ? i : i + optnWord.length + 1;
                    var term = message.content.slice(i, message.content.length);
                if(!term) return; // no search term was inputted

                search.build({
                    q: term, num: 1, siteSearch: option, 
                }, function(error, response) {

                    if(response.items) {
                        var res = GetEmbed(command), embed = res.embed;
        
                        // generate nice looking result title
                        var trash = ["\|", " - "], cache = [];
        
                        trash.forEach(function(t) {
                            if(!response.items[0].title.includes(t)) return;
                            cache = response.items[0].title.split(t);
        
                            for(i = 0; i < cache.length; i++) cache[i] = cache[i].trim();
                        })

                        embed.fields[0].name += cache.length < 2 ? response.items[0].title : cache[0] + " - " + cache[1];
                        embed.description = "Here's what I found for **" + term + "**" + embed.description;
                        if(cache[1] == "") embed.fields[0].name = embed.fields[0].name.substring(0, embed.fields[0].name.length - 2);

                        // assigns search thumbnail to embed
                        if(response.items[0].pagemap && response.items[0].pagemap.cse_thumbnail)
                            embed.thumbnail.url = response.items[0].pagemap.cse_thumbnail[0].src;
        
                        // generates search description to embed
                        embed.fields[0].value = response.items[0].snippet;
                        while(embed.fields[0].value.includes("\n"))
                            embed.fields[0].value = embed.fields[0].value.replace("\n", "");
                        embed.fields[0].value += "\n\n" + response.items[0].link;

                        if (res) Speak(res, message);
                    }
                    
                    else if (!response.items)
                        Speak("I couldn't find any results for "+searchTerm, message); 

                    else if (response.error && response.error.errors)
                        response.error.errors.forEach(function(err){
                            WriteLog("Error: "+err.reason+". Search aborted!")
                        })
                })
            }
        },
    
        Users : { // needs cleaning
            command : ["user", "users"],
            picture : "https://i.imgur.com/xrHpWeX.png",
            summary : "Change <username>s whitelisted users",
            require : "admin",
            options : {
                save : {
                    cmds : ["add", "save", "listen"],
                    desc : "Saves target(s) to <username>s whitelist" },
                remove : {
                    cmds : ["remove", "delete"],
                    desc : "deletes target(s) from <username>s whitelist" },
                print : {
                    cmds : ["list", "print", "view", "show", "who"],
                    desc : "Returns the list of whitelisted user data" }},
            response : {
                errDelete : [
                    "but <u> is a not saved user",
                    "I can't find <u> in my users",
                    "can't do that, <u> isn't a user" ],
                errSave : [
                    "but <u> is already a user",
                    "<u> is already saved in my users",
                    "can't do that, <u> is already a user" ],
                success : [
                    "<u> was <w> my users" ]},
            methods : function(command, message, task, option) {
                var target = message.mentions.users;
                var exists, error = false, cache = [];

                switch(option) {   
                    case "save" :
                    case "remove" :
                        target.forEach(function(u) { // runs for each mention
                            var index = Users.findIndex(s => s["id"] == u.id);
                            exists = index > -1 ? true : false;
                            cache.push(u.username);

                            if (option == "save") {
                                if (exists) { error = true; return; } // dont add what is already there
                                Users.push({ "id" : u.id, "name" : u.username, "perm" : "user" });
                                fs.writeFile(UsersFile, JSON.stringify(Users), 'utf8', function(err){
                                    if(err) throw err;
                                });  
                            }
                            
                            else if (option == "remove") {
                                if (!exists) { error = true; return; } // dont remove whats not there
                                Users.splice(index, 1);
                                fs.writeFile(UsersFile, JSON.stringify(Users), 'utf8', function(err){
                                    if(err) throw err;
                                });
                            } 
                            
                        }); break; // break so we run code after switch

                    case "print" :
                        var res = GetEmbed(command), embed = res.embed; // use embed to list users
                        var str = Users.length > 1 ? "users" : "user";  // plural grammar replacer

                        embed.description = "Here's my saved users" + embed.description; // embed header
                        embed.fields[0].name += String.format("{0} whitelisted {1}", Users.length, str);              // embed title
                        embed.thumbnail.url = Tasks.Users.picture;                                                    // embed body

                        Users.forEach(function(u){ // generates each users information for embed
                            var member = message.guild.members.get(u.id) || ""; // guild members user obj
                            var hasMsg = member.lastMessage ? true : false;     // if user has posts here

                            bot.fetchUser(u.id).then(function(res){
                                var i = res.tag.indexOf("#");               // first use is snipping tags
                                var tag = res.tag.slice(i, res.tag.length); // second use is counting ifs

                                i = 0, embed.fields[0].value += String.format("\n\n<@{0}> {1}  ` [ {2} ]`", u.id, tag, u.perm);
                                
                                if (member) { // if user is a guild member
                                    var timestamp = member.joinedTimestamp;
                                    var date = new Date(timestamp);
                                    date = iso8601.fromDate(date);

                                    i++, embed.fields[0].value +="\n*Server joined: "+date+"*"
                                }

                                if (hasMsg) { // message is cached
                                    var last = member.lastMessage;
                                    last = last.createdTimestamp;
                                    var date = new Date(last);
                                    date = iso8601.fromDate(date);

                                    i++, embed.fields[0].value +="\n*Last message: "+date+"*"
                                }

                                if (i == 0) embed.fields[0].value +="\n*No information to return for this user*";
                            })
                        })

                        if(res) Speak(res, message);
                        return; // return, all done

                    default: 
                        return; // dont run next code
                }
                
                // generate action response
                if(cache.length == 0) return; // no blank messages pls
                var res = RandomElement(Tasks.Users.response.success);

                if (error) { // thorw error, saving duplicate or removing non existent entry
                    WriteLog("Error: could not "+option+" "+cache.join(", ")+" @ whitelist");
                    if (option == "save") res = RandomElement(Tasks.Users.response.errSave);
                    if (option == "remove") res = RandomElement(Tasks.Users.response.errDelete);
                }
                
                // replace placeholders to correct grammar errors
                var what = option == "save" ? "saved to" : "removed from";
                if (res.includes("<w>")) res = res.replace("<w>", what);  
                if (res.includes("<u>")) res = res.replace("<u>", cache.join(", "));
                if (cache.length > 1) { // make things plural, robot isnt illiterate
                    if (res.includes("is")) res = res.replace("is", "are");
                    if (res.includes(" a ")) res = res.replace(" a ", " ");
                    if (res.includes("was")) res = res.replace("was", "were");
                    if (res.includes("user")) res = res.replace("user", "users");
                } if (res) Speak(res, message);
            }
        },
    
        Warframe : { // switch to one loop, handle with var
            command : ["wf", "warframe"],
            picture : "https://i.imgur.com/wiwwzmZ.png",
            summary : "Returns the latest Warframe worldstate data",
            options : {
                alerts :  {
                    cmds : ["alerts", "alert", "reward"],
                    desc : "<wf_a> mission alerts available" },
                deals : {
                    cmds : ["deals", "deal", "darvo"],
                    desc : "<wf_d> daily deal from Darvo" },
                fissures : {
                    cmds : ["fissures", "fissure"],
                    desc : "<wf_f> void fissure missions" },
                invasions : {
                    cmds : ["invasions", "invasion"],
                    desc : "<wf_i> ongoing faction invasions" },
                trader : {
                    cmds : ["trader", "baro"],
                    desc : "<wf_v>" }},
            methods : function(command, message, task, option) {
                var res = GetEmbed(command), embed = res.embed;
                var i = 0;

                switch (option) {
                    case "trader" : 
                        if(!wf.voidTrader.active) {
                            Speak("the void trader returns in "+wf.voidTrader.startString, message);
                            break; // expand this later
                        }

                    case "alerts" :
                        embed.description = "Here's the current mission alerts" + embed.description;
                        wf.alerts.forEach(function(a){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", a.mission.reward.asString, a.eta);
                            embed.fields[0].value += String.format("{0}, {1} \n\n", a.mission.type, a.mission.node);
                            i++;
                        }); break;

                    case "deals" :
                        embed.description = "Here's the current daily deals" + embed.description;
                        wf.dailyDeals.forEach(function(d){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", d.item, d.eta);
                            embed.fields[0].value += String.format("{0} sold at {1}% off!  *~~{2}~~*  {3} platinum \n\n", d.sold, d.discount, d.originalPrice, d.salePrice);
                            i++;
                        }); break;

                    case "fissures" :
                        embed.description = "Here's the current void fissures" + embed.description;
                        wf.fissures.forEach(function(f){
                            embed.fields[0].value += String.format("**{0}**  `{1}` \n", f.tier, f.eta);
                            embed.fields[0].value += String.format("{0}, {1} \n\n", f.missionType, f.node);
                            i++;
                        }); break;

                    case "invasions" :
                        embed.description = "Here's the current faction invasions" + embed.description;
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
                        return; // dont run code below
                }

                if(i == 1) option = option.slice(0, option.length - 1);
                embed.fields[0].name += i + " " + option.toLowerCase() + " available";
                embed.fields[0].value += "*Stored on "+wf.timestamp+"*";
                if(res) Speak(res, message);
            }
        },
    }

    // discord events //
    bot.on("ready", () => {
        var log = String.format("nm started w/ {0} users in {1} channels of {2} guilds.", bot.users.size, bot.channels.size, bot.guilds.size);
        WriteLog(log);
    });

    bot.on("message", (message) => {
        if (message.author.bot) return; // robots pls go
        var summoned = GetSummon(message) ? true : null;
        var command = GetCommand(message, summoned);

        if (command)
            Think(command, message);

        if(Debug) {
            if(command)
                console.log(command);
        }
    })

    // makes not mutiny copy mutinys presence
    bot.on("presenceUpdate", (guildmem) => {
        if(guildmem.id != '127655681754005504') return;
        var newStatus = guildmem.user.presence.status;
        bot.user.setPresence({ status: newStatus });
    });

    // makes not mutiny copy mutinys reactions
    bot.on("messageReactionAdd", (messageReaction, user) => { 
        if(user.id != '127655681754005504') return;
        messageReaction.message.react(messageReaction.emoji);
    });
    
    bot.on("messageReactionRemove", (messageReaction, user) => {  
        if(user.id != '127655681754005504') return;
        messageReaction.remove(bot.user.id);
    });

    // <-- convenience methods --> //

    // automates callback methoding
    function Think(command, message) {
        var task = Tasks[command.key]; // callback shortcut
        var optn = Object.keys(command.more)[0] || ""; // ^
        if (command.lock) {
            var res = RandomElement(Tasks.Faces.response.locked);
            if (res) Speak(res, message); // Σ(°ロ°)
        } else Tasks[command.key].methods(command, message, task, optn);

        // logs the command and any info (useful for debug)
        var log = "\nmessage.content: " + message.content;
        var cmd = Object.keys(command.more)[0] || "";
        cmd = (cmd ? cmd + " " : "") + command.key;
        cmd = cmd.toLowerCase();

        if (!command.lock) log = String.format("{0} sent a command for {1}.{2}", message.author, cmd, log);
        else log = String.format("Locked: {0} tried using {1}.{2}", message.author, cmd, log);
        if (log) WriteLog(log);
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
    function RandomElement(array) {
        if (!Array.isArray(array)) return;
        return array[Random(0, array.length)];
    }

    // saves logs to logs.txt
    function WriteLog(string) {
        var log = String.format("{0} {1}\n\n", GetTimestamp(), string);
        console.log(log); // want to know in runtime too
        fs.appendFile(LogsFile, log, function(err) { 
            if(err) return console.log(err);
        }); 
    }

    // compare string[] for elements in source
    function IncludesElement(source, search) {
        if(typeof source != "string") return; // string only ok
        if(!Array.isArray(search)) return;    // !arrays pls go
        var sentence = source.split(" ");
        var result = "";

        for(var item in search) {
            item = search[item];

            // if item has whitespace, check whole string
            if(item.includes(" ") && source.includes(item)) {
                return item;
            }
            
            // else iterate items for accuracy
            else for(var words in sentence) {
                words = sentence[words];
                if(words.includes(item)) {
                    return item;
                }
            }
        }

        return;
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

    /**
     * Tries to find any commands in source message
     * Sorted parts: key, word, options, help, lock
     * key, more, lock reqired, help cancels method
     */
    function GetCommand(message, summoned) {
        if(!summoned) return; // saves memory

        // (cleaned) string[] gen from input
        var sentence = GetSentence(message);
        var cmdCache = []; // found commands
        var optCache = []; // found options
        
        var res = {
            key : "",    // key for Tasks
            word : "",   // trigger word
            lock : true, // allows usage
            more : {},   // opt triggers
        };

        // look for any commands
        for(var keys in Tasks) {
            var task = Tasks[keys];
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
                   
            if (c != -1) { // assign res
                res.key = cmdCache[c][0];
                res.word = cmdCache[c][1];
            }

            if (o != -1) // (also assigns res)
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
                } else { // no cmd, help only (merge these two paths later)
                    res.key = "$DEFAULT";
                    var help = GetHelp(res, message);
                    if (help) Speak(help, message);
                    return;
                }
            }
        }

        if(!res.key) return; // cant find any commands

        // get .lock w/ permissions
        var user = GetUser(message);
        if(user && user.perm == "admin") res.lock = false;
        else if(user && Tasks[res.key].require != "admin") res.lock = false;
        else if(!Tasks[res.key].require) res.lock = false;

        return res; // command is success!
    }

    // generates default values
    function GetEmbed(command) {
        var target = command.key != "$DEFAULT" ? command.key : "Faces"; 
        // this is hack pls dont do this ("$DEFAULT" isnt a key in Tasks)

        return {embed: {
            description : "  " + RandomElement(Tasks.Faces.response.embed),
            // modify description in other scope with value + .description
            color: 10249740,
            footer : {
                icon_url : "https://avatars3.githubusercontent.com/u/24806578",//https://i.imgur.com/biOZ0au.png", //"https://i.imgur.com/yDTxJHk.png",//https://avatars3.githubusercontent.com/u/24806578",
                text : "https://github.com/notmutiny/" },
            thumbnail : {
            url : Tasks[target].picture || "https://cdn.discordapp.com/avatars/318244733975658496/166fd4bc92322ed291c8515f5f2c6ff2.png" },
            // "author": {
            //     "name": "author name",
            //     "url": "https://discordapp.com",
            //     "icon_url": "https://i.imgur.com/biOZ0au.png"
            // },
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

        // creates user authentication string
        var level = user ? user.perm : "guest";

        if(command.key == "$DEFAULT") { // if no command is supplied
            embed.description = "Here's my commands overview" + embed.description;
            embed.fields[0].name = ":black_small_square:  Made with https://discord.js.org/ !";
            
            // generate commands and respective parent fields
            var g = 1, guest = ":unlock:  **<g> guest commands** \n\n";
            var u = 0, users = ":lock:  **<u> saved user commands** \n\n";
            var a = 0, admin = ":closed_lock_with_key:  **<a> administrator commands** \n\n";
            guest += "`[ help ]`  Returns bot data if paired with a command \n\n";

            for(var key in Tasks) {
                if (Tasks[key].summary) { // formats cmd, adds to string
                    var cmd = Tasks[key].command[0] || key.toLowerCase();                    // cmd displayed in braces
                    var braces = Tasks[key].command[0] ? "`[ "+cmd+" ]`" : "`{ "+cmd+" }`";  // braces used around cmds
                    var element = String.format("{0}  {1}\n\n", braces, Tasks[key].summary); // string to push to cache
    
                    // increment n, push command
                    var auth = Tasks[key].require;
                    if (auth == "admin") a += 1, admin += element;
                    else if (auth == "users") u += 1, users += element; 
                    else g += 1, guest += element;
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
            var flavorAdmin = ["Too OP pls nerf.", "Am I behaving well?", "Glory be upon you."];
            var flavorUser  = ["Items in { } don't use a command!", "Try combining help and a command!"];
            var flavorGuest = ["Uh oh, stranger danger!", "Items in { } don't use a command!", "Try combining help and a command!"];
            var flavorText = "";

            if (level == "admin") flavorText = RandomElement(flavorAdmin);
            if (level == "user")  flavorText = RandomElement(flavorUser);
            if (level == "guest") flavorText = RandomElement(flavorGuest);

            // combine everything generated to make embed
            embed.fields[0].value = guest + users + admin;

            // make footer w/ permissions and flavor text
            var footer = level == "admin" ? "an" : "a"; // sneaky grammar, less waste
            footer = String.format("You're {0} {1}! {2}", footer, level, flavorText);

        } else { // command is specified, get all info about it

            var i = 0, target = Tasks[command.key];
            if(target.summary == false) return;

            // assigns embed properties
            var subject = command.word || Object.keys(command.more)[0].toLowerCase();
            embed.description = "Here's my knowledge about **" + subject + "**" + embed.description;
            embed.fields[0].name += target.summary || "No summary available!";
            if(target.picture) embed.thumbnail.url = target.picture;

            // generates commands row
            var commands = target.command ? "" : "n/a"; // no commands insert string
            embed.fields[0].value = String.format("**Commands**  `[ {0}", commands);

            if(!commands) target.command.forEach(function(c){
                i++, embed.fields[0].value += c;
                embed.fields[0].value += i != target.command.length ? ", " : " ]`";
            }); else embed.fields[0].value += " ]`"; // skip it, no commands to add

            // generates options column
            i = 0, embed.fields[0].value += "\n\n**<i> options available**\n\n";

            // pushes options to cache
            var cache = [], item = "";

            for(var keys in target.options) {
                var options = target.options[keys].cmds.join(", "); // gets keywords for task
                var task = keys.includes("http") ? keys : ""; // fixes urls broken formatting
                if (!task) task = keys.charAt(0).toUpperCase() + keys.substring(1, keys.length);

                item = String.format("    **{0}**  `[ {1} ]` \n", task, options);
                item += String.format("    {0} \n\n", target.options[keys].desc);
                i++, cache.push(item);
            }

            cache.sort(); // sorts alphabetically
            embed.fields[0].value += cache.join("");

            // gets level of user
            var privacy = "User", lock = "Locked";
            if(target.require == null) privacy = "Guest";
            if(target.require == "admin") privacy = "Admin";

            // gets locked status
            if(user && user.perm == "admin") lock = "Unlocked";
            else if(user && Tasks[command.key].require != "admin") lock = "Unlocked";
            else if(!Tasks[command.key].require) lock = "Unlocked";

            var footer = String.format("{0} account is required. {1}!", privacy, lock);    

        } // <-- shared code below this ! //

        // adds uniquely generated footer
        embed.fields[0].value += "( *" + footer + "* )";

        // items to swap
        var replace = [
            { "<i>" : i },
            { "<wf_a>" : wf.alerts.length },
            { "<wf_d>" : wf.dailyDeals.length },
            { "<wf_f>" : wf.fissures.length },
            { "<wf_i>" : function() {
                var index = 0;
                wf.invasions.forEach(function(i){
                    if(!i.completed) index++;
                }); return index; }},
            { "<wf_v>" : function() {
                if(!wf.voidTrader.active) return "The void trader returns in " + wf.voidTrader.startString;
                else return "mutiny is an idiot and didnt set this up yet"; }},
            { "<username>" : bot.user.username },
        ]

        // code utilizing above array
        replace.forEach(function(r) {
            var key = Object.keys(r);
            while(embed.fields[0].name.includes(key)) // fixes title placeholders
                embed.fields[0].name = embed.fields[0].name.replace(key, r[key]);
            while(embed.fields[0].value.includes(key)) // fixes desc placeholders
                embed.fields[0].value = embed.fields[0].value.replace(key, r[key]);
        })
        
        return res;
    }

    // cleans string.split results
    function GetSentence(message) {
        var del = [".", "!", "?"];
        var raw = message.content.split(" ");
        var res = [];
    
        for (i = 0; i < raw.length; i++)
            if (raw[i] != " " && raw[i] != "") {
                var item = raw[i];
    
                del.forEach(function(e){
                    while (item.substring(item.length-1,item.length) == e)
                        item = item.slice(0,item.length - 1);
                })
    
                res.push(item);
            }
    
        return res;
    }

    // checks if robot was called
    function GetSummon(message) {
        var auth = GetUser(message) || "guest"; // JSON object saved user
        if (auth != "guest") auth = auth.perm;  // author authentications
        var sentence = GetSentence(message);    // more accurate indexing
        var found = false;                      // stops the search loops
        
        for(var perms in Names){                // perms : "admin"
            var array = Names[perms];           // array : ["bot"]

            for(var words in array) {
                words = array[words];

                if (words.includes(" ") && message.content.includes(words)) found = true; // search source message if whitespace
                else if (sentence.indexOf(words) != -1) found = true;                     // else check [] index (more accurate)

                if(found) {
                    if(auth == "admin") return true;                         // admin can use anything
                    else if(perms == "guest") return true;                   // if specified for guest
                    else if(auth == "user" && perms != "admin") return true; // no admin lvl for users
                    else found = false;                                      // user does not meet req
                }
            }
        }

        return false; // no summon
    }

    function GetTimestamp() {
        var time = new Date();
        var year = time.getFullYear();  // current year
        var month = time.getMonth();    // current month
        var date = time.getDate();      // current day
        var hour = time.getHours();     // current hour
        hour = hour < 10 ? "0" + hour : hour;
        var min = time.getMinutes();    // current minute
        min = min < 10 ? "0" + min : min;
        
        return String.format("{0} {1}/{2}, {3}:{4}:", year, month, date, hour, min);
    }

    // find user{} in JSON cache
    function GetUser(message) {
        for (var u in Users) {
            u = Users[u];
            if(message.author.id == u.id) return u;
        } return;
    }

    function UpdateWarframeJSON() { // return this
        axios.get('https://ws.warframestat.us/pc')
        .then(function(response){
            wf = response.data;
        });
    }

    bot.login(/*private key pls no steal*/);
}
