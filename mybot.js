const Discord = require('discord.js');
const bot = new Discord.Client();

//var sentence = [];

var time;

var parrotingEnabled = true;

bot.on('message', (message) => {

    var Keywords = { //ez pz, just add new keywords and urls
        stop : ["https://i.imgur.com/phymrWk.gif", "https://i.imgur.com/CoWZ05t.gif"],
        osha : ["https://i.imgur.com/v4Ebsbv.gifv", "https://i.imgur.com/WzxIoBo.jpg"],
        shitpost : ["https://i.imgur.com/XvWD1oO.gifv"],
   }

    if(message.author.username == "mutiny") {
        var msg = message.content;

        if (parrotingEnabled) ParrotMaster(ScanSentence(msg));
        if (message.content.toLowerCase() == 'ayy') message.channel.sendMessage('lmao');
    }

    // controls parroting //
    function ScanSentence(msg) { // this saves our last message as words in a string[]
        var sentence = [];
        var cache = 0;
        for (var i = 0; i < msg.length; i++) { 
            if(msg.substring(i,i+1) == " ") { // looks for space char to begin next word
                sentence[sentence.length] = msg.substring(cache,i); // adds detected word to next spot in array
                cache = i+1; // saves where the space is so it can detect words after it
            }
            if(i == msg.length -1) { // saves last word in the sentence (no space to detect)
                sentence[sentence.length] = msg.substring(cache,msg.length);
            }
        }
        return sentence;
    }

    function ParrotMaster(words) {
        var keys = Object.keys(Keywords); // converts our words in keywords to a string[]
        for (i = 0; i < words.length; i++) { // scans our last sentence
            for (j = 0; j < keys.length; j++) { // scans our keywords
                if (words [i] == keys[j]) { // if a word matches a keyword
                    //message.channel.send(Keywords[words[i]][1]);
                    message.channel.send(Keywords[words[i]][RandomizeLink(0,Keywords[words[i]].length)]);
                }
            }
        }
    }

    function RandomizeLink(min, max) { // used for randomizing links
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    // end parroting controls //
});

bot.login('MzE4MjQ0NzMzOTc1NjU4NDk2.DAvkDA.hcDVTCI0IVhGjPjgnAjWjaUnTIE'); 