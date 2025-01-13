const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { HARD_CD, ADMIN_ID } = require('../../config.json');

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('challenge')
		.setDescription('Create or modify challenges')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('create | modify | display | join | help')
                .setRequired(true),
            ),	
	async execute(interaction) {
        // await interaction.reply("Command under maintenance");
        // return;
        const option = interaction.options.getString('option') ?? null;
        if (option == 'create') {
            if (interaction.user.id != ADMIN_ID) {
                // Handled under interactionCreate.js
                throw new Error("BotOwnerOnly");
            }
    
            // Retrieve information on the challenge using a modal
            const modal = new ModalBuilder()
                .setCustomId('createChallengeModal')
                .setTitle('Create a new challenge');
    
            const name = new TextInputBuilder()
                .setMaxLength(100)
                .setCustomId('nameInput')
                .setLabel("Challenge Name")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const organiser = new TextInputBuilder()
                .setMaxLength(18)
                .setCustomId('organiserInput')
                .setLabel("Discord ID of challenge organiser")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const startDate = new TextInputBuilder()
                .setMaxLength(19)
                .setCustomId('startDateInput')
                .setLabel("Start Date (YYYY-MM-DDTHH:MM:SS)")
                .setPlaceholder("YYYY-MM-DDTHH:MM:SS")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
                
            const duration = new TextInputBuilder()
                .setCustomId('durationInput')
                .setLabel("Duration (ms)")
                .setPlaceholder("Use conv-duration command if needed")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            
            const longAnsChannelID = new TextInputBuilder()
                .setMaxLength(25)
                .setCustomId('longAnsChannelIDInput')
                .setLabel("Channel ID where long answers should be sent")
                .setPlaceholder("string | null (disable) long answers)")
                .setValue('null')
                .setStyle(TextInputStyle.Short);
                        
            // An action row only holds one text input,
            // so you need one action row per text input.
            const firstActionRow = new ActionRowBuilder().addComponents(name);
            const secondActionRow = new ActionRowBuilder().addComponents(organiser);
            const thirdActionRow = new ActionRowBuilder().addComponents(startDate);
            const fourthActionRow = new ActionRowBuilder().addComponents(duration);
            const fifthActionRow = new ActionRowBuilder().addComponents(longAnsChannelID);

    
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);
    
            // Show the modal to the user
            await interaction.showModal(modal);
        }
        else if (option == 'modify') {
            await interaction.reply("WIP");
            return;
        }
        else if (option == 'display') {
            await interaction.reply("WIP");
            return;
        }
        else if (option == 'join') {
            await interaction.reply("WIP");
            return;
        }
        else if (option == 'help') {
            await interaction.reply("WIP");
            return;
        }
        else {
            await interaction.reply("Invalid option (create | modify | display | join | help). Use the `help` option for details on this command.");
            return;
        }
	},
};
