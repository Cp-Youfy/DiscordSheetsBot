const { SlashCommandBuilder } = require('discord.js');
const { HARD_CD } = require('../../CONSTANTS.json');
const { ADMIN_IDS } = require('../../config.json')
const { findChallenge, findSubmissions, findPlayerName } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: HARD_CD,
    data: new SlashCommandBuilder()
        .setName('check-completed')
        .setDescription('Check for completed challenges in a challenge')
        .addStringOption(option =>
            option.setName('challenge_id')
                .setDescription("Challenge name or ID")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_id')
                .setDescription('Discord ID of member to check completed challenges of (user if left blank)')
                .setRequired(false),
        ),
    async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challenge_id') ?? null;
            const discordID = interaction.options.getString('player_id') ?? interaction.user.id;

            const challenge = await findChallenge(challengeID);
            const playerName = await findPlayerName(discordID);
            
            // todo: make multi page embed for this command
            var replyMsg = `**${playerName}**'s submissions for **${challenge.name}**\n`

            const submissionsArr = await findSubmissions(challenge.id, discordID);

            if (submissionsArr.length === 0) {
                await interaction.reply("No solved challenges found.");
            }
            
            for (const [i, doc] of submissionsArr.entries()) {
                replyMsg += `[${i+1}] ${doc.flagInfo} (ID: ${doc._id.toString()})\n`
            }

            await interaction.reply(replyMsg);
            return;

        } catch (err) {
            if (err.message == 'Challenge not found.') {
                await interaction.reply(err.message)
            } else {
                throw err;
            }
        }
    },
};
