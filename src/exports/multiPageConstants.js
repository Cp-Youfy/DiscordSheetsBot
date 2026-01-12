const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOUR_GEN, BOT_NAME } = require('../CONSTANTS.json');

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
    .setEmoji('➡️')
)



/* Copy-paste code for reference. NOT FOR EXPORT (interaction required) */
// Collector interaction should be from the same user
const collectorFilter = (i) => i.user.id === interaction.user.id

// new interaction collected is i
const buttonFilter = (i) => {
  return (i.customId == 'prev' ||
  i.customId == 'next') && 
  i.user.id === interaction.user.id
}

module.exports = {
    multiPageButtons
}