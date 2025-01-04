const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');

module.exports = {
	cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};
