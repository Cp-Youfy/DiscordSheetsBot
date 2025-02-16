const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD, INVITE_LINK } = require('../../CONSTANTS.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link of the bot'),
	async execute(interaction) {
		await interaction.reply(`Invite Link: ${INVITE_LINK} (only bot owner can add the bot)`);
	},
};
