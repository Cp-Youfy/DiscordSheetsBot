const { Collection, Events } = require('discord.js');
const { EASY_CD, ADMIN_ID, LOG_CHANNEL_ID } = require('../config.json');
const { addEntry } = require('../exports/sheetMethods.js');
const { createChallenge, joinChallenge } = require('../exports/databaseMethods.js')

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        // Logging command
        const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID);

        if (interaction.member != null) {
            logChannel.send({content: `User ${interaction.member.user.username} (ID: ${interaction.member.user.id}) used command ${interaction.commandName} in server ${interaction.guild.name} (ID: ${interaction.guild.id})`});
        }
        else { // DMs
            logChannel.send({content: `User ${interaction.user.username} (ID: ${interaction.user.id}) used command ${interaction.commandName} in DMs`});
        }

        // Handling modals
        if (interaction.isModalSubmit()) {
            try {
                if (interaction.customId === 'wordEntryModal') {
                    const wordStr = interaction.fields.getTextInputValue('wordInput');
                    const definitionStr = interaction.fields.getTextInputValue('definitionInput');

                    res = await addEntry(wordStr, definitionStr);
                    await interaction.reply(res);
                    return;
                }
                if (interaction.customId === 'createChallengeModal') {
                    const name = interaction.fields.getTextInputValue('nameInput');
                    const organiser = interaction.fields.getTextInputValue('organiserInput');
                    const startDate = interaction.fields.getTextInputValue('startDateInput');
                    const duration = interaction.fields.getTextInputValue('durationInput');
                    const longAnsChannelID = interaction.fields.getTextInputValue('longAnsChannelIDInput');
                    const res = await createChallenge(name, organiser, startDate, duration, longAnsChannelID);
                    await interaction.reply(res)
                    return;
                }
            } catch (err) {
                console.error(err);
                logChannel.send({content: `**ERROR [MODAL]** (${interaction.customId}) | ${err}`});
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while processing this modal!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while processing this modal!', ephemeral: true });
                }
            }
        }

        // Handling commands
		if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        // Checks if command exists in the client.commands Collection
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (interaction.commandName.startsWith('o-') && interaction.user.id != ADMIN_ID) {
            await interaction.reply({ content: 'Only bot admin can use this command!', ephemeral: true })
            return;
        }

        // Handle command cooldowns
        const { cooldowns } = interaction.client;

        // ADMIN_ID immune to cooldown
        if (interaction.user.id != ADMIN_ID) {
            // If command not already on cooldown, add a new entry to the cooldowns Collection
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            // Calculates how long more before cooldown is over
            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = EASY_CD;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

            if (timestamps.has(interaction.user.id)) {
                // Get the time where the command was last executed and add the cooldown duration of the command
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1_000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
                }
            }

            // Deletes expired cooldowns from the collection
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (error.message == "BotOwnerOnly") {
                await interaction.reply({ content: 'Only bot admin can use this command!', ephemeral: true })
                return;
            }
            logChannel.send({content: `**ERROR [COMMAND]** (${interaction.commandName}) | ${error}`});
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
    return;
},
};
