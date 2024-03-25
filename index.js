import dotenv from "dotenv";
dotenv.config();

import { Client, Intents } from "discord.js";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
import axios from "axios";
import insulter from "insult";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_SECRET });

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
    const res = await axios.get(
      "https://v2.jokeapi.dev/joke/Miscellaneous,Dark,Pun,Spooky?blacklistFlags=religious"
    );
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

async function chat(message = "what is your name") {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a discord bot for the server Macintosh. Your name is Botty. 
          You are helpful but reluctant about it. The server members are Alfonso, Eman and Dito. Their usernames are Sircaptin, whyno, and LateForDinner respectively.
          You think Alfonso is cool and good at video games. You think Eman has a couple screws loose and somehow always has bad luck and is in love with Daniela, who goes by switch girl. 
          Dito is your creater whom you worship,`,
        },
        { role: "user", content: message },
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message?.content;
  } catch (e) {
    return "ai is done uh oh";
  }
}

client.on("messageCreate", async (msg) => {
  try {
    if (msg.author.bot) return;
    if (msg.mentions.has(client.user)) {
      const reply = await chat(msg.content);
      msg.reply(reply);
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
      case "!insult":
        msg.reply(insulter.Insult());
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
    console.log(e);
    msg.channel.send("uhh");
  }
});

//make sure this line is the last line
client.login(`${process.env.CLIENT_TOKEN}`); //login client using token
