const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on('message', (message) => {

    if(message.content.toLowerCase() == 'ayy') {
        message.channel.sendMessage('lmao');
    }

    if(message.content.toLowerCase() == 'good bot') {
        message.channel.sendMessage('thanks '+message.author.username);
    }
});

bot.login('MzE4MjQ0NzMzOTc1NjU4NDk2.DAvkDA.hcDVTCI0IVhGjPjgnAjWjaUnTIE');