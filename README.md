# Welcome!
This repository stores my discordjs bot that I use to pick up Javascript. The command descriptions are likely self-explanatory if your interest is piqued!<br>
Beyond the standalone functions, it has two main features:<br>
1) [Sheets](commands/sheets)<br>
The bot can add to, and quiz the user on, words from a Google Sheets vocabulary list. It uses [SheetDB](https://sheetdb.io/) which allows 500 free requests per month.
2) [Challenges](commands/challenge) <br>
The bot can create challenges that can be played in as long as the bot is online. It stores the data of users' scores, available challenges, etc. using [MongoDB](https://www.mongodb.com/). Users can submit "flags" (answers) to gain points -- it is similar to the structure of a CTF. You can look at the [schemas](exports/challengeSchemas.js) for more information.

# Setup
You may `git clone` the repository and use the bot for any **personal** purposes if it is useful.<br>
Contributions and suggestions are welcome, but will not necessarily be implemented. Please create a branch for any new features.

## Docker (Recommended)
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

# Environment Variables
You need to create a `.env` file in the root directory. It is very important to keep this file secret, especially your bot token; don't commit the file to GitHub! You can use `env.example` as a sample and fill in the necessary values.<br>
If you intend to scale the bot for production, it is highly recommended to create separate `env` files for production and development.