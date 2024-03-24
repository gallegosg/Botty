import dotenv from "dotenv";
dotenv.config();
// require("dotenv").config();
// const Discord = require("discord.js");
import { Client, Intents } from "discord.js";
// const { Client, Intents, Collection } = require("discord.js");
// const axios = require("axios");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
import axios from "axios";
import insulter from "insult";
// const authenticate = require("@xboxreplay/xboxlive-auth");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function getMeme() {
  try {
    const res = await axios.get("https://meme-api.com/gimme");
    return res.data.url;
  } catch (e) {
    return "Oops idk what happened";
  }
}
async function getSubredditImage(sub = "wrx") {
  try {
    const aRandomNum = Math.floor(Math.random() * 50 + 1);
    const res = await axios.get(
      "http://www.reddit.com/r/" + sub + ".json?show=all&limit=50"
    );

    for (let i = 0; i < res.data.data.children.length; i++) {
      if (i == aRandomNum) {
        return res.data.data.children[i].data.url;
      }
    }
    return "Nothing found";
  } catch (e) {
    return "Oops idk what happened";
  }
}

async function getJoke() {
  try {
    const res = await axios.get("https://v2.jokeapi.dev/joke/Dark");
    const output = { joke: "", punchline: "" };

    if (res.data.joke) {
      output.joke = res.data.joke;
    } else if (res.data.setup && res.data.delivery) {
      output.joke = res.data.setup;
      output.delivery = res.data.delivery;
    }
    return output;
  } catch (e) {
    return "Uh oh, nothing happened";
  }
}

client.on("messageCreate", async (msg) => {
  try {
    if (msg.author.bot) return;
    if (msg.mentions.has(client.user)) {
      msg.reply(insulter.Insult());
      return;
    }

    switch (msg.content) {
      case "ping":
        msg.reply("Pong!");
        break;
      //our meme command below
      case "!meme":
        msg.channel.send("Here's your meme!"); //Replies to user command
        const img = await getMeme();
        msg.channel.send(img); //send the image URL
        break;
      case "!on":
        const message =
          "@everyone https://tenor.com/view/the-goon-cod-warzone-call-of-duty-hurry-up-jump-on-gif-17162875";
        msg.channel.send(message).then((sentEmbed) => {
          sentEmbed.react("🙌");
        });
        break;
      case "!wt":
        msg.channel.send("@everyone What time?").then((sentEmbed) => {
          sentEmbed.react("🕔");
          sentEmbed.react("🕠");
          sentEmbed.react("🕕");
          sentEmbed.react("🕡");
          sentEmbed.react("🕖");
        });
        break;
      case "!rnd":
        msg.reply(
          "Type a subreddit to get a random post from it ex: `!rnd wrx`"
        );
        break;
      case "!joke":
        const { joke, delivery } = await getJoke();
        msg.reply(joke).then((sent) => {
          if (delivery) {
            setTimeout(() => {
              sent.reply(delivery);
            }, 3000);
          }
        });
        break;
      case "!help":
        msg.channel.send(`Available Commands
          ping - check if the server is up. will return pong
          !meme - generates a random meme
          !on - let everyone know you are onine and ready to play
          !wt - ask the group what time they are going to get on to play
          !rnd {subreddit} - returns a random post from the subreddit specified
          !help - returns this list of commands supported
          !joke - tells a joke
          @Botty - chat with botty
          `);
        break;
      default:
        if (msg.content.startsWith("!rnd ")) {
          const sub = msg.content.split("!rnd ")[1];
          if (sub) {
            msg.channel.send("Here's a random pic from r/" + sub); //Replies to user command
            const redditImage = await getSubredditImage(sub);
            msg.channel.send(redditImage); //send the image URL
          }
        }
    }
  } catch (e) {
    msg.channel.send("uhh");
  }
});

//make sure this line is the last line
client.login(`${process.env.CLIENT_TOKEN}`); //login client using token
