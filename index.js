import dotenv from 'dotenv'
dotenv.config()
// require("dotenv").config();
// const Discord = require("discord.js");
import { Client, Intents } from "discord.js";
// const { Client, Intents, Collection } = require("discord.js");
// const axios = require("axios");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
import Discord from "discord.js";
import axios from "axios";
import XboxLiveAPI from '@xboxreplay/xboxlive-api';

// const authenticate = require("@xboxreplay/xboxlive-auth");
import { authenticate } from '@xboxreplay/xboxlive-auth'

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const logIn = async () => {
  try {
    const auth = await authenticate(process.env.XBOX_ACCOUNT, process.env.XBOX_PASS);
    return { userHash: auth.user_hash, XSTSToken: auth.xsts_token }
  } catch (err) {
    console.log(err);
  }
}

const getDetails = async (user, userHash, XSTSToken) => {
  try {
    const res = await XboxLiveAPI.getPlayerXUID(user, {
      userHash,
      XSTSToken
    })
    return res
  } catch (err) {
    return false;
  }
}

const getStatus = async (xuid, userHash, XSTSToken) => {
  try {
    const config = {
      url: `https://peoplehub.xboxlive.com/users/me/people/xuids(${xuid})/decoration/presenceDetail`,
      method: 'GET'
    }
    const auth = {
      userHash,
      XSTSToken
    }
    const res = await XboxLiveAPI.call(config, auth, 2);
    if (res.people.length === 1) {
      return res.people[0].presenceText;
    }
  } catch (err) {
    return "Oops idk what happened getting status";
  }
}

async function getMeme() {
  try {
    const res = await axios.get("https://meme-api.herokuapp.com/gimme");
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
const getFonz = async (msg) => {
  try {
    msg.channel.send("Here's the status for Sircaptin64"); //Replies to user command
    const { userHash, XSTSToken } = await logIn();
    const xuid = await getDetails('Sircaptin64', userHash, XSTSToken);
    const status = await getStatus(xuid, userHash, XSTSToken);
    msg.channel.send(status); //send the image URL
  } catch (err) {
    console.log(err)
    msg.channel.send('error'); //send the image URL
  }
}
client.on("message", async (msg) => {
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
        sentEmbed.react("????");
      });
      break;
    case "!wt":
      msg.channel.send("@everyone What time?").then((sentEmbed) => {
        sentEmbed.react("????");
        sentEmbed.react("????");
        sentEmbed.react("????");
        sentEmbed.react("????");
        sentEmbed.react("????");
      });
      break;
    case "!xfonz":
      await getFonz(msg)
      break;
    case "!rnd":
      msg.reply("Type a subreddit to get a random post from it ex: `!rnd wrx`"); //Replies to user command
      break;
    default:
      if (msg.content.startsWith("!rnd ")) {
        const sub = msg.content.split("!rnd ")[1];
        if (sub) {
          msg.channel.send("Here's a random pic from r/" + sub); //Replies to user command
          const redditImage = await getSubredditImage(sub);
          msg.channel.send(redditImage); //send the image URL
        }
      } else if (msg.content.startsWith("!xstatus")) {
        const user = msg.content.split("!xstatus ")[1];
        if (user) {
          msg.channel.send("Here's the status for " + user); //Replies to user command
          const { userHash, XSTSToken } = await logIn();
          const xuid = await getDetails(user, userHash, XSTSToken);
          if (xuid) {
            const status = await getStatus(xuid, userHash, XSTSToken);
            msg.channel.send(status);
          } else {
            msg.channel.send("User not found");
          }
        }
      }
  }
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login client using token
