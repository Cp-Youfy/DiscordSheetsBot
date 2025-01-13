const spacetime = require('spacetime')
const assert = require('assert')

const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('conv-timezone')
		.setDescription('String to Discord Timestamp')
		.addStringOption(option =>
			option.setName('timezone_string')
				.setDescription('Format HH:MM:SS-0000 (timezone)')
				.setRequired(true)
			)
		.addStringOption(option =>
			option.setName('date_string')
				.setDescription('Format YYYY-MM-DD')
			),	

	async execute(interaction) {
		const timezoneStr = interaction.options.getString('timezone_string') ?? null;
		const dateStr = interaction.options.getString('date_string') ?? null;
		if (timezoneStr == null) {
			await interaction.reply({ content: `Timezone string must be specified!` });
		}
		else {
			// Checking for timezone format
			try {
				const timeStr = timezoneStr.slice(0, 8);
				const timeZone = timezoneStr.slice(8, 13);
				const [hour, min, sec] = timeStr.split(':');
				Number(hour)
				Number(min)
				Number(sec)
				Number(timeZone)
				
				assert(hour.length == 2)
				assert(min.length == 2)
				assert(sec.length == 2)
				assert(timeZone.length == 5)

				if (dateStr !== null) {
					const [year, month, date] = dateStr.split('-');
					Number(year)
					Number(month)
					Number(date)

					assert(year.length == 4)
					assert(month.length == 2)
					assert(date.length == 2)			
				}
			}
			catch (exception) {
				await interaction.reply({ content: `Parameters not of proper format!` });
				return;
			}
			
			if (dateStr !== null) {
				const [year, month, date] = dateStr.split('-');
				const s = spacetime(`${year}-${month}-${date}T${timezoneStr}`);
				const epochTimestamp = s['epoch'] / 1000;
				await interaction.reply({ content: `The current time is <t:${epochTimestamp}>` });
			}
			else {
				const s = spacetime(`2025-01-01T${timezoneStr}`);
				const epochTimestamp = s['epoch'] / 1000;
				await interaction.reply({ content: `The current time is <t:${epochTimestamp}:t>` });
			}
		}
	},
};
