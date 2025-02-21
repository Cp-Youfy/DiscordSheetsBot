const { SlashCommandBuilder } = require('discord.js');
const { EXTREME_CD } = require('../../CONSTANTS.json');
const { registerUser } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: EXTREME_CD,
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your user in the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Display name to use in challenges')
                .setRequired(true),
            ),	
	async execute(interaction) {
        try {
            const nameString = interaction.options.getString('name') ?? null;
            const res = await registerUser(interaction.user.id, nameString, Date.now());
            await interaction.reply(res);
            return;
        } catch (error) {
            if (error.message == "Player already exists.") {
                await interaction.reply("You have already registered!");
                return;
            } else {
                throw error;
            }
        }
	},
};
