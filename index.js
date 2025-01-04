// Require the necessary discord.js classes
const fs = require('node:fs'); // identify command files
const path = require('node:path'); // constructs paths to access files and directories
const { ActivityType, Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { sleep } = require('./exports/helperMethods');
const { REST, Routes, DataResolver } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath); // returns array of all folders in commands

// Command handling
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder); 
    // returns array of all files in each command folder
    // filters for only .js files
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !(file.startsWith('h-'))); 
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) { // checks that both data and execute is present to ensure the command returns something
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Event handling
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
        // client.once acts as a listener for any events triggered available in events folder
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Cooldown Collection
client.cooldowns = new Collection();

// Log in to Discord with your client's token
client.login(token);

// Setting bot details
// const rest = new REST().setToken(token);

// const updateBanner = async function (bannerLink) {
// 	try {
// 		await rest.patch(Routes.user(), {
// 			body: { banner: "data:image/gif;base64," + Buffer.from(await (await fetch(bannerLink)).arrayBuffer()).toString('base64')  },
// 		});
// 		console.log("Banner updated successfully!")
// 	} catch (err) {
// 		console.log("Failed to update banner:\n"+ err)
// 	}
// }

client.on("ready", () => {
	client.user.setActivity('most retarded competition', { type: ActivityType.Competing });
	// updateBanner('https://i.imgur.com/zuezb5Z.png'); // https://i.imgur.com/zuezb5Z.png;
});

console.log('-- Login successful')