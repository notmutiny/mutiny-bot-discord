// keywords users can send to summon the robot
var summons = ["nm", "<@!318244733975658496>"];

module.exports = {

    // return embed with preconfigured template data
    embed: function(header, title, value, picture) {
        var ascii = ["´ ▽ ` )ﾉ","ヾ(＾∇＾)","(´・ω・｀)","\_(:3」∠)\\\_", "(°ロ°) !"],
            emoji = ":small_orange_diamond:";

        return { embed: {
            description: header + "   " + module.exports.randomElement(ascii),
            color: 10249740,
            footer: {
                icon_url: "https://i.imgur.com/biOZ0au.png",
                text: "https://github.com/notmutiny/" },
            thumbnail: {
                url: picture || "https://cdn.discordapp.com/avatars/318244733975658496/166fd4bc92322ed291c8515f5f2c6ff2.png" },
            fields: [
                {
                    name: title ? emoji + "  " + title : "_ _",
                    value: value ? value : "_ _",
                },
            ]
        }}
    },

    // return any detected requirements
    getRequirements: function(object) {
        if (!object || !object.require) return null;
        return {
            account: object.require.account || 0,
            mention: object.require.mention || false,
            textInput: object.require.textInput || false,
        }
    },
    
    // returns "online", "away", "dnd"
    getUserStatus: function(id, bot) {
        return new Promise(function(resolve, reject) {
            bot.fetchUser(id, false).then(function(user) {
                resolve(user.presence.status);
            });
        });
    },

    // returns random number
    random: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    
    // returns random array element
    randomElement: function(array) {
        if (!Array.isArray(array)) return;
        return array[module.exports.random(0, array.length)];
    },
    
    // return script commands found in message
    request: function(message, scripts, prefs) {
        var account = scripts.auth.level(message.author, prefs),    // user level associated with bot use
            sentence = cleanSentence(message),                      // cleaned message for better accuracy
            detections = [];                                        // detected commands in input message

        for (var key in scripts) {
            var script = scripts[key];

            // return any keywords found within sentence
            var command = findCommand(sentence, script);
            var argument = findArgument(sentence, script);

            if (command || argument) {
                // get required account level for command
                var commandRequirement = script.require ? 
                    (script.require.account || 0) : 0;

                var argumentRequirement = argument ?
                    (argument.require ? argument.require.account : 0) : 0;

                var requirement = // use the highest account requirement for overall request permissions
                    commandRequirement > argumentRequirement ? commandRequirement : argumentRequirement;

                detections.push({
                    key: key,
                    index: (command ? message.content.indexOf(command) : message.content.indexOf(argument.command)),
                    command: command,
                    argument: argument,
                    account: account,
                    unlocked: scripts.auth.unlocked(account, requirement),
                    require: module.exports.getRequirements(script),
                });
            }
        }

        // give me request detection or get out
        if (detections.length < 1) return null;
        
        // -- TEMPORARY LAND OF SPAGHETTI CODE -- //

        var cache = { result: null, help: -1 };

        // get best command from the detected []        
        detections.forEach(function(detection) {
            if (detection.key == "help")
                cache.help = detection.index;
                // check for any help calls
            
            // TODO: prioritize commands with actual command calls (over args)
            else if (!cache.result || (detection.index < cache.result.index))
                cache.result = detection; // prioritize first input command           
        })

        // help is called, must be before any commands (1024 is char limit to replace lack of cache index)
        if (cache.help != -1 && cache.help < (cache.result ? cache.result.index : 1024)) {
            var request = cache.result ? cache.result : detections[0];
            var argument = (cache.result ? (cache.result.argument ? cache.result.argument.key : null) : null);
            scripts.help.function(request, argument, message, scripts); // boy do I love me some ternaries
            return null; // help is the request, dont queue a second request
        }

        // -- END TEMPORARY LAND OF SPAGHETTI CODE -- //

        
        return cache.result;
    },

    // sends channel messages
    speak(response, message) {
        var result = response;
        if (Array.isArray(response)) {
            if (response.length == 0) return;
            else result = module.exports.randomElement(response);
        }

        message.channel.startTyping();
        setTimeout(function() {
            message.channel.stopTyping();
            message.channel.send(result);
        }, 250 + Math.random() * 750);
    },

    // check if a user called bot
    summoned: function(message) {
        var sentence = message.content.split(" "),
            cache = { summon: false, index: -1 };

        summons.forEach(function(summon) {
            var index = sentence.indexOf(summon);

            if (index > -1) { // ensures first summon, not last
                if (cache.index == -1 || index < cache.index) {
                    cache.summon = summon;
                    cache.index = index;
                }
            }
        });

        return cache.summon;
    },
};

// sanitizes message into string[]
function cleanSentence(message) {
    var remove = [".", "!", "?"];
    var result = [];

    message.content.split(" ").forEach(function(word) {
        if (word.length > 0 && word != " ") {

            remove.forEach(function(r) { // delete any chars in remove[]
                while(word.substring(word.length - 1, word.length) == r)
                    word = word.slice(0, word.length - 1);
            });

            result.push(word);
        }
    });

    return result;
}

// scan string[] for commands from object
function findCommand(sentence, object) {
    for (var c in object.commands) {
        // index each command in sentence
        var command = object.commands[c];

        if (sentence.indexOf(command) > -1)
            return command;
    }

    return null;
}

// scan string[] for arguments from object
function findArgument(sentence, object) {
    for (var a in object.arguments) {
        var argument = object.arguments[a];
        var command = findCommand(sentence, argument);

        if (command)
            return {
                key: a,
                command: command,
                require: module.exports.getRequirements(argument)
            }
    }

    return null;
}