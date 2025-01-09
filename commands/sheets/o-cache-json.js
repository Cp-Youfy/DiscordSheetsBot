const { SlashCommandBuilder } = require('discord.js');
const { HARD_CD } = require('../../config.json');
const { cacheJson } = require('../../exports/sheetMethods.js');

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('o-cache-json')
		.setDescription('Cache sheets results locally'),
    
	async execute(interaction) {
		await interaction.deferReply();
        const res = await cacheJson();
        await interaction.editReply(res);
        return;
	},
};
