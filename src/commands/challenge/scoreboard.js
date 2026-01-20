const { SlashCommandBuilder } = require('discord.js');
const { multiPageButtons } = require('../../exports/multiPageConstants.js')
const { HARD_CD, ENTRIES_PER_PAGE, EMBED_COLOUR_GEN, INTERACTION_DURATION } = require('../../CONSTANTS.json');
const { findChallenge } = require('../../exports/databaseMethods.js');
const { Scoreboard, Player } = require('../../exports/challengeSchemas');

// Derive page spans
const MAX_PAGE = Math.ceil(100 / ENTRIES_PER_PAGE) - 1;

// multi-page embeds inspired by https://github.com/Ai0796/RoboNene/blob/master/client/commands/leaderboard.js with reference to https://discordjs.guide/popular-topics/collectors.html
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
            var start = 0;
            var end = ENTRIES_PER_PAGE;
            const lastPage = Math.ceil(scoreboardData.length / ENTRIES_PER_PAGE) - 1
            var embedArr = [];
            const toShowId = !challenge.isHiddenID;

            var slicedData = scoreboardData.slice(start, end)

            // Populates scoreboardText: note forEach doesn't work with async callback function
            for (let i = 0; i < slicedData.length; i++) {
                // Declare the variables in each loop
                const doc = slicedData[i]

                const player = await Player.findById(doc.playerID);
                const playerName = player?.name ?? 'undefined';
                const shownID = toShowId ? ` (${doc.playerID}) ` : ' ';

                embedArr.push({
                    name: '',
                    value: `${(i + 1) + page * ENTRIES_PER_PAGE}. ${playerName}${shownID}${doc.scoreValue}\n`,
                    inline: false
                })
            }

            var leaderboardEmbed = {
                color: EMBED_COLOUR_GEN,
                title: `Scoreboard of **${challenge.name}**`,
                fields: embedArr,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Page ${page + 1}`,
                    icon_url: interaction.user.displayAvatarURL()
                }
            }

            const components = multiPageButtons
            const scoreboardRes = await interaction.editReply({
                embeds: [leaderboardEmbed],
                components: [components],
                fetchReply: true
            });

            // Multi-page functionality
            const buttonFilter = (i) => {
                return (i.customId == 'prev' ||
                    i.customId == 'next') &&
                    i.user.id === interaction.user.id
            };

            const collector = scoreboardRes.createMessageComponentCollector({
                filter: buttonFilter,
                time: INTERACTION_DURATION,
            });

            collector.on('collect', async (i) => {
                if (i.customId === 'prev') {
                    // Go to the previous page
                    if (page == 0) {
                        page = lastPage;
                    } else {
                        page -= 1;
                    };
                };

                if (i.customId === 'next') {
                    // Go to the next page
                    if (page == lastPage) {
                        page = 0;
                    } else {
                        page += 1;
                    };
                };

                // Start and end indexes of the array of scoreboard data
                start = page * ENTRIES_PER_PAGE;
                end = Math.min(start + ENTRIES_PER_PAGE, lastPage * ENTRIES_PER_PAGE + ENTRIES_PER_PAGE);

                // Reset slicedData and embedArr for the new leaderboard
                slicedData = scoreboardData.slice(start, end);
                embedArr = []

                // Populates scoreboardText: note forEach doesn't work with async callback function
                for (let i = 0; i < slicedData.length; i++) {
                    // Declare the variables in each loop
                    const doc = slicedData[i]

                    const player = await Player.findById(doc.playerID);
                    const playerName = player?.name ?? 'undefined';
                    const shownID = toShowId ? ` (${doc.playerID}) ` : ' ';

                    embedArr.push({
                        name: '',
                        value: `${(i + 1) + page * ENTRIES_PER_PAGE}. ${playerName}${shownID}${doc.scoreValue}\n`,
                        inline: false
                    })
                }

                leaderboardEmbed = {
                    color: EMBED_COLOUR_GEN,
                    title: `Scoreboard of **${challenge.name}**`,
                    fields: embedArr,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Page ${page + 1}`,
                        icon_url: interaction.user.displayAvatarURL()
                    }
                };

                await i.update({
                    embeds: [leaderboardEmbed],
                    components: [components]
                });
            });

            // Stops receiving input: Removes the buttons
            collector.on('end', async () => {
                await interaction.editReply({
                    embeds: [leaderboardEmbed],
                    components: []
                });
            })

            return;
        } catch (err) {
            if (err.message == "Challenge not found.") {
                await interaction.editReply(err.message);
                return;
            } else {
                throw err;
            }
        }
    },
};
