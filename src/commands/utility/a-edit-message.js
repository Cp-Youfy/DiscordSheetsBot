const { SlashCommandBuilder, ChannelType, DiscordAPIError } = require('discord.js');
const { EASY_CD, INTERACTION_DURATION } = require('../../CONSTANTS.json');

module.exports = {
    cooldown: EASY_CD,
    data: new SlashCommandBuilder()
        .setName('a-edit-message')
        // Checks done in interactionCreate.js
        .setDescription('(ADMINISTRATOR PERMS) Edit a message sent by the bot via a-send-message.')
        .addChannelOption(option => option
            .setName('msgchannel')
            .setDescription('Channel to search for the message ID in')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('messageid')
            .setDescription('Message ID of the target message (see footer)')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription('Title of the embed')
            .setMaxLength(256)
            .setRequired(true)
        ),

    async execute(interaction) {
        // await interaction.deferReply();

        // Returns TextChannel object
        const sourceChannelObj = interaction.options.getChannel('msgchannel') ?? null;

        // Retrieve the message object
        const messageId = interaction.options.getString('messageid') ?? null;
        const title = interaction.options.getString('title') ?? null;

        try {
            let messageObj = await sourceChannelObj.messages.fetch(messageId);

            // We need to retrieve the data as a plain object with .data as you cannot directly mutate the DiscordEmbed object
            let messageEmbed = messageObj.embeds[0].data

            // Collect the edited message
            await interaction.reply(`Enter the edited contents in a **single message**.`);

            // Retrieve the new message from the same channel
            const collectorFilter = (i) => i.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({
                filter: collectorFilter,
                time: INTERACTION_DURATION,
                max: 1
            });

            collector.on('collect', async (i) => {

                if (i.content.length > 4096) {
                    interaction.channel.send(`<@${interaction.user.id}>, your message exceeds the character length of 4096 characters. The original message has not been edited.`)
                    return;
                }

                messageEmbed.title = title
                messageEmbed.description = i.content;

                // Check that there is an image attached
                if (i.attachments?.size > 0) {
                    messageEmbed.image = { 'url': Array.from(i.attachments.values())[0].url }
                } else {
                    messageEmbed.image = {}
                }

                await messageObj.edit({ embeds: [messageEmbed] })

            });

            collector.on('end', async () => {
                if (collector.endReason == 'time') {
                    // Message was not received in time
                    interaction.channel.send(`<@${interaction.user.id}>, your message was not received in time. The time limit is ${INTERACTION_DURATION / 1000} seconds. The original message was not edited.`)
                    return;
                }
                if (collector.endReason == 'limit') {
                    // Message was sent successfully
                    interaction.channel.send(`<@${interaction.user.id}>, your message (ID ${messageId}) was edited successfully.`);
                    return;
                }
            });

        } catch (error) {
            // Catch the situation where the message was not found.
            if (error.code == 10008) {
                await interaction.reply(`<@${interaction.user.id}>, the message was not found. Check that the message ID has no extra spaces, and the channel selected is the one the message was sent in.`)
                return
            }
            else {
                // Some other error
                throw error
            }
        }
    },
};
