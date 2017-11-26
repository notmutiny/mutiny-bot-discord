const Discord = require('discord.js');
const bot = new Discord.Client();

// Hello! You are reading the public version of mutinybot.
// This document is kept scrubbed and edited (removing most things).
// If you need the full code feel free to contact me and I can send it.

var ping = [
    "mb",
    "nm",
    "bot",
    "robot",
    "mutinybot",
    "notmutiny",
];

var Commands = {
    // removed //
}

var Responses = {
    // removed //
}

bot.on("ready", () => {
    console.log("mutinybot has started, with "+bot.users.size+" users, in "+bot.channels.size+" channels of "+bot.guilds.size+" guilds.");
});

bot.on('message', (message) => {
    var username = message.author.username; // don't want to type this a bunch
    var sentence = GetSentence(message.content); //saves my sentence into array
    var command = GetCommand(sentence); //scans my sentence for any commands
    var pinged = CheckPing(sentence); //checks if I called for mutinybot
    
    if(username == "mutiny") {

        if(pinged) Say(Responses[command]);

        function Say(param) {
            if (typeof param == "string") {
                message.channel.send(param);
            } else if (typeof param == "object") {
                message.channel.send(param[Random(0, param.length)]);
            } else console.log("Say function could not find a response to"+message.author.username+".");
        }
    }
});

function Random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function CheckPing(sentence) {
    for (s = 0; s < sentence.length; s++) {
        for (p = 0; p < ping.length; p++) {
            if (sentence[s] == ping[p]) {
                return true;
            }
        }
    }
    return false;
}

function GetSentence(msg) { // this saves our last message as words in a string[]
    var sentence = [];
    var cache = 0;
    for (i = 0; i < msg.length; i++) { 
        if (msg.substring(i, i + 1) == " ") { // looks for space char to begin next word
            sentence[sentence.length] = msg.substring(cache,i).toLowerCase(); // adds detected word to next spot in array
            cache = i+1; // saves where the space is so it can detect words after it
        }
        if (i == msg.length - 1) { // saves last word in the sentence (no space to detect)
            sentence[sentence.length] = msg.substring(cache,msg.length).toLowerCase();
        }
    }
    return sentence;
}

function GetCommand(sentence) {
    // removed //
}

bot.login(/*private key pls no steal*/); 
