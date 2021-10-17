require('dotenv').config();
const Discord = require('discord.js');
const { Client, Intents, Collection } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function getMeme(){
    const res = await axios.get('https://meme-api.herokuapp.com/gimme');
    return res.data.url;
}

client.on('message', async msg => {
    switch (msg.content) {
      case "ping":
        msg.reply("Pong!");
        break;
      //our meme command below
      case "!meme":
        msg.channel.send("Here's your meme!"); //Replies to user command
        const img = await getMeme(); //fetches an URL from the API
        msg.channel.send(img); //send the image URL
        break;
     }
  })

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login client using token