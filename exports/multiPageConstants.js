const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

async function generatePageEmbed() {
    return None
}

module.exports = {
    multiPageButtons,
    generatePageEmbed
}