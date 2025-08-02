const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { EASY_CD } = require('../../CONSTANTS.json');
const { ADMIN_IDS } = require('../../config.json')
const { Flag } = require('../../exports/challengeSchemas.js');
const { findFlag, findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('modify-flag')
		.setDescription('Modify flag parameters')
        .addStringOption(option =>
            option.setName('flag_id')
                .setDescription('Flag ID')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('flag_param')
                .setDescription('Flag param to modify')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('param_value')
                .setDescription('Value of param')
                .setRequired(true)
        ),

	async execute(interaction) {
        try {
            const flagID = interaction.options.getString('flag_id') ?? null;
            const flagParam = interaction.options.getString('flag_param') ?? null;
            const paramValue = interaction.options.getString('param_value') ?? null;

            if (flagID == null) {
                await interaction.reply("A flag ID is required. Use `/display-puzzles <challengeID>` for puzzle details of all puzzles in a challenge.");
                return;
            }

            const flagDoc = await findFlag(flagID);
            const challenge = await findChallenge(flagDoc.challengeID)

            // Check if param is valid            
            if (!(['challengeID', 'flag', 'flagTitle', 'flagInfo', 'isLongAns', 'value', 'submissionOpenDate'].includes(flagParam))) {
                await interaction.reply("Invalid flag parameter (`challengeID`, `flag`, `flagTitle`, `flagInfo`, `isLongAns`, `value`, `submissionOpenDate`)");
                return;
            }
            
            if (!ADMIN_IDS.includes(interaction.user.id) && interaction.user.id != challenge.organiser) {
                await interaction.reply("Only the challenge organiser or bot owner can modify puzzles.");
                return;
            }
    
            if (flagParam == 'isLongAns' && !(['true', 'false'].includes(paramValue))) {
                await interaction.reply("isLongAns has to be one of these values (case sensitive): true | false");
                return;
            }

            // Typecasting stuff
            if (flagParam == 'submissionOpenDate') {
                try {
                    const submissionOpenDateProc = new Date(paramValue);
                    flagDoc[flagParam] = submissionOpenDateProc;
                    await flagDoc.save();
                    await interaction.reply("Field changed successfully.");
                    return;

                } catch (err) {
                    await interaction.reply("Date input could not be parsed properly.");
                    return;
                }
            }

            if (flagParam == 'isLongAns') {
                try {
                    const isLongAnsBool = (paramValue === 'true');
                    flagDoc[flagParam] = isLongAnsBool;
                    await flagDoc.save();
                    await interaction.reply(`Field changed successfully to ${isLongAnsBool} (true / false)`);
                    return;

                } catch (err) {
                    await interaction.reply("Boolean input could not be parsed properly.");
                    return;
                }
            }

            flagDoc[flagParam] = paramValue;

            await flagDoc.save();
            await interaction.reply("Field changed successfully.");
            return;

        } catch (err) {
            if (err.message == "Flag not found." || err.message == "Invalid flag ID format") {
                await interaction.reply(err.message);
                return;
            } else {
                // Default error handling behaviour for unexpected errors
                throw new Error(err.message);
            }
        }
	},
};
