const assert = require('assert')

const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('gcd')
		.setDescription('Greatest common divisor of a, b')
		.addIntegerOption(option =>
			option.setName('a')
				.setDescription('integer')
				.setRequired(true)
			)
		.addIntegerOption(option =>
			option.setName('b')
				.setDescription('integer')
                .setRequired(true)
			),	

	async execute(interaction) {
        const aOrig = Number(interaction.options.getInteger('a')) ?? null;
		const bOrig = Number(interaction.options.getInteger('b')) ?? null;

        // Euclidean Algorithm for GCD
        try {
            var a = aOrig;
            var b = bOrig;
		    assert(a >= 0 && b >= 0);
        }
        catch (exception) {
            await interaction.reply({ content: `Input integers must be larger than or equal to zero!` });
        }
        while (a != 0) {
            [a, b] = [b  % a, a];
        }
        await interaction.reply({ content: `The GCD of ${aOrig} and ${bOrig} is ${b}` });
	},
};
