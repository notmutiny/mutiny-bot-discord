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
        prefs = JSON.parse(fs.readFileSync(prefsFile)); // cache, stop disk IO 

    const discordJS = require("discord.js");

    const nm = {
        /* required runtime information */
        auth: require("./nm_modules/auth"),
        core: require("./nm_modules/core"),
        help: require("./nm_modules/help"),
        bot: new discordJS.Client(),

        /* extra self-contained modules */ 
        discord: require("./nm_modules/discord"),
        search: require("./nm_modules/search"),
        warframe: require("./nm_modules/warframe")
    }

    // -- discord events -- //

    nm.bot.on("ready", () => {
        console.log("nm started w/ " + nm.bot.users.size + " users in " + nm.bot.channels.size + " channels of " + nm.bot.guilds.size + " servers");

        // replace not mutinys presence with mutinys status on start
        nm.core.getUserStatus(mutiny, nm.bot).then(function(state) {
            nm.bot.user.setPresence({ status: state });
        }).catch(function(err) { // catch or node will be mad :(
            console.log("nm is being stupid because of " + err);
        });
    });

    nm.bot.on("message", (message) => {
        if (message.author.bot) return;
        let summoned = nm.core.summoned(message);

        if (summoned) {
            let request = nm.core.request(message, nm, prefs);
            if (!request) return; // send a request or go away

            think(request, message);
        }

        for (let role in roles) // attach user role emojis
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
        if (user.id != mutiny) return;
        reaction.remove(nm.bot.user.id);
    });

    // -- bot functions -- //

    function think(request, message) {
        if (request.success) {
            let argument = request.argument ? request.argument.key : null;
            nm[request.key].function(request, argument, message, nm, fs, prefs);            
        } else {
            if (nm.core.error[request.error]) {
                let error = nm.core.randomElement(nm.core.error[request.error].main(request)) + (nm.core.error[request.error].end ? " or " + nm.core.randomElement(nm.core.error[request.error].end) : "");
                nm.core.speak(error, message);
            }
        }
    }

    nm.bot.login( /*private key pls no steal*/ );
}
