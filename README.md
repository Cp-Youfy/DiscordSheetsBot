# Welcome!
This repository stores my discordjs bot that I use to pick up Javascript. The command descriptions are likely self-explanatory if your interest is piqued!<br>
Beyond the standalone functions, it has two main features:<br>
1) [Sheets](commands/sheets)<br>
The bot can add to, and quiz the user on, words from a Google Sheets vocabulary list. It uses [SheetDB](https://sheetdb.io/) which allows 500 free requests per month.
2) [Challenges](commands/challenge) <br>
The bot can create challenges that can be played in as long as the bot is online. It stores the data of users' scores, available challenges, etc. using [MongoDB](https://www.mongodb.com/). Users can submit "flags" (answers) to gain points -- it is similar to the structure of a CTF. You can look at the [schemas](exports/challengeSchemas.js) for more information.

# Setup
You may `git clone` the repository and use the bot for any **personal** purposes if it is useful.<br>

## Docker
You can run the code in a docker container. Using compose includes refreshes upon changes and automatic code updates. Run the command in the project's root directory.

```bash
docker compose up
```
or
```bash
docker build -t sbibobot .
docker run sbibobot
```

## Direct
Installation of dependencies should be done first via
```bash
npm install
```

To log in to the bot, by opening a terminal in the root directory,
```bash
node index.js
```

Deploying the slash commands is necessary when you make new ones by posting to Discord API,
```bash
node deploy-commands.js
```

`index.js` and `deploy-commands.js` is template code copied from the [discord.js guide](https://discordjs.guide/#before-you-begin). It's a very helpful guide!

# CONSTANTS.json
Do change: `INVITE_LINK`, `BOT_NAME`. Everything else can be kept constant (you can always look up how they are used to see if you need to change them). CDs are in seconds and anything above 100 is likely in milliseconds, but you can look it up based on its usage.

# config.json
Resolves
```Error: Cannot find module './config.json'```

You need to create a `config.json` file in the root directory. It is very important to keep this file secret, especially your bot token; don't commit the file to GitHub! Feel free to change the cooldowns (CD / seconds) to suit your needs, but note that `ADMIN_IDS` users is immune to the cooldowns. With the current code, here are the variables you will need to define:

```json
{
	"token": "<your-bot-token>",
	"clientId": "<your-bot-client-id>",
	"guildId": "<your-testing-server-id>",
	"DM_CHANNEL_ID": "<your-bot-dm-channel-id>",
	"LOG_CHANNEL_ID": "<your-bot-commands-logging-channel-id>",
	"BOT_USER_ID": "<your-bot-user-id>",
	"ADMIN_IDS": ["<your-id-for-bot-owner-only-commands>", "<other_allowed_ids>"],
	"SHEETS_API_LINK": "<your-sheetdb-api-link>",
	"DATABASE_USERNAME": "<your-mongodb-username>",
	"DATABASE_PASSWORD": "<your-mongodb-password>",
	"DEFAULT_CHALLENGE_LOG_ID": "<default-channel-for-sending-channel-logs>",
}
```
