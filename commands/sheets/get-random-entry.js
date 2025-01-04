const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');
const assert = require('assert');
const { getEntry } = require('../../exports/sheetMethods.js');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('get-random-entry')
		.setDescription('Get n random entries from cached data')
        .addIntegerOption(option =>
			option.setName('n')
				.setDescription('integer')
				.setRequired(true)
		),
    
	async execute(interaction) {
		await interaction.deferReply();

        const n = Number(interaction.options.getInteger('n'));

        try {
            assert(n <= 25);

            const res = await getEntry(n);

            const embed = {
                color: 0x0099ff,
                title: 'Random entries retrieved',
                description: 'To refresh cached results, use `/cache-json`',
                fields: res,
                timestamp: new Date().toISOString(),
            };
            
            await interaction.editReply({ embeds: [embed]});
            return;
        }
        catch (exception) {
            await interaction.editReply('Constraints on n not met: 0 <= n <= min(length of cached data, 25)\n25: Discord embed length limit');
            return;
        }
	},
};
