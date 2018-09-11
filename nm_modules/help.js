let footer = { 
    0: {
        level: "You're a guest.",
        fluff: ["Some features are restricted!", "Uh oh, stranger danger!", "Try combining help with a command!"]},
    1: {
        level: "You're a user!",
        fluff: ["Most features are unlocked!", "Try combining help with a command!"]},
    2: { 
        level: "You're an admin!",
        fluff: ["Am I behaving well?", "Glory be upon you.", "Too OP pls nerf.", "Everything is unlocked!"]
    },
}

let requireStrings = {
    mention: "user mention",
    textInput: "text input",
    command: "command use"
}

// todo
// make examples use requirements
// add source code in footer ?

module.exports = function(prefs) {
    module.commands = ["help"];
    module.summary = function(nm) { return "Check info about " + nm.bot.user.username + "'s commands" };
    
    module.function = async function(request, argument, message, nm) {
        let array = message.content.split(" "),
            index = array.indexOf(request.command);
            // rescan commands to force modularity

        if (index > -1) {
            array.splice(index, 1);
            message.content = array.join(" ");
            // remove help to check if a target was provided
            let result = nm.core.request(message, nm, prefs);
            if (result) request = result; // push new command
        }

        // embed template data for result discord message
        let header = "Here's an overview of my commands",
            title = "Made with the https://discord.js.org/ library",
            value = "", thumbnail = nm[request.key].picture;
        
        if (request.key == "help") { // generate default message
            value = await generateCategoryDisplay(request, nm) + 
                "\n\n**Did you know?**\n" +
                ". . . You can get my attention with `nm` or <@318244733975658496>\n" +
                ". . . You can lookup commands by typing ` help ` before them\n" +
                ". . . You can use arguments with commands or by themselves\n\n";
        } else {
            // replace embed data with specified target data
            header = "Here's what I know about **" + (request.command ? request.command : request.argument.command) + "**";          
            title = await getSummary(nm[request.key], nm);
            value = "**Commands** : " + getCommands(nm[request.key]) + "\n\n" +
                    "**Examples** : " + generateExampleCommands(request.key, nm) + "\n\n";
            
            let requirements = generateRequirements(nm[request.key], nm);
            if (requirements) value += "**Requires** : " + requirements + "\n\n";
            value += await generateArgumentDisplay(request, nm);
        } 

        // generate footer message with users stored level and additional flavor text then amend it to embedded value
        value += "**" + footer[request.author.account].level + "** " + nm.core.randomElement(footer[request.author.account].fluff);
        let embed = nm.core.embed(header, title, value, thumbnail);        
        nm.core.speak(embed, message);
    };

    return module;
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
            let res = await object.summary(nm);
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
    let words = string.split(" ");

    words.forEach(function(word, i) {
        words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    })

    return words.join(" ");
}

// get formatted string of each detected argument
async function generateArgumentDisplay(request, nm) {
    let commandRequirement = nm[request.key].require ?
        (nm[request.key].require.account || 0) : 0;
        // get required account level for command
    
    let commandLocked = commandRequirement > request.author.account,
        result = commandLocked ? ":lock: **This command category is locked**\n\n" : "";

    // total amount of arguments in commands category
    let amount = nm[request.key].arguments ?
        Object.keys(nm[request.key].arguments).length : 0;

    if (amount < 1) return result;

    let locked = [],    // all locked arguments
        unlocked = [];  // all unlocked arguments

    for (let a in nm[request.key].arguments) {
        let argument = nm[request.key].arguments[a], // reference to specific argument in request object
            summary = await getSummary(argument, nm),
            element = "**" + capitalizeFirstLetter(a) + "** : " + getCommands(argument) + "\n" + summary;

        let requirements = generateRequirements(argument, nm);
        if (requirements) element += "\n**Requires** : " + requirements;

        let argumentLocked = // flag if argument is locked so the next code is legible
            (argument.require ? (argument.require.account || 0) : 0) > request.author.account;
        
        if (commandLocked || argumentLocked)
            locked.push(element)
        else 
            unlocked.push(element)
    }

    if (unlocked.length > 0) { // generate unlocked message followed by unlocked arguments
        result += ":unlock: **" + unlocked.length + " unlocked argument" + (unlocked.length > 1 ? "s" : "") + "**\n\n";
        result += unlocked.sort().join("\n\n") + "\n\n";
    }

    if (locked.length > 0) { // generate locked message followed by locked arguments
        if (!commandLocked) result += ":lock: **" + locked.length + " locked argument" + (locked.length > 1 ? "s" : "") + "**\n\n";
        result += locked.sort().join("\n\n") + "\n\n";
    }

    return result;
}

// get formatted string of each detected category
async function generateCategoryDisplay(request, nm) {
    let categories = [];

    for (let key in nm) {
        let script = nm[key]; 

        // only pull from categories with commands
        if (script.commands || script.arguments) {
            let command = "`< " + (script.commands ? script.commands[0] : key) + " >`";
            let summary = await getSummary(script, nm);
            categories.push(command + " " + summary);
            // [ discord ] does stuff omg wow so cool
        }
    }

    // sort alphabetically
    categories.sort();

    return "**" + categories.length + " categor" + (categories.length > 1 ? "ies" : "y") + 
        " shown.** These are also bot commands!\n\n" + categories.join("\n\n");
        // 5 categories shown. These are also bot commands! (+ categories[])
}

// todo: ensure no duplicate results
function generateExampleCommands(key, nm) {
    let object = nm[key];

    let commands = [];
    let argument = [];

    if (object.commands) commands = [
        nm.core.randomElement(nm[key].commands), 
        nm.core.randomElement(nm[key].commands)
    ]

    if (object.arguments) {
        let keys = Object.keys(object.arguments);
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

    let requirements = nm.core.getRequirements(object),
        result = []; // loop through set requirements

    for (let r in requirements) {
        let requirement = requirements[r];
        if (requirement) {
            if (r == "account") {
                if (includeAccount) // special flag so requirements don't go everywhere
                    result.push("`bot " + nm.auth.titles[object.require.account] + "`")
            } else {
                let string = requireStrings[r] ? requireStrings[r] : r;
                result.push("`" + string + "`"); // try formatted title
            }
        }
    }

    return result.join(", ");
}
