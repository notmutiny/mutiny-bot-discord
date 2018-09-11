// keywords users can send to summon the robot
let summons = ["nm", "<@!318244733975658496>"],
    avatars = [ // thumbnails representing not mutiny
        "https://i.imgur.com/iqYZUKk.png", // default
        "https://i.imgur.com/hRi8aBp.png", // angry
        "https://i.imgur.com/KDa3nG0.png", // closed
        "https://i.imgur.com/jvPU6pT.png", // happy
        "https://i.imgur.com/RqS9KN4.png", // tired
        "https://i.imgur.com/upB6PcK.png", // worried
    ],

    errors = {
        account: { // command is locked
            main: function() { return ["｡゜(｀Д´)゜｡", "ლಠ益ಠ)ლ", "(-_-;)・・・", "w(°ｏ°)w"] },
        },
        mention: { // command needs user menion
            main: function(request) { return ["mention a user with " + (request.argument ? request.argument.command : request.command)]; },
            end: ["or I won't know who you mean", "or I won't be able to help", "or I can't do anything"]
        }
    };

module.exports = function() {
    // return embed with preconfigured template data
    module.embed = function(header, title, value, picture) {
        let ascii = ["´ ▽ ` )ﾉ","ヾ(＾∇＾)","(´・ω・｀)","\_(:3」∠)\\\_", "(°ロ°) !"],
            emoji = ":small_orange_diamond:";

        let pfp = "https://i.imgur.com/iqYZUKk.png";
        // 33% chance to show unique embedded avatar 
        if (module.random(0, 3) == 0) {
            avatars.slice(0, 1); // remove default image
            pfp = module.randomElement(avatars);
        }

        return { embed: {
            description: header + "   " + module.randomElement(ascii),
            color: 10249740,
            footer: {
                icon_url: "https://i.imgur.com/biOZ0au.png",
                text: "https://github.com/notmutiny/" },
            thumbnail: {
                url: picture || pfp },
            fields: [
                { // use discords empty text if nones provided
                    name: title ? emoji + "  " + title : "_ _",
                    value: value ? value : "_ _",
                },
            ]
        }}
    };

    // generate error for unsuccessful request
    module.error = function(request, message) {
        let response = module.randomElement(errors[request.error].main(request)) + (errors[request.error].end ? " " + module.randomElement(errors[request.error].end) : "");
        // pull and merge responses from errors object using RNG elements, making messages more fluid

        if (response) // send error message 
            module.speak(response, message);
        else // function is broken burn it down
            console.log("Error: error() could not generate error response");
    }

    // return detected requirements for command
    module.getRequirements = function(object) {
        if (!object || !object.require) return null;
        
        let result = {};
        for (let r in object.require) {
            result[r] = object.require[r];
        }

        return result;
    };
    
    // returns string "online", "away", "dnd"
    module.getUserStatus = function(id, bot) {
        return new Promise(function(resolve, reject) {
            bot.fetchUser(id, false).then(function(user) {
                resolve(user.presence.status);
            });
        });
    };

    // returns random number
    module.random = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };
    
    // returns random array element
    module.randomElement = function(array) {
        if (!Array.isArray(array)) return;
        if (array.length == 0) return [];
        return array[module.random(0, array.length)];
    };
    
    // return script commands found in message
    module.request = function(message, scripts, prefs) {
        let account = getUserLevel(message.author, prefs),  // user level associated with bot use
            sentence = cleanSentence(message),              // cleaned message for better accuracy
            detections = [];                                // detected commands in input message

        for (let key in scripts) {
            let script = scripts[key];

            // return any keywords found within sentence
            let command = findCommand(sentence, script);
            let argument = findArgument(sentence, script);

            if (command || argument) {
                detections.push({
                    cache: { // cache for private use, compare and determine which query to return
                        index: (command ? message.content.indexOf(command) : message.content.indexOf(argument.command)),
                        requirements: getRequirements(script, argument),
                    },  

                    query: {
                        key: key,
                        command: command,
                        argument: argument,
                        author: { account: account }, 
                        success: false,               
                        error: "pending"        
                    }                 
                });

                // check if request meets all command requirements
                let detection = detections[detections.length - 1];
                let permission = checkRequirements(detection, message);

                // push results of requirement check to query
                detection.query.success = permission.success;
                detection.query.error = permission.error;
            }
        }

        // give me request detection or get out
        if (detections.length < 1) return null;
    

        // -- TEMPORARY LAND OF SPAGHETTI CODE -- //

        // determine best command 
        let result = detections[0];

        detections.forEach(function(detection) {
            // cache and compare previous result
            let cache = null; 

            // prioritize queries that appear first in message
            if (detection.cache.index < result.cache.index) {
                if (detection.query.success || !result.query.success) 
                    cache = detection;
            }
            
            // prioritize successful queries over any unsuccessful
            if (detection.query.success && !result.query.success) {
                if (detection.query.command || !result.query.command)
                    cache = detection;
            }
            
            // prioritize requests with specified commands
            if (detection.query.command && !result.query.command) {
                cache = detection;
            }
                        
            if (cache) result = cache;
        })

        // -- END TEMPORARY LAND OF SPAGHETTI CODE -- //

        return result.query;
    };

    // sends channel messages
    module.speak = function(response, message) {
        if (!response) { // make sure response contents aren't missing
            console.log("Error: speak() cannot send an empty message");
            return;
        } 

        let result = response;
        // allow string or array input
        if (Array.isArray(response)) {
            if (response.length == 0) return; // double checking
            else result = module.randomElement(response);
        }

        message.channel.startTyping();
        // "I am not a robot" - robot
        setTimeout(function() {
            message.channel.stopTyping();
            message.channel.send(result);
        }, 250 + Math.random() * 750);
    };

    // check if a user called bot
    module.summoned = function(message) {
        if (message.author.bot) return false;
        // bots need to stop spamming my bot

        let sentence = message.content.split(" "),
            cache = { summon: false, index: -1 };

        // get first instance of summoning
        summons.forEach(function(summon) {
            let index = sentence.indexOf(summon);

            if (index > -1) { // ensures first summon, not last
                if (cache.index == -1 || index < cache.index) {
                    cache.summon = summon; // cache returned value
                    cache.index = index; // cache index comparison
                }
            }
        });

        // return nm / false
        return cache.summon;
    };

    return module;
};

