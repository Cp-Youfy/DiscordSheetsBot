const spacetime = require('spacetime')
const assert = require('assert')

const { SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');
const { type } = require('os');

function getSeconds(str, resultType) {
    if (resultType == 's' || resultType == 'seconds') { fac = 60 }
    else if (resultType == 'ms' || resultType == 'milliseconds') { fac = 600 }
    else { return 'Invalid result type.' }
    // src: https://stackoverflow.com/a/11909592
    var seconds = 0;
    var days = str.match(/(\d+)\s*d/);
    var hours = str.match(/(\d+)\s*h/);
    var minutes = str.match(/(\d+)\s*m/);
    if (days || hours || minutes) {
        if (days) { seconds += parseInt(days[1]) * 24 * 60 * fac; }
        if (hours) { seconds += parseInt(hours[1]) * 60 * fac; }
        if (minutes) { seconds += parseInt(minutes[1]) * fac; }
    } else {
        return 'Invalid string input.'
    }

    return seconds;
  }

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('conv-duration')
		.setDescription('Convert duration into seconds or milliseconds')
        .addStringOption(option =>
			option.setName('duration')
				.setDescription('#d #h #m')
				.setRequired(true)
			)
		.addStringOption(option =>
			option.setName('result_type')
				.setDescription('s (seconds) | ms (milliseconds)')
				.setRequired(true)
			),

	async execute(interaction) {
		const durationStr = interaction.options.getString('duration') ?? null;
        const resultType = interaction.options.getString('result_type') ?? null;

		const res = getSeconds(durationStr, resultType);
        if (typeof(res) == 'number') { interaction.reply(String(res) + ` ${resultType}`) }
        else { interaction.reply(res) }
	},
};
