const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../CONSTANTS.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot'),
	async execute(interaction) {
        const botLatency = Math.abs(Date.now() - interaction.createdTimestamp);
		await interaction.reply(String(botLatency) + 'ms');
	},
};