// check getRequirements result success or error
function checkRequirements(detection, message) {
    let requirements = detection.cache.requirements,
        account = detection.query.author.account,
        command = detection.query.command;

    let result = { success: true, error: "" };
    // detections returned in ascending order!

    for (let r in requirements) {
        // request required account level is greater than author
        if (r == "account" && account < requirements.account) {
            result = { success: false, error: r }
            break;
        }

        // request did not send command
        if (r == "command" && !command) {
            result = { success: false, error: r }
            break;
        }

        // request did not send mention
        if (r == "mention") {
            let total = 0; // stupid collection data type
            message.mentions.users.forEach(function(u) {
                total++; // can't length gotta increment
            });
            if (total == 0) { // ugly code is ugly >:(
                result = { success: false, error: r }
                break;
            }
        } 
    }

    return result;
}

// sanitizes message into string[]
function cleanSentence(message) {
    let remove = [".", ",", "!", "?"],
        result = [];

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
    for (let c in object.commands) {
        // index each command in sentence
        let command = object.commands[c];

        if (sentence.indexOf(command) > -1)
            return command;
    }

    return null;
}

// scan string[] for arguments from object
function findArgument(sentence, object) {
    for (let a in object.arguments) {
        let argument = object.arguments[a];
        let command = findCommand(sentence, argument);

        if (command)
            return {
                key: a,
                command: command
            }
    }

    return null;
}

// merge command and argument requirements
function getRequirements(script, argument) {
    let requirements = {};

    if (script.require) 
        // check command requirements
        for (let r in script.require) {
            let requirement = script.require[r];
            if (requirement && !requirements[r])
                requirements[r] = requirement;
        }
    
    if (argument && script.arguments[argument.key].require)
        // check argument requirements, overwrite lesser values
        for (let r in script.arguments[argument.key].require) {
            let requirement = script.arguments[argument.key].require[r];

            if (requirement) {
                if (requirements[r]) {
                    if (requirement > requirements[r])
                        // overwrite lesser requirement
                        requirements[r] = requirement;
                } else requirements[r] = requirement;
            }
        }

    return requirements;
}

// returns saved users level
function getUserLevel(author, prefs) {
    for (let id in prefs.users) {
        if (author.id == id) {
            // 1 = user, 2 = admin
            return prefs.users[id];
        }
    }
    
    return 0; // 0 = guest
};
