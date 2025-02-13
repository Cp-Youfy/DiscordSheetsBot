const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ADMIN_ID } = require('../../config.json');
const { EASY_CD } = require('../../CONSTANTS.json');
const { submitFlag, findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('submit-flag')
		.setDescription('Submit a flag to a challenge')
        .addStringOption(option =>
            option.setName('challenge')
                .setDescription('Challenge ID or Name (case sensitive)')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('flag')
                .setDescription('Flag')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('additional_input')
                .setDescription('Additional Input (for long answers)')
                .setRequired(false),
        ),
	async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challenge') ?? null;
            const flag = interaction.options.getString('flag') ?? null;
            const additionalInput = interaction.options.getString('additional_input') ?? null;

            if (challengeID == null) {
                await interaction.reply("A challenge ID must be specified (case sensitive). You can find the challenge ID by displaying the challenge using `challenge display`.");
                return;
            }

            if (flag == null) {
                await interaction.reply("Flag cannot be empty.");
                return;
            }

            const challenge = await findChallenge(challengeID);

            res = await submitFlag(flag, challenge._id, interaction.user.id, additionalInput);
            await interaction.reply(res);
            return;
        } catch (err) {
            if (err.message == "Challenge not found." || err.message.startsWith("You have not joined the challenge.")) {
                await interaction.reply(err.message);
                return;
            } else {
                // Default error handling behaviour for unexpected errors
                throw new Error(err.message);
            }
        }
	},
};
