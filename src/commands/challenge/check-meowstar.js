const { SlashCommandBuilder } = require('discord.js');
const { EXTREME_CD } = require('../../CONSTANTS.json');
const generated_words = new Set(['spray', 'zoe', 'holst', 'yardage', 'oswald', 'zeiss', 'toroid', 'indomitable', 'grumman', 'texaco']);

function genLong(txt) {
    /**
     * Generates long answer string
     */
    
    try {
        const instructionsLst = txt.split(' ');
        let finalStr = '';
        
        for (let instruction of instructionsLst) {
            let [word, countWithParen] = instruction.split('(');
            let count;
            
            if (countWithParen === ')') {
                count = 1;
            } else {
                count = parseInt(countWithParen.slice(0, -1));
            }

            finalStr += `${word} `.repeat(count);
        }

        finalStr = finalStr.trim();
        return finalStr;
    } catch (e) {
        return false;
    }
}

function parseLong(txt) {
    /**
     * Parses long string to words
     */
    const instructionsLst = txt.split(' ');
    const finalStrLst = [];
    let noMoreMeow = false;
    let sbp = 0;
    let sp = 0;
    let output = [];
    let canUseStarmeow = false;

    for (let instruction of instructionsLst) {
        if (sbp > sp) {
            return false;
        }

        if (instruction === 'meow' && noMoreMeow) {
            console.log(instruction);
            return false;
        }

        if (instruction === 'meow' && !noMoreMeow) {
            sbp = 0;
            sp = 0;
            output = [];
            noMoreMeow = true;
        }
        
        if (instruction === 'meowmeow') {
            sp += 1;
            canUseStarmeow = false;
        }

        if (instruction === 'star') {
            output.push(String.fromCharCode(sp));
            canUseStarmeow = true;
        }

        if (instruction === 'starstar') {
            sp -= 1;
            canUseStarmeow = false;
        }
        
        if (instruction === 'meowstar') {
            sbp = sp;
            finalStrLst.push(output.join(''));
            output = [];
            canUseStarmeow = false;
        }

        if (instruction === 'starmeow' && !canUseStarmeow) {
            return false;
        }

        if (instruction === 'starmeow' && canUseStarmeow) {
            sbp = 0;
            canUseStarmeow = false;
        }
    }

    return finalStrLst;
}

function parser(txt) {
    txt = genLong(txt);
    txt = parseLong(txt);
    return txt;
}

function check(inputTxt) {
    try {
        const parsedSet = new Set(parser(inputTxt));
        return setsEqual(generated_words, parsedSet);
    }
    catch (err) {
        return err
    }
}

// Helper function to compare sets (since JavaScript doesn't have a built-in set equality method)
function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const item of a) if (!b.has(item)) return false;
    return true;
}

module.exports = {
    cooldown: EXTREME_CD,
	data: new SlashCommandBuilder()
		.setName('check-meowstar')
		.setDescription('Check meowstar challenge input')
        .addStringOption(option =>
            option.setName('txt')
                .setDescription('Challenge input')
                .setRequired(true),
            ),	
	async execute(interaction) {
        const txt = interaction.options.getString('txt') ?? null;
        const isCorrect = check(txt);
        const res = isCorrect == true ? '**Correct**' : `**Incorrect:** ${isCorrect}`;

        await interaction.reply(res);
        return;
	},
};
