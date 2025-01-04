const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');
const { request } = require('undici');
const { ConnectTimeoutError } = require('../../node_modules/undici/lib/core/errors')

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Returns a random cat image'),
	async execute(interaction) {
        await interaction.deferReply();
        try {
        // Send GET request to API
        const catResult = await request('http://aws.random.cat/meow');
		const { file } = await catResult.body.json();
		interaction.editReply({ files: [file] });
        } catch (error) {
            interaction.editReply("API is down, no cat photo")
        }
	},
};
