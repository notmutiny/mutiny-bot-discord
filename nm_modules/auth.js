module.exports = function(prefs, prefsFile, fs) {
    module.commands = ["users", "user", "auth"];
    module.summary = function(nm) { return "Configure " + nm.bot.user.username + "'s whitelisted users" };
    module.picture = "https://i.imgur.com/Ik6B7YF.png";
    module.require = { account: 2 };

    module.arguments = {
        "save": {
            commands: ["add", "save"],
            summary: "Add mentioned users to whitelist",
            require: {
                mention: true, }},
        "delete": {
            commands: ["remove", "delete", "delet"],
            summary: "Remove mentioned users from whitelist",
            require: {
                mention: true }},
        "print": {
            commands: ["print", "list", "show"],
            summary: "Show information on whitelisted users",
            require: {
                command: true,
            }
        }
    };

    module.function = function(request, argument, message, nm) {
        let success = false,
            mentions = [];

        // push user mentions to array for later use
        message.mentions.users.forEach(function(m) {
            // wow nice "collections" are so good amiright
            mentions.push({ id: m.id, name: m.username });
        });

        switch (argument) {
            case "save":
                mentions.forEach(function(mention, index) {
                    if (!prefs.users[mention.id]) {
                        prefs.users[mention.id] = 1;
                        success = true;
                    } else
                        mentions.splice(index, 1);
                });
                break;

            case "delete":
                mentions.forEach(function(mention, index) {
                    if (prefs.users[mention.id] && prefs.users[mention.id] != 2) {
                        delete prefs.users[mention.id];
                        success = true;
                    } else
                        mentions.splice(index, 1);
                });
                break;

            case "print":
                let admin = [],
                    users = [],
                    value = "";

                for (let id in prefs.users) {
                    let user = prefs.users[id];

                    if (user == 2)
                        admin.push("<@" + id + ">");
                    else
                        users.push("<@" + id + ">");
                }

                if (admin.length > 0)
                    value += "**" + admin.length + " admin" + (admin.length != 1 ? "s" : "") + "**\n" + admin.join("\n") + "\n\n";

                if (users.length > 0)
                    value += "**" + users.length + " user" + (users.length != 1 ? "s" : "") + "**\n" + users.join("\n");

                let embed = nm.core.embed(
                    "Here's my saved users",
                    (admin.length + users.length) + " whitelisted users",
                    value,
                    module.picture
                )

                nm.core.speak(embed, message);
                return; 
        }

        if (success) {
            fs.writeFile(prefsFile, JSON.stringify(prefs, null, "\t"), 'utf8', function(err){
                if(err) throw err;
            }); 
            let response = nm.core.randomElement(getResponses(mentions, argument));
            nm.core.speak(response, message);
        }
    };

    // check if command is unlocked for sender
    module.unlocked = function(author, requirement) {
        if (!requirement) return true;
        return author >= requirement;
    }

    return module;
};

function getResponses(mentions, argument) {
    let save = Object.keys(module.arguments)[0],
        user = []; // updated mentions usernames 
        
    mentions.forEach(function(m) {
        user.push(m.name);
    });

    if (user.length > 0) return [
        user.join(", ") + (user.length > 1 ? " have" : " has") + " been " + (argument == save ? "added to" : "removed from") + " my users",
        "I " + (argument == save ? "added " : "removed ") + user.join(", ") + (argument == save ? " to" : " from") + " my users" ]
    else return ""; 
}
