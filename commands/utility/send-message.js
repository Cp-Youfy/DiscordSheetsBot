const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD, INTERACTION_DURATION } = require('../../CONSTANTS.json');

module.exports = {
	cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('send-message')
		.setDescription('Sends a message in the specified channel via the bot.')
		.addStringOption(option =>
            option.setName('channelid')
                .setDescription('Channel ID')
                .setRequired(true),
        )
		.addStringOption(option =>
			option.setName('showmessageid')
				.setDescription('Display message ID below contents (true | false for anything else)')
				.setRequired(true)
		),
		
	async execute(interaction) {
		// await interaction.deferReply();

		// Initial prompt
		const channelID = interaction.options.getString('channelid') ?? null;
		const showMessageID = interaction.options.getString('showmessageid') ?? null;

		const isShowID = showMessageID === 'true' ? true : false

		const channelToSendTo = interaction.client.channels.cache.get(channelID);
		await interaction.reply(`Enter the message to send to <#${channelID}> below in a **single message**.`);
		
		// Retrieve the new message from the same channel
		const collectorFilter = (i) => i.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({ 
			filter: collectorFilter, 
			time: INTERACTION_DURATION,
			max: 1
		});

		collector.on('collect', async (i) => {
			const sentMessage = await channelToSendTo.send(i.content);
			if (isShowID) {
				await sentMessage.edit(`${sentMessage.content}\n\nMessage ID: ${sentMessage.id}`)
			}
		});

		collector.on('end', async () => {
			if (collector.endReason == 'time') {
				// Message was not received in time
				interaction.channel.send(`<@${interaction.user.id}>, your message was not received in time. The time limit is ${INTERACTION_DURATION / 1000} seconds.`)
			}
			if (collector.endReason == 'limit') {
				// Message was sent successfully
				interaction.channel.send(`<@${interaction.user.id}>, your message was sent to <#${channelID}>.\nMessage ID shown: ${isShowID}`);
			}			
		});
	},
};
