const { SlashCommandBuilder } = require('discord.js');
const { EXTREME_CD, EMBED_COLOUR_GEN } = require('../../CONSTANTS.json');
const { addPoints, findLongAns, findFlag, findChallenge } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EXTREME_CD,
	data: new SlashCommandBuilder()
		.setName('validate')
		.setDescription('Validate a long answer submission (challenges)')
        .addStringOption(option =>
            option.setName('long_ans_id')
                .setDescription('Unique ID identifier of long answer submission')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('points')
                .setDescription('Points to add (0 for wrong submission)')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('feedback')
                .setDescription('Additional feedback for rejection (optional)')
                .setRequired(false)
        ),
	async execute(interaction) {
        try {
            const longAnsID = interaction.options.getString('long_ans_id') ?? null;
            const pointsToAdd = interaction.options.getString('points') ?? null;
            const feedback = interaction.options.getString('feedback') ?? "None";

            function isInteger(value) {
                if(parseInt(value,10).toString() === value) {
                  return true
                }
                return false;
            }

            const longAnsSubmission = await findLongAns(longAnsID);
            const flag = await findFlag(longAnsSubmission.flagID);
            const playerID = longAnsSubmission.playerID;
            const challengeID = longAnsSubmission.challengeID;
            const challenge = await findChallenge(challengeID)

            if (!(interaction.member.roles.cache.has(challenge.puzzleMakerID))) {
                await interaction.reply("You are not a puzzle maker and lack permissions to use this command.");
                return;
            }

            if (!(isInteger(pointsToAdd))) {
                await interaction.reply("The points value has to be an integer.");
                return;
            }

            if (feedback.length > 1800) {
                await interaction.reply("Feedback must be 1800 characters or less.");
                return;
            }

            const res = await addPoints(pointsToAdd, challengeID, playerID);

            if (res != 'Points modified successfully.') {
                await interaction.reply("Points were not updated successfully.");
                return;
            }

            // DM user results
            var embed = {
                color: EMBED_COLOUR_GEN,
                title: `Long answer submission for ${flag.flagTitle}`,
                description: `
                **ID** ${longAnsID}
                **Points added** ${pointsToAdd} (0: long answer was not accepted)
                **Additional Feedback** ${feedback}

                For any disputes, please open a ticket.
                `,
                footer: {
                    text: `Checked by ${interaction.user.username}`
                },
                timestamp: new Date().toISOString(),
            };

            const user = interaction.client.users.cache.find((user) => user.id === playerID)
            var userDisplayName = ''
            if (user != null) {
                userDisplayName = user.displayName;
            }
            else { // user was not cached
                userDisplayName = playerID
            }
            interaction.client.users.send(playerID, { embeds: [embed] });

            await interaction.reply(`Validation for ${longAnsID} by <@${interaction.user.id}> to ${userDisplayName} successful.`);
            return;
        } catch (err) {
            if (err.message == "Invalid long answer ID format" || err.message == 'Long answer entry not found') {
                await interaction.reply(err.message);
                return;
            } else {
                throw err;
            }
        }
	},
};
