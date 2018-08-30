var mutiny = "127655681754005504";

// welcome to mutiny bot ヾ(＾∇＾)
// sorry you're stuck reading this
// its never too late to turn back

exports.Start = function() {

    var fs = require('fs'), // bot is stored with dropbox to update my devices 
        prefsFile = process.env.userprofile + "/Dropbox/mutiny bot/prefs.json",
        prefs = JSON.parse(fs.readFileSync(prefsFile)); // cache, stop disk IO 

    const discordJS = require("discord.js");

    const nm = {
        /* required runtime information */
        auth: require("./nm_modules/auth"),             // user authentication
        core: require("./nm_modules/core"),             // offloaded functions
        help: require("./nm_modules/help"),             // sends internal data
        bot: new discordJS.Client(),                    // Discord.JS instance

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
        var summoned = nm.core.summoned(message);

        if (summoned) {
            var request = nm.core.request(message, nm, prefs);
            if (!request) return; // send a request or go away

            if (request.unlocked) think(request, message);
            else nm.core.speak(nm.auth.error, message);
        }
    });

    // make not mutiny copy mutinys presence
    nm.bot.on("presenceUpdate", (guildmem) => {
        if (guildmem.id != mutiny) return;
        var state = guildmem.user.presence.status;
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

    // -- main functions -- //

    function think(request, message) {
        var argument = request.argument ? request.argument.key : null;
        nm[request.key].function(request, argument, message, nm, prefs);
    }

    nm.bot.login( /*private key pls no steal*/ );
}