const mutiny = "127655681754005504";

let roles = {
    "" : ""
}

// welcome to mutiny bot ヾ(＾∇＾)
// sorry you're stuck reading this
// its never too late to turn back

exports.Start = function() {

    let fs = require('fs'), // bot is stored with dropbox to update my devices 
        prefsFile = process.env.userprofile + "/Dropbox/mutiny bot/prefs.json",
        prefs = JSON.parse(fs.readFileSync(prefsFile)), // cache, stop disk IO 

        /* prepackaged modules */
        axios = require("axios"),
        discordJS = require("discord.js"),
        gSearch = require("google-search");

    const nm = {
        /* required runtime information */
        core: require("./nm_modules/core")(),
        auth: require("./nm_modules/auth")(prefs, prefsFile, fs),
        help: require("./nm_modules/help")(prefs),
        bot: new discordJS.Client(),

        /* additional self-contained modules */ 
        discord: require("./nm_modules/discord")(),
        search: require("./nm_modules/search")(gSearch),
        warframe: require("./nm_modules/warframe")(axios)
    }

    // -- discord events -- //

    nm.bot.on("ready", () => {
        console.log("nm started w/ " + nm.bot.users.size + " users in " + nm.bot.channels.size + " channels of " + nm.bot.guilds.size + " servers");
        start();
    });

    nm.bot.on("message", (message) => {
        let summoned = nm.core.summoned(message);

        if (summoned) {
            let request = nm.core.request(message, nm, prefs);
            if (!request) return; // send a request or go away

            think(request, message);
        }

        for (let role in roles) // react emoji to user role
            if (message.member.roles.find("name", role)) {
                message.react(roles[role]);
                break;
            }
    });

    // make not mutiny copy mutinys presence
    nm.bot.on("presenceUpdate", (guildmem) => {
        if (guildmem.id != mutiny) return;
        let state = guildmem.user.presence.status;
        nm.bot.user.setPresence({ status: state });
    });

    // make not mutiny copy mutinys reactions
    nm.bot.on("messageReactionAdd", (reaction, user) => { 
        if (user.id != mutiny) return;
        reaction.message.react(reaction.emoji);
    });
    
    nm.bot.on("messageReactionRemove", (reaction, user) => {  
        if (user.id != mutiny && user.id != "207691527839809537") return;
        reaction.remove(nm.bot.user.id);
    });

    // -- bot functions -- //

    function start() {
        // replace not mutinys presence with mutinys status on start
        nm.core.getUserStatus(mutiny, nm.bot).then(function(state) {
            nm.bot.user.setPresence({ status: state });
        }).catch(function(err) { // catch or node will be mad :(
            console.log("nm is being stupid because of " + err);
        });
    }

    function think(request, message) {
        if (request.success) {
            let argument = request.argument ? request.argument.key : null;
            nm[request.key].function(request, argument, message, nm);            
        } else nm.core.error(request, message);
    }

    nm.bot.login( /*private key pls no steal*/ );
}
