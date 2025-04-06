const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { multiPageButtons } = require('../../exports/multiPageConstants.js')
const { HARD_CD, ENTRIES_PER_PAGE, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json');
const { findChallenge } = require('../../exports/databaseMethods.js');
const { Scoreboard, Player } = require('../../exports/challengeSchemas');

// Derive page spans
const MAX_PAGE = Math.ceil(100 / ENTRIES_PER_PAGE) - 1;

// leaderboard command inspired by https://github.com/Ai0796/RoboNene/blob/master/client/commands/leaderboard.js :)
module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('scoreboard')
		.setDescription('Display the scoreboard for a challenge')
        .addStringOption(option =>
            option.setName('challenge')
                .setDescription('Challenge ID or Name (case sensitive)')
                .setRequired(true),
            ),	
	async execute(interaction) {
        await interaction.deferReply();
        try {
            // Retrieve and check challengeID
            const challengeID = interaction.options.getString('challenge') ?? null;
            if (challengeID == null) {
                await interaction.reply("A challenge ID must be specified (case sensitive). You can find the challenge ID by displaying the challenge using `challenge display`.");
                return;
            }

            const challenge = await findChallenge(challengeID);
            const scoreboardData = await Scoreboard.find({ challengeID: challenge._id }).sort({ scoreValue: 'desc' });
            var page = 0;
            const embedArr = [];
            const toShowId = !challenge.isHiddenID
            
            // Populates scoreboardText: note forEach doesn't work with async callback function
            for (const [i, doc] of scoreboardData.entries()) {
                const player = await Player.findById(doc.playerID);
                const playerName = player?.name ?? 'undefined';
                const shownID = toShowId ? ` (${doc.playerID}) ` : ' ';

                embedArr.push({
                    name: '',
                    value: `\`${i + 1} ${playerName}${shownID}${doc.scoreValue}\`\n`,
                    inline: false
                })
            }

            const leaderboardEmbed = {
                color: EMBED_COLOUR_GEN,
                title: `Scoreboard of **${challenge.name}**`,
                fields: embedArr,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Page ${page + 1}`,
                    icon_url: interaction.user.displayAvatarURL()
                }
            }

            await interaction.editReply({ embeds: [leaderboardEmbed] });
            return;
        } catch (err) {
            if (err.message == "Challenge not found.") {
                await interaction.reply(err.message);
                return;
            } else {
                throw err;
            }
        }
	},
};
