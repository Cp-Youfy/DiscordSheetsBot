const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs'); // identify command files
const { EASY_CD } = require('../../config.json');
const { request } = require('undici');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Returns a random cat image'),
	async execute(interaction) {
        await interaction.deferReply();
        try {
        // Send GET request to API
        const catResult = await request('https://cataas.com/cat');
		const file = await catResult.body.blob();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
		interaction.editReply({ files: [{ attachment: buffer }] });
        } catch (error) {
            interaction.editReply("API is down, no cat photo")
        }
	},
};
