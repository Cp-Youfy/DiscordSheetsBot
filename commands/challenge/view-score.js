const { SlashCommandBuilder } = require('discord.js');
const { HARD_CD } = require('../../CONSTANTS.json');
const { findScore, findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('view-score')
		.setDescription('View your current score for a challenge')
        .addStringOption(option =>
            option.setName('challenge')
                .setDescription('Challenge name or ID')
                .setRequired(true),
            ),	
	async execute(interaction) {
        try {
            const challengeParam = interaction.options.getString('challenge') ?? null;
            const challenge = await findChallenge(challengeParam);

            const res = await findScore(challenge._id, interaction.user.id);
            await interaction.reply(`<@${interaction.user.id}>'s score for challenge **${challenge.name}** is: **${res}**`);
            return;

        } catch (err) {
            if (err.message == "Scoreboard entry does not exist. Have you joined the challenge?" || err.message == "Challenge not found.") {
                await interaction.reply(err.message);
                return;
            } else {
                throw err;
            }
        }
	},
};
