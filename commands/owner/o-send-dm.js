const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('o-send-dm')
		.setDescription('Use the bot to send a DM to specified user ID (ADMIN only)')
        .addStringOption(option =>
			option.setName('userid')
				.setDescription('18 character string')
                .setRequired(true),
			)
		.addStringOption(option =>
			option.setName('message')
				.setDescription('Message to send')
				.setRequired(true),
			),
    
	async execute(interaction) {

        const userID = interaction.options.getString('userid') ?? null;
        const message = interaction.options.getString('message') ?? null;

		const user = interaction.client.users.cache.find((user) => user.id === userID);

		var userDisplayName = ''

		if (user != null) {
			userDisplayName = user.displayName;
		}
		else { // user was not cached
			userDisplayName = userID
		}

		interaction.client.users.send(userID, message);

        await interaction.reply(`Message sent to user ${userDisplayName}!`);
        return;
	},
};
