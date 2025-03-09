const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOUR_GEN } = require('../CONSTANTS.json');

const multiPageButtons = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId('prev')
    .setLabel('PREV')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('⬅️'),
  new ButtonBuilder()
    .setCustomId('next')
    .setLabel('NEXT')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('➡️'),
  new ButtonBuilder()
    .setCustomId('mobile')
    .setLabel('MOBILE')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('📲'),
)

/**
 * Generates a single page embed object for puzzles. Displays 10 items per page.
 * Modification to fields such as title and footer may be required to suit context.
 * @param {Array} dataArray Array to slice data from
 * @param {Number} startIndex Start index to slice data (START FROM 1)
 */
async function generatePageEmbed(dataArray, page, challengeName) {
    const current = dataArray.slice(page * 10 - 10, page * 10)

    var embed = {
      color: EMBED_COLOUR_GEN,
      title: `PLACEHOLDER`,
      description: `
      Page ${page}
      `,
      footer: {
          text: `PLACEHOLDER` // Requested by ${interaction.user.username}
      },
      timestamp: new Date().toISOString(),
  };
}

            // const generateEmbed = async start => {
            // const current = guilds.slice(start, start + 10)

            // // You can of course customise this embed however you want
            // return new MessageEmbed({
            //     title: `Showing guilds ${start + 1}-${start + current.length} out of ${
            //     guilds.length
            //     }`,
            //     fields: await Promise.all(
            //     current.map(async guild => ({
            //         name: guild.name,
            //         value: `**ID:** ${guild.id}\n**Owner:** ${(await guild.fetchOwner()).user.tag}`
            //     }))
            //     )
            // })
            // }

module.exports = {
    multiPageButtons,
    generatePageEmbed
}