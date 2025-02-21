const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { EASY_CD } = require('../../CONSTANTS.json');
const { ADMIN_ID } = require('../../config.json')
const { findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('create-flag')
		.setDescription('Add a puzzle to a challenge')
        .addStringOption(option =>
            option.setName('challenge')
                .setDescription('Challenge ID or Name (case sensitive)')
                .setRequired(true),
        ),
	async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challenge') ?? null;

            if (challengeID == null) {
                await interaction.reply("A challenge ID must be specified (case sensitive). You can find the challenge ID by displaying the challenge using `challenge display`.");
                return;
            }

            const challenge = await findChallenge(challengeID);
            // Sanitising challengeID to avoid directly putting user input into modal custom ID
            if (interaction.user.id != ADMIN_ID && interaction.user.id != challenge.organiser) {
                await interaction.reply("Only the challenge organiser or bot owner can add puzzles.");
                return;
            }
    
            // Retrieve information on the challenge using a modal
            const modal = new ModalBuilder()
                .setCustomId(`createFlagModal${challenge._id}`)
                .setTitle('Create a new flag');
    
            const flag = new TextInputBuilder()
                .setMaxLength(128)
                .setCustomId('flagInput')
                .setLabel("Flag")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const flagTitle = new TextInputBuilder()
                .setMaxLength(150)
                .setCustomId('flagTitleInput')
                .setLabel("Title of puzzle")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const flagInfo = new TextInputBuilder()
                .setMaxLength(400)
                .setCustomId('flagInfoInput')
                .setLabel("Puzzle details")
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph);
                
            const value = new TextInputBuilder()
                .setCustomId('flagValueInput')
                .setLabel("Flag Value")
                .setPlaceholder("100")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const submissionOpenDate = new TextInputBuilder()
                .setMaxLength(19)
                .setCustomId('submissionOpenDateInput')
                .setLabel("Start Date (YYYY-MM-DDTHH:MM:SS)")
                .setPlaceholder("YYYY-MM-DDTHH:MM:SS")
                .setStyle(TextInputStyle.Short);
                        
            // An action row only holds one text input,
            // so you need one action row per text input.
            const firstActionRow = new ActionRowBuilder().addComponents(flag);
            const secondActionRow = new ActionRowBuilder().addComponents(flagTitle);
            const thirdActionRow = new ActionRowBuilder().addComponents(flagInfo);
            const fourthActionRow = new ActionRowBuilder().addComponents(value);
            const fifthActionRow = new ActionRowBuilder().addComponents(submissionOpenDate);

    
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);
    
            // Show the modal to the user
            await interaction.showModal(modal);
        } catch (err) {
            if (err.message == "Challenge not found.") {
                await interaction.reply(err.message);
                return;
            } else {
                // Default error handling behaviour for unexpected errors
                throw new Error(err.message);
            }
        }
	},
};
