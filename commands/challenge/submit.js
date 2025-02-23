const { SlashCommandBuilder, inlineCode } = require('discord.js');
const { SUPER_EXTREME_CD } = require('../../CONSTANTS.json');
const { submitFlag, findChallenge, findPlayerName } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: SUPER_EXTREME_CD,
	data: new SlashCommandBuilder()
		.setName('submit')
		.setDescription('Submit a flag to a puzzle')
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
            option.setName('puzzle_id')
                .setDescription('PuzzleID')
                .setRequired(false),
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
            const puzzle_id = interaction.options.getString('puzzle_id') ?? null;
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
            var res = '';

            if (challenge.isTargeted) {
                // Targeted challenge -- necessitate puzzle_id
                if (puzzle_id == null) {
                    await interaction.reply("Please include the ID of the puzzle you are submitting to.")
                    return;
                } else {
                    res = await submitFlag(flag, challenge._id, interaction.user.id, additionalInput, puzzle_id)
                }
            } else {
                res = await submitFlag(flag, challenge._id, interaction.user.id, additionalInput)
            }

            const lbUsername = await findPlayerName(interaction.user.id);
            
            if (res.startsWith("LongAnsID")) {
                const [_, longAnsID, flagTitle, additionalInput] = res.split('|')

                const longAnswerChannel = await interaction.client.channels.fetch(challenge.longAnsChannelID);
                longAnswerChannel.send({ content: `New submission (ID ${inlineCode(longAnsID)}) by ${lbUsername} (${interaction.user.id})\n**Puzzle Name: ${flagTitle}** \n ${additionalInput}` })

                res = `Submission of long answer complete. Your submission ID is ${inlineCode(longAnsID)}. Results will be notified via DMs, please ensure the bot can DM you.`
            }

            await interaction.reply(res);

            // Log submission in the log channel
            const logChannel = await interaction.client.channels.fetch(challenge.logChannelID);
            logChannel.send({ content: `User **${lbUsername}** (${interaction.user.id}) attempted puzzle submission for challenge **${challenge.name}**\nFlag: ${flag}\nPuzzle: ${puzzle_id}\nResponse: ${res}`, ephemeral: false});
            return;

        } catch (err) {
            if (err.message == "Challenge not found." || err.message.startsWith("You have not joined the challenge.")) {
                await interaction.reply(err.message);
                return;
            } 
            else if (err.message.startsWith("input must be a 24 character hex string")) {
                await interaction.reply("Invalid puzzle ID format.")
                return;   
            } else {
                // Default error handling behaviour for unexpected errors
                throw new Error(err.message);
            }
        }
	},
};
