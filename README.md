# Welcome!
This repository stores my discordjs bot that I use to pick up Javascript. The command descriptions are likely self-explanatory if your interest is piqued!<br>
Beyond the standalone functions, it has two main features:<br>
1) [Sheets](commands/sheets)<br>
The bot can add to, and quiz the user on, words from a Google Sheets vocabulary list. It uses [SheetDB](https://sheetdb.io/) which allows 500 free requests per month.
2) [Challenges](commands/challenge) \[WIP\]<br>
The bot can create challenges that can be played in as long as the bot is online. It stores the data of users' scores, available challenges, etc. using [MongoDB](https://www.mongodb.com/). Users can submit "flags" (answers) to gain points -- it is similar to the structure of a CTF. You can look at the [schemas](exports/challengeSchemas.js) for more information.

# Setup
You may `git clone` the repository and use the bot for any **personal** purposes if it is useful.<br>
Installation of dependencies should be done first via
```bash
npm install
```

You should set up the `config.json` file first before trying to run the bot, or it will fail. Refer to the section below.

To log in to the bot, by opening a terminal in the root directory,
```bash
node index.js
```

Deploying the slash commands is necessary when you make new ones by posting to Discord API,
```bash
node deploy-commands.js
```

`index.js` and `deploy-commands.js` is template code copied from the [discord.js guide](https://discordjs.guide/#before-you-begin). It's a very helpful guide!

# config.json
You need to create a `config.json` file in the root directory. It is very important to keep this file secret, especially your bot token; don't commit the file to GitHub! Feel free to change the cooldowns (CD / seconds) to suit your needs, but note that the `ADMIN_ID` user is immune to the cooldowns. With the current code, here are the variables you will need to define:

```json
{
	"token": "<your-bot-token>",
	"clientId": "<your-bot-client-id>",
	"guildId": "<your-testing-server-id>",
	"DM_CHANNEL_ID": "<your-bot-dm-channel-id>",
	"LOG_CHANNEL_ID": "<your-bot-commands-logging-channel-id>",
	"BOT_USER_ID": "<your-bot-user-id>",
	"ADMIN_ID": "<your-id-for-bot-owner-only-commands>",
	"SHEETS_API_LINK": "<your-sheetdb-api-link>",
	"DATABASE_USERNAME": "<your-mongodb-username>",
	"DATABASE_PASSWORD": "<your-mongodb-password>",
	"DATABASE_NAME": "<your-mongodb-collection-name-for-challenges>",
	"DEFAULT_CHANNEL_LOG_ID": "<default-channel-for-sending-channel-logs>",
}
```

