var footer = { 
    0: {
        level: "You're a guest.",
        fluff: ["Some features are restricted!", "Uh oh, stranger danger!", "Try combining help with a command!"]},
    1: {
        level: "You're a user!",
        fluff: ["Most features are unlocked!", "Try combining help with a command!"]},
    2: { 
        level: "You're an admin!",
        fluff: ["Am I behaving well?", "Glory be upon you.", "Too OP pls nerf.", "All features are unlocked!"]
    },
}

var requireStrings = {
    mention: "user mention",
    textInput: "text input"
}

module.exports = {
    commands: ["help"],
    summary: function(nm) {
        return "Get assistance with " + nm.bot.user.username + "'s commands";
    },

    function: async function(request, argument, message, nm) {
        // embed template data for result discord message
        var header = "Here's an overview of my commands",
            title = "Made with the https://discord.js.org/ library",
            value = "", thumbnail = nm[request.key].picture;
        
        if (request.key == "help") { // generate default help message
            value = await generateCategoryDisplay(request, nm) + 
                "\n\n**Did you know?**\n" +
                ". . . You can get my attention with `nm` or <@318244733975658496>\n" +
                ". . . You can lookup commands by typing ` help ` before them\n" +
                ". . . You can use arguments with commands or by themselves\n\n";
        } else {
            // replace embed data with specified command data
            header = "Here's what I know about **" + (request.command ? request.command : request.argument.command) + "**";          
            title = await getSummary(nm[request.key], nm);
            value = "**Commands** : " + getCommands(nm[request.key]) + "\n\n" +
                    "**Examples** : " + generateExampleCommands(request.key, nm) + "\n\n";
            
            var requirements = generateRequirements(nm[request.key], nm, true);
            if (requirements) value += "**Requires** : " + requirements + "\n\n";
            value += await generateArgumentDisplay(request, nm);
        } 

        // generate footer message with users stored level and additional flavor text then amend it to embedded value
        value += "**" + footer[request.account].level + "** " + nm.core.randomElement(footer[request.account].fluff);
        var embed = nm.core.embed(header, title, value, thumbnail);        
        nm.core.speak(embed, message);
    },
};


// -- get functions -- //

function getCommands(object) {
    if (object.commands) return "`" + object.commands.join("`, `") + "`";
    else return "n/a";
}

async function getSummary(object, nm) {
    if (object.summary) {
        if (typeof object.summary == "string") return object.summary;
        else {
            var res = await object.summary(nm);
            return res;
        }
    } else return "No summary has been set for this command";
}

function getThumbnail(object) {
    if (object.picture) return object.picture;
    else return "";
}


// -- other functions -- //

// bot appearance is everything amiright
function capitalizeFirstLetter(string) {
    var words = string.split(" ");

    words.forEach(function(word, i) {
        words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    })

    return words.join(" ");
}

// get formatted string of each detected argument
async function generateArgumentDisplay(request, nm) {
    var commandRequirement = nm[request.key].require ?
        (nm[request.key].require.account || 0) : 0;
        // get required account level for command
    
    var commandLocked = commandRequirement > request.account,
        result = commandLocked ? ":lock: **This command category is locked**\n\n" : "";

    // total amount of arguments in commands category
    var amount = nm[request.key].arguments ?
        Object.keys(nm[request.key].arguments).length : 0;

    if (amount < 1) return result;

    var locked = [],    // all locked arguments
        unlocked = [];  // all unlocked arguments

    for (var a in nm[request.key].arguments) {
        var argument = nm[request.key].arguments[a], // reference to specific argument in request object
            summary = await getSummary(argument, nm),
            element = "**" + capitalizeFirstLetter(a) + "** : " + getCommands(argument) + "\n" + summary;

        var requirements = generateRequirements(argument, nm);
        if (requirements) element += "\n**Requires** : " + requirements;

        var argumentLocked =  // flag if argument is locked so the next code is legible
            (argument.require ? (argument.require.account || 0) : 0) > request.account;

        if (commandLocked || argumentLocked)
            locked.push(element)
        else 
            unlocked.push(element)
    }

    if (unlocked.length > 0) { // generate unlocked message followed by unlocked arguments
        result += ":unlock: **" + unlocked.length + " unlocked argument" + (unlocked.length > 1 ? "s" : "") + "**\n\n";
        result += unlocked.join("\n\n") + "\n\n";
    }

    if (locked.length > 0) { // generate locked message followed by locked arguments
        if (!commandLocked) result += ":lock: **" + locked.length + " locked argument" + (locked.length > 1 ? "s" : "") + "**\n\n";
        result += locked.join("\n\n") + "\n\n";
    }

    return result;
}

// get formatted string of each detected category
async function generateCategoryDisplay(request, nm) {
    var categories = [];

    for (var key in nm) {
        var script = nm[key]; 

        // only pull from categories with commands
        if (script.commands || script.arguments) {
            var command = script.commands ?
                "`[ " + script.commands[0] + " ]`" : "`{ " + key + " }`";
                // change brackets if theres no available commands to use

            var summary = await getSummary(script, nm);
            categories.push(command + " " + summary);
            // [ discord ] does stuff omg wow so cool
        }
    }

    return "**" + categories.length + " categor" + (categories.length > 1 ? "ies" : "y") + 
        " shown.** These are also commands!\n\n" + categories.join("\n\n");
        // 5 categories shown. These are also bot commands! (+ categories[])
}

// todo: ensure no duplicate results
function generateExampleCommands(key, nm) {
    var object = nm[key];

    var commands = [];
    var argument = [];

    if (object.commands) commands = [
        nm.core.randomElement(nm[key].commands), 
        nm.core.randomElement(nm[key].commands)
    ]

    if (object.arguments) {
        var keys = Object.keys(object.arguments);
        if (keys.length > 0) {
            argument = [ // pull two random arguments from current command category
                nm.core.randomElement(object.arguments[keys[nm.core.random(0, keys.length)]].commands),
                nm.core.randomElement(object.arguments[keys[nm.core.random(0, keys.length)]].commands),
            ]
        }
    }

    if (argument.length > 0)
        return "`nm " + argument[0] + "`, `nm " + commands[0] + " " + argument[1] + "`";
    else
        return "`nm " + commands[0] + "`, `nm " + commands[1] + "`";
}


// get formatted requirements for command usage
function generateRequirements(object, nm, includeAccount) {
    if (!object || !object.require) return; // null checks

    var requirements = nm.core.getRequirements(object),
        result = []; // loop through set requirements

    for (var r in requirements) {
        var requirement = requirements[r];
        if (requirement) {
            if (r == "account") {
                if (includeAccount) // special flag so requirements don't go everywhere
                    result.push("`bot " + nm.auth.titles[object.require.account] + "`")
            } else {
                var string = requireStrings[r] ? requireStrings[r] : r;
                result.push("`" + string + "`"); // try formatted title
            }
        }
    }

    return result.join(", ");
}