const { SlashCommandBuilder, ChannelType } = require('discord.js');
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
        ),

    async execute(interaction) {
        // await interaction.deferReply();

        // Returns TextChannel object
        const sourceChannelObj = interaction.options.getChannel('msgchannel') ?? null;

        // Retrieve the message object
        const messageId = interaction.options.getString('messageid') ?? null;

        let messageObj = await sourceChannelObj.messages.fetch(messageId);

        console.log(messageObj)

        await interaction.reply("WIP")
    },
};
