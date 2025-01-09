const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { EASY_CD } = require('../../config.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('o-add-entry-m')
		.setDescription('Adds an entry to the Google Sheets (modal)'),
		
	async execute(interaction) {
		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('wordEntryModal')
			.setTitle('Add word to Sheets');

		// Add components to modal
		// Create the text input components
		const wordInput = new TextInputBuilder()
            .setMaxLength(20)
			.setCustomId('wordInput')
		    // The label is the prompt the user sees for this input
			.setLabel("Enter word")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const definitionInput = new TextInputBuilder()
			.setCustomId('definitionInput')
			.setLabel("Enter word definition")
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(wordInput);
		const secondActionRow = new ActionRowBuilder().addComponents(definitionInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);
	},
};
