const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ADMIN_ID } = require('../../config.json');
const { HARD_CD, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json')
const { findChallenge, joinChallenge } = require('../../exports/databaseMethods.js')
const { Challenge } = require('../../exports/challengeSchemas.js');

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('challenge')
		.setDescription('Create or modify challenges')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('create | modify | display | join | help')
                .setRequired(true),
            )
        .addStringOption(option =>
            option.setName('param1')
                .setDescription('required for some options')
                .setRequired(false),
            )
        .addStringOption(option =>
            option.setName('param2')
                .setDescription('required for some options')
                .setRequired(false),
            )
        .addStringOption(option =>
            option.setName('param3')
                .setDescription('required for some options')
                .setRequired(false),
            ),	
	async execute(interaction) {
        const option = interaction.options.getString('option') ?? null;
        const param1 = interaction.options.getString('param1') ?? null;
        const param2 = interaction.options.getString('param2') ?? null;
        const param3 = interaction.options.getString('param3') ?? null;
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
            if (param1 == null) {
                await interaction.reply("A challenge ID must be specified (case sensitive). You can find the challenge ID by displaying the challenge using `challenge display`.");
                return;
            }
            if (param2 == null) {
                await interaction.reply("A field must be specified (case sensitive).");
                return;
            }
            if (param3 == null) {
                await interaction.reply("A value must be specified (case sensitive).");
                return;
            }
            try {
                const challenge = await findChallenge(param1);
                if (interaction.user.id != challenge.organiser && interaction.user.id != ADMIN_ID) {
                    await interaction.reply("Only the challenge organiser or bot owner can modify challenge fields.");
                    return;
                }
                const field = param2;
                if (!(['name', 'organiser', 'startDate', 'duration', 'isHiddenID', 'longAnsChannelID', 'isOpen', 'logChannelID', 'isTargeted', 'isFirstBlood', 'isBonusTimeLimit', 'puzzleMakerID'].includes(field))) {
                    await interaction.reply("Invalid field specified. See `<field>` section for allowed fields and ensure case is accurate.");
                    return;
                }

                const value = param3;

                // Deal with boolean fields separately since typecasting is garbage for those
                if (field == 'isTargeted' || field == 'isOpen' || field == 'isBonusTimeLimit' || field == 'isFirstBlood') {
                    const modValue = (value === 'true');
                    challenge[field] = modValue;
                    await challenge.save();
                    await interaction.reply(`Field changed successfully to ${modValue} (true/false)`);
                    return;
                }

                challenge[field] = value;
                
                await challenge.save();
                await interaction.reply("Field changed successfully.");
                return;

            } catch (err) {
                if (err.message == "Challenge not found." || err.message == "Field was not updated correctly.") {
                    await interaction.reply(err.message);
                    return;
                } else {
                    // Default error handling behaviour for unexpected errors
                    throw new Error(err.message);
                }
            }
        }
        else if (option == 'display') {
            if (param1 == null) {
                await interaction.reply("A challenge name or ID must be specified (case sensitive).");
                return;
            }
            try {
                const challenge = await findChallenge(param1);
                const duration = challenge.duration; 
                
                // Calculating the end date
                const date = new Date(challenge.startDate.getTime() + duration); 
                const endDate = date.toString();

                var embed = {
                    color: EMBED_COLOUR_GEN,
                    title: `Details of challenge ${challenge.name}`,
                    description: `
                    **ID** ${challenge.id}
                    **Name** ${challenge.name}
                    **Organiser ID** ${challenge.organiser}
                    **Start Date** ${challenge.startDate}
                    **End Date** ${endDate}
                    **Duration** ${(duration / 3600000).toFixed(3)} hours (3dp)
                    **isHiddenID** ${challenge.isHiddenID}
                    **longAnsChannelID** ${challenge.longAnsChannelID}
                    **isOpen** ${challenge.isOpen}
                    **dateCreated** ${challenge.dateCreated}
                    **logChannelID** ${challenge.logChannelID}
                    **isTargeted** ${challenge.isTargeted}
                    **isFirstBlood** ${challenge.isFirstBlood}
                    **isBonusTimeLimit** ${challenge.isBonusTimeLimit}
                    `,
                    footer: {
                        text: '❓ Use `/challenge help` for details on each field.'
                    },
                    timestamp: new Date().toISOString(),
                };
    
                await interaction.reply({ embeds: [embed] });
                return;
            } catch (err) {
                if (err.message == "Challenge not found.") {
                    await interaction.reply(err.message);
                    return;
                } else {
                    // Default error handling behaviour for unexpected errors
                    throw new Error(err.message);
                }
            }
        }
        else if (option == 'join') {
            if (param1 == null) {
                await interaction.reply("A challenge name or ID must be specified (case sensitive).");
                return;
            }
            try {
                const challenge = await findChallenge(param1);
                await joinChallenge(challenge.id, interaction.user.id);
                await interaction.reply("Challenge joined successfully.");
                return;
            } catch (err) {
                if (err.message == "The specified challenge has ended." || err.message == "Player has not registered. Use `/register` to register." || err.message == "Challenge not found." || err.message == "Player has already joined the specified challenge." || err.message == "The specified challenge is not currently open.") {
                    await interaction.reply(err.message);
                    return;
                } else {
                    // Default error handling behaviour for unexpected errors
                    throw new Error(err.message);
                }
            }
        }
        else if (option == 'help') {
            // NOTE: TODO help for individual params
            paramsArr = [
                {
                    name: 'create',
                    value: '**Syntax** `/challenge create`\n**Restrictions** Bot owner\n**Usage** Creates a new challenge'
                },
                {
                    name: 'modify',
                    value: '**Syntax** `/challenge modify <challengeID> <field> <value>`\n**Restrictions** Bot owner, challenge organiser\n**Usage** Modifies specified parameter of challenge\nSee `<field>` section for allowed fields.'
                },
                {
                    name: 'display',
                    value: '**Syntax** `/challenge display <challengeName | challengeID>`\n**Restrictions** None\n**Usage** Displays details of the specified challenge'
                },
                {
                    name: 'join',
                    value: '**Syntax** `/challenge join <challengeName | challengeID>`\n**Restrictions** None\n**Usage** Joins a challenge (if it is open)'
                },
                {
                    name: '<field>',
                    value: 'id (UNCHANGEABLE -- uniquely and randomly generated) | name | organiser (bot owner only) | startDate | duration | isHiddenID (whether Discord IDs of players should be shown on the leaderboard) | longAnsChannelID (channel ID where long answers should be sent; null to disable long answers) | logChannelID (channel ID to send submissions, etc.) | isOpen (whether new players can join the challenge -- does NOT affect ability to submit puzzles; that is determined by `startDate` and `duration`) | isTargeted (whether flag submissions must be targeted to a specific puzzle) | isBonusTimeLimit (whether bonus is awarded for submission within a time limit) | isFirstBlood (whether first blood multiplier is applied)'
                }
            ]

            var embed = {
                color: EMBED_COLOUR_GEN,
                title: 'Help',
                timestamp: new Date().toISOString(),
            };
            
            if (param1 == null && param2 == null) {
                embed.fields = paramsArr
            }

            await interaction.reply({ embeds: [embed] });
            return;
        }
        else {
            await interaction.reply("Invalid option (create | modify | display | join | help). Use the `help` option for details on this command.");
            return;
        }
	},
};
