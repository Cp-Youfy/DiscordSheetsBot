const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HARD_CD, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json');
const { findChallenge, findFlagsByChallengeID } = require('../../exports/databaseMethods.js');
const { Scoreboard, Player } = require('../../exports/challengeSchemas');

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('view-puzzles')
		.setDescription('View all puzzles with ID of a certain challenge')
        .addStringOption(option =>
            option.setName('challenge_id')
                .setDescription('Challenge Name or ID')
                .setRequired(true),
            ),	
	async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challenge_id') ?? null;
            const challenge = await findChallenge(challengeID);
            const flagsDocLst = await findFlagsByChallengeID(challengeID);

            if (flagsDocLst == "No flags found for the specified challenge.") {
                await interaction.reply(flagsDocLst);
                return;
            }

            await interaction.reply("WIP");

            // const {author, channel} = message
            // const guilds = [...client.guilds.cache.values()]

            // /**
            //  * Creates an embed with guilds starting from an index.
            //  * @param {number} start The index to start from.
            //  * @returns {Promise<MessageEmbed>}
            //  */


            // // Send the embed with the first 10 guilds
            // const canFitOnOnePage = guilds.length <= 10
            // const embedMessage = await channel.send({
            // embeds: [await generateEmbed(0)],
            // components: canFitOnOnePage
            //     ? []
            //     : [new MessageActionRow({components: [forwardButton]})]
            // })
            // // Exit if there is only one page of guilds (no need for all of this)
            // if (canFitOnOnePage) return

            // // Collect button interactions (when a user clicks a button),
            // // but only when the button as clicked by the original message author
            // const collector = embedMessage.createMessageComponentCollector({
            // filter: ({user}) => user.id === author.id
            // })

            // let currentIndex = 0
            // collector.on('collect', async interaction => {
            // // Increase/decrease index
            // interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
            // // Respond to interaction by updating message with new embed
            // await interaction.update({
            //     embeds: [await generateEmbed(currentIndex)],
            //     components: [
            //     new MessageActionRow({
            //         components: [
            //         // back button if it isn't the start
            //         ...(currentIndex ? [backButton] : []),
            //         // forward button if it isn't the end
            //         ...(currentIndex + 10 < guilds.length ? [forwardButton] : [])
            //         ]
            //     })
            //     ]
            // })
            // })

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
