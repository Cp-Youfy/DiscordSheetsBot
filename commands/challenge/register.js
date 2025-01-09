const { SlashCommandBuilder } = require('discord.js');
const { HARD_CD } = require('../../config.json');
const { registerUser } = require('../../exports/databaseMethods.js')

module.exports = {
    cooldown: HARD_CD,
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your user in the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Display name to use in challenges')
                .setRequired(true),
            ),	
	async execute(interaction) {
        await interaction.reply("Command under maintenance");
        return;
        try {
            const nameString = interaction.options.getString('name') ?? null;
            const res = registerUser(interaction.user.id, nameString, Date.now());
            await interaction.reply(res);
            return;
        } catch (exception) {
            if (exception == "Player already exists") {
                await interaction.reply("You have already registered!");
                return;
            } else {
                throw exception(exception);
            }
        }
	},
};
