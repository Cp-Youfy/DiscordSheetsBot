const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady, // specify the event being handled
	once: true, // should event only run once
	execute(client) {
        client.once(Events.ClientReady, readyClient => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });
	},
};
