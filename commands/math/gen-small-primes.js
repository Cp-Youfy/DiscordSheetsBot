const assert = require('assert')

const { SlashCommandBuilder } = require('discord.js');
const { MEDIUM_CD } = require('../../CONSTANTS.json');
MAX_LENGTH = 1000

module.exports = {
    cooldown: MEDIUM_CD,
	data: new SlashCommandBuilder()
		.setName('gen_small_primes')
		.setDescription('Generates small primes up to limit 2 <= n <= 9970')
		.addIntegerOption(option =>
			option.setName('n')
				.setDescription('integer')
				.setRequired(true)
			),

	async execute(interaction) {
        const n = Number(interaction.options.getInteger('n')) ?? null;

        // Uses Sieve of Eratosthenes for generating small primes
        // upper bound check for discord limits
        try {
            assert(2 <= n && n <= 9970)
        }
        catch (exception) {
            await interaction.reply({ content: `Restriction not met: 2 <= n <= 9970 (discord character limit :( ))` });
            return
        }
        
        // generate the flag list
        // sets flagArr[0] and flagArr[1] to 0 as 0 and 1 are not primes, and indexing starts from flagArr[2]
        var flagArr = [0, 0];

        for (var i = 2; i <= n; i++) {
            flagArr.push(1);
        }

        var i = 2
        while (i ** 2 <= n) {
            for (var j = i; j <= n / i; j++) {
                // Multiples of i cannot be prime
                // Optimisation: Start from j = i (i ** 2) as all previous multiples have already been checked
                // e.g. when i = 3, the multiple 6 (2 * 3) has been marked by the previous i = 2 (i (2) * j (3) = 6)
                // so you can start from 9 (3 * 3, or i ** 2, hence starting from j = i)
                flagArr[j * i] = 0;
            }

            do {
                // Finds the next prime (number not marked as 0 by a multiple of i)
                i += 1;
            } while (flagArr[i] != 1);
        }

        // haha good coding below
        var result1 = ''
        var result2 = ''
        var result3 = ''
        var result4 = ''
        var result5 = ''
        var result6 = ''

        for (var i = 2; i <= n; i++) {
            if (flagArr[i] == 1) {
                if (result1.length < MAX_LENGTH) {
                    result1 += String(i);
                    result1 += ' '
                }
                else if (result2.length < MAX_LENGTH) {
                    result2 += String(i);
                    result2 += ' '
                }
                else if (result3.length < MAX_LENGTH) {
                    result3 += String(i);
                    result3 += ' '
                }  
                else if (result4.length < MAX_LENGTH) {
                    result4 += String(i);
                    result4 += ' '
                }
                else if (result5.length < MAX_LENGTH) {
                    result5 += String(i);
                    result5 += ' '
                }
                else if (result6.length < MAX_LENGTH) {
                    result6 += String(i);
                    result6 += ' '
                }
            }
        }        

        resultArr = [
            {
                name: ' ',
                value: result1,
            },
            {
                name: ' ',
                value: result2,
            },
            {
                name: ' ',
                value: result3,
            },
            {
                name: ' ',
                value: result4,
            },
            {
                name: ' ',
                value: result5
            },
            {
                name: ' ',
                value: result6,
            },  
        ]

        const embed = {
            color: 0x0099ff,
            title: 'Prime Number Generation',
            url: 'https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes',
            description: 'Uses Sieve of Eratosthenes Algorithm',
            fields: resultArr,
            timestamp: new Date().toISOString(),
        };
        
        await interaction.reply({ embeds: [embed] });
	},
};
