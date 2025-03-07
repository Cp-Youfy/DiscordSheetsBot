const { SlashCommandBuilder } = require('discord.js');
const { EXTREME_CD } = require('../../CONSTANTS.json');
const { ADMIN_ID } = require('../../config.json')
const { addPoints, findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EXTREME_CD,
	data: new SlashCommandBuilder()
		.setName('add-points')
		.setDescription('Add points to user (organiser or bot owner only)')
        .addStringOption(option =>
            option.setName('challenge_id')
                .setDescription("Challenge name or ID")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_id')
                .setDescription('Discord ID of member to modify points of')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('points')
                .setDescription('Points to add (negative values accepted)')
                .setRequired(true),
        ),
	async execute(interaction) {
        try {
            const challengeID = interaction.options.getString('challenge_id') ?? null;
            const discordID = interaction.options.getString('player_id') ?? null;
            const pointsToAdd = interaction.options.getString('points') ?? null;

            const challenge = await findChallenge(challengeID);

            function isInteger(value) {
                if(parseInt(value,10).toString() === value) {
                  return true
                }
                return false;
            }
            
            if (interaction.user.id != ADMIN_ID && interaction.user.id != challenge.organiser) {
                await interaction.reply("Only the challenge organiser or bot owner can modify points.");
                return;
            }

            if (!(isInteger(pointsToAdd))) {
                await interaction.reply("The points value has to be an integer.");
                return;
            }

            const res = await addPoints(pointsToAdd, challenge.id, discordID);

            if (res != 'Points modified successfully.') {
                await interaction.reply(res);
                return;
            }

            await interaction.reply(`Points addition for ${discordID} by <@${interaction.user.id}> successful.`);
            return;

        } catch (err) {
            if (err.message == 'Challenge not found.') {
                await interaction.reply(err.message)
            } else {
                throw err;
            }
        }
	},
};
