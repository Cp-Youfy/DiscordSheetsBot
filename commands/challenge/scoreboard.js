const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD, ENTRIES_PER_PAGE } = require('../../CONSTANTS.json');
const { registerUser } = require('../../exports/databaseMethods.js')

// leaderboard command inspired by https://github.com/Ai0796/RoboNene/blob/master/client/commands/leaderboard.js :)
module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('scoreboard')
		.setDescription('Display the scoreboard for a challenge')
        .addStringOption(option =>
            option.setName('challengeID')
                .setDescription('Challenge name or ID (case sensitive)')
                .setRequired(true),
            ),	
	async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challengeID') ?? null;
            const res = await registerUser(interaction.user.id, nameString, Date.now());
            await interaction.reply(res);
            return;
        } catch (error) {
            if (error.message == "Player already exists.") {
                await interaction.reply("You have already registered!");
                return;
            } else {
                throw error;
            }
        }
	},
};
