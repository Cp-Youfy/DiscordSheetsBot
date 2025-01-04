const { SlashCommandBuilder } = require('discord.js');
const { MEDIUM_CD } = require('../../config.json');
const { addEntry } = require('../../exports/sheetMethods.js');

module.exports = {
    cooldown: MEDIUM_CD,
	data: new SlashCommandBuilder()
		.setName('add-entry')
		.setDescription('Adds an entry to the Google Sheets')
        .addStringOption(option =>
			option.setName('word')
				.setDescription('Max 32 characters')
                .setRequired(true),
			)
        .addStringOption(option =>
            option.setName('definition')
                .setDescription('Max 200 characters')
                .setRequired(true),
            ),	
    
	async execute(interaction) {

        const wordStr = interaction.options.getString('word') ?? null;
		const definitionStr = interaction.options.getString('definition') ?? null;

        const res = await addEntry(wordStr, definitionStr)

        await interaction.reply(res);
        return;
	},
};
