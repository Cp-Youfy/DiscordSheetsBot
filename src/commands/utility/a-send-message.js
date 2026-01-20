const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { MEDIUM_CD, INTERACTION_DURATION, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json');

module.exports = {
	cooldown: MEDIUM_CD,
	data: new SlashCommandBuilder()
		.setName('a-send-message')
		// Checks done in interactionCreate.js
		.setDescription('(ADMINISTRATOR PERMS) Sends an embed message in the specified channel via the bot.')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('Channel to send message embed in')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('title')
			.setDescription('Title of the embed')
			.setMaxLength(256)
			.setRequired(true)
		),

	async execute(interaction) {
		// Initial prompt
		// Returns TextChannel object
		const channelObj = interaction.options.getChannel('channel') ?? null;
		const title = interaction.options.getString('title') ?? null;

		// Setup embed
		var messageEmbed = {
			color: EMBED_COLOUR_GEN,
			author: {
				name: interaction.user.username,
				icon_url: interaction.user.displayAvatarURL(),
			},
			title: `${title}`,
			timestamp: new Date().toISOString(),
			footer: { 'text': '' }
		}

		await interaction.reply(`Enter the message to send to <#${channelObj.id}> below in a **single message**.`);

		// Retrieve the new message from the same channel
		const collectorFilter = (i) => i.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({
			filter: collectorFilter,
			time: INTERACTION_DURATION,
			max: 1
		});

		collector.on('collect', async (i) => {
			console.log('a')

			if (i.content.length > 4096) {
				interaction.channel.send(`<@${interaction.user.id}>, your message exceeds the character length of 4096 characters and has not been sent.`)
				return;
			}

			messageEmbed.description = i.content;
			messageEmbed.image = { 'url': Array.from(i.attachments.values())[0].url }

			const sentMessage = await channelObj.send({ 'embeds': [messageEmbed] });

			messageEmbed.footer.text = `Message ID: ${sentMessage.id}`;

			await sentMessage.edit({ 'embeds': [messageEmbed] })
		});

		collector.on('end', async () => {
			if (collector.endReason == 'time') {
				// Message was not received in time
				interaction.channel.send(`<@${interaction.user.id}>, your message was not received in time. The time limit is ${INTERACTION_DURATION / 1000} seconds.`)
				return;
			}
			if (collector.endReason == 'limit') {
				// Message was sent successfully
				interaction.channel.send(`<@${interaction.user.id}>, your message was sent to <#${channelObj.id}>.`);
				return;
			}
		});
	},
};
