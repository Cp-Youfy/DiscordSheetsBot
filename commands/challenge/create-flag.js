const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');
const { registerUser } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('create-flag')
		.setDescription('Add a flag to a challenge')
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
            if (interaction.user.id != ADMIN_ID && interaction.user.id != challenge.organiser) {
                await interaction.reply("Only the challenge organiser or bot owner can modify challenge fields.");
                return;
            }
    
            // Retrieve information on the challenge using a modal
            const modal = new ModalBuilder()
                .setCustomId('createFlagModal')
                .setTitle('Create a new flag');
    
            const flag = new TextInputBuilder()
                .setMaxLength(128)
                .setCustomId('flag')
                .setLabel("Flag")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const flagTitle = new TextInputBuilder()
                .setMaxLength(150)
                .setCustomId('flagTitle')
                .setLabel("Title of question")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const flagInfo = new TextInputBuilder()
                .setMaxLength(400)
                .setCustomId('flagInfo')
                .setLabel("Question details")
                .setRequired(true)
                .setStyle(TextInputStyle.Long);
                
            const value = new TextInputBuilder()
                .setCustomId('flagValue')
                .setLabel("Flag Value")
                .setPlaceholder("100")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const isLongAns = new TextInputBuilder()
                .setMaxLength(5)
                .setCustomId('isLongAns')
                .setLabel("Additional information (long answer) expected")
                .setPlaceholder("true | false")
                .setValue('false')
                .setStyle(TextInputStyle.Short);
                        
            // An action row only holds one text input,
            // so you need one action row per text input.
            const firstActionRow = new ActionRowBuilder().addComponents(flag);
            const secondActionRow = new ActionRowBuilder().addComponents(flagTitle);
            const thirdActionRow = new ActionRowBuilder().addComponents(flagInfo);
            const fourthActionRow = new ActionRowBuilder().addComponents(value);
            const fifthActionRow = new ActionRowBuilder().addComponents(isLongAns);

    
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);
    
            // Show the modal to the user
            await interaction.showModal(modal);
        } catch (error) {
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
