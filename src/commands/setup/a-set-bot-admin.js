const spacetime = require('spacetime')
const assert = require('assert')

const { SlashCommandBuilder } = require('discord.js');
const { MEDIUM_CD } = require('../../CONSTANTS.json');
const { SUPPORT_MSG } = require('../../exports/TEMPLATE_MESSAGES.json')
const { addServerBotAdmin } = require('../../exports/databaseMethods.js')


module.exports = {
    cooldown: MEDIUM_CD,
    data: new SlashCommandBuilder()
        .setName('a-set-bot-admin')
        // Admin checks are done in interactionCreate using the a- prefix
        .setDescription('(ADMINISTRATOR PERMS) Set allowed role for sensitive bot commands.')
        .addStringOption(option =>
            option.setName('roleid')
                .setDescription('Role ID / @role to set to | blank to reset | "show" to display current botAdmin')
                .setRequired(false)
            ),

    async execute(interaction) {

        var roleID = interaction.options.getString('roleid') ?? null;
        const serverID = interaction.guild.id;

        try {

        if (!roleID) {
            // Resets the role ID
            const res = await addServerBotAdmin(serverID, null);
            if (res == null) {
                await interaction.reply(`BotAdmin has not been set before and/or was not found in the database. Reset unsuccessful.`);
                return;
            } else {
                await interaction.reply(`The BotAdmin role of <@&${res.roleID}> has been cleared.`)
                return;
            }
        }

        // Parse mention if it was a role mention: https://v13.discordjs.guide/miscellaneous/parsing-mention-arguments.html#how-discord-mentions-work (role pings are in the form <@&...>)
        if (roleID.startsWith('<@&') && roleID.endsWith('>')) {
            roleID = roleID.slice(3, -1);
        }

        // Checks if role exists
        const role = interaction.guild.roles.cache.get(roleID);
        if (!role) {
            await interaction.reply(`The role with ID ${roleID} was not found.`)
            return;
        }

        const res = await addServerBotAdmin(serverID, roleID);
        await interaction.reply(`The bot admin role is set / updated to <@&${res.roleID}> successfully.`);
        
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate serverID entry somehow...
                await interaction.reply(`[ERROR: a-set-bot-admin] Duplicate entry for serverID ${serverID} was detected. ${SUPPORT_MSG}`);
            } else {
                throw err;
            }
        }
    },
};
