const { SlashCommandBuilder } = require('discord.js');
const { HARD_CD, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json');
const { findFlag } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('view-puzzle')
		.setDescription('View details of a specific puzzle')
        .addStringOption(option =>
            option.setName('puzzle_id')
                .setDescription('Puzzle ID')
                .setRequired(true),
            ),	
	async execute(interaction) {
        try {
            const puzzleID = interaction.options.getString('puzzle_id') ?? null;
            const flag = await findFlag(puzzleID);

            var embed = {
                color: EMBED_COLOUR_GEN,
                title: `Details of puzzle`,
                description: `
                **ID** ${flag.id}
                **Name** ${flag.flagTitle}
                **Description** ${flag.flagInfo}
                **Point value** ${flag.value}
                **Submission Opens** ${flag.submissionOpenDate}
                
                - PARAMS
                isLongAns ${flag.isLongAns}

                (created ${flag.dateCreated})
                `,
                footer: {
                    text: `Requested by ${interaction.user.name}`
                },
                timestamp: new Date().toISOString(),
            };

            await interaction.reply({ embeds: [embed] });
            return;
        } catch (err) {
            if (err.message == 'Invalid flag ID format') {
                await interaction.reply("Invalid puzzle ID format");
            } else if (err.message == 'Flag not found') {
                await interaction.reply("Puzzle not found")
            } else {
                // Default error handling
                throw new Error(err)
            }
        }
	},
};
