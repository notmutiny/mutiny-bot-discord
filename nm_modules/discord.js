module.exports = {
    commands: ["discord"],
    summary: "Utilize features provided by discord.js",
    picture: "https://i.imgur.com/t6L06o0.png",

    arguments: {
        "avatar": {
            commands: ["avatar", "pfp"],
            summary: "Gets the discord url for mentioned users avatar",
            require: {
                mention: true, }},
        "delete": {
            commands: ["delet", "delete"],
            summary: function(nm) { 
                return "Deletes the previous comment from " + nm.bot.user.username },
            require: {
                account: 1 }},
        "listening": {
            commands: ["listen", "listening"],
            summary: function(nm) { 
                return "Changes " + nm.bot.user.username + "'s listening to activity status" },
            require: {
                account: 1 }},
        "playing": {
            commands: ["play", "playing"],
            summary: function(nm) { 
                return "Changes " + nm.bot.user.username + "'s playing activity status" },
            require: {
                account: 1 }},
        "nickname": {
            commands: ["name", "nickname"],
            summary: function(nm) { 
                return "Changes " + nm.bot.user.username + "'s nickname on this server" },
            require: {
                account: 1 }},
        "watching": {
            commands: ["watch", "watching"],
            summary: function(nm) { 
                return "Changes " + nm.bot.user.username + "'s watching activity status" },
            require: {
                account: 1 },
        }
    },

    function: function(request, argument, message, nm) {

        switch (argument) {
            case "avatar":
                var mentions = message.mentions.users,
                    response = [];

                mentions.forEach(function(user){
                    response.push(user.avatarURL);
                });
                
                if (response.length == 1) response = response[0];
                else response = response.join(" \n");
                nm.core.speak(response, message);
                return;

            case "delete":
                var last = nm.bot.user.lastMessage;
                if (last && last.deletable) // discord API needs to stop returning deleted messages
                    last.delete().catch(e => console.log("Error: Cannot find message to delete"));
                return; // everyone point and laugh at the API that can't send updated information

            case "listening":
            case "nickname":
            case "watching":
            case "playing": // message trimming is the same
                var index = message.content.indexOf(request.argument.command) + request.argument.command.length + 1;
                var query = message.content.substring(index, message.content.length);
                
                if (query) {
                    if (argument == "nickname") message.guild.members.get(nm.bot.user.id).setNickname(query);
                    else if (argument == "listening") nm.bot.user.setActivity(query, { type: "LISTENING" });
                    else if (argument == "watching") nm.bot.user.setActivity(query, { type: "WATCHING" });
                    else if (argument == "playing") nm.bot.user.setGame(query); // depreciation warning
                } 
                
                return;
        }
    },
};
