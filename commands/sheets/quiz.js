const { ButtonBuilder, ButtonStyle, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');
const { EASY_CD } = require('../../config.json');
const emojiCharacters = require('../../exports/emojiCharacters.js')
const { getEntry } = require('../../exports/sheetMethods.js');

module.exports = {
    cooldown: EASY_CD,
	data: new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('MCQ for word definition'),
    
	async execute(interaction) {
		await interaction.deferReply();

        const res = await getEntry(4);

        // Index of correct option -- actual correct option is + 1
        const correctOption = Math.floor(Math.random() * 4)
        const entryToGuess = res[correctOption];
        const wordToGuess = entryToGuess['name']

        const ctr = (function () {
            // Anonymous function for options counter
            var x = 0;
            return function () { x += 1; return emojiCharacters[x]; };
        })();

        const options = Object.values(res).map(((x) => {
            return { name: ctr(), value: x.value}
    }))

        const embed = {
            color: 0x0099ff,
            title: 'Quiz',
            description: `What is the definition of the word ${wordToGuess}?`,
            fields: options,
            timestamp: new Date().toISOString(),
        };

        const option1 = new ButtonBuilder()
            .setCustomId('option1')
            .setLabel("1")
            .setEmoji(emojiCharacters[1])
            .setStyle(ButtonStyle.Primary);

        const option2 = new ButtonBuilder()
            .setCustomId('option2')
            .setLabel("2")
            .setEmoji(emojiCharacters[2])
            .setStyle(ButtonStyle.Primary);

        const option3 = new ButtonBuilder()
            .setCustomId('option3')
            .setLabel("3")
            .setEmoji(emojiCharacters[3])
            .setStyle(ButtonStyle.Primary);

        const option4 = new ButtonBuilder()
            .setCustomId('option4')
            .setLabel("4")
            .setEmoji(emojiCharacters[4])
            .setStyle(ButtonStyle.Primary);

        const optionsRow = new ActionRowBuilder()
            .addComponents(option1, option2, option3, option4);
        
        const userRes = await interaction.editReply({ 
            embeds: [embed],
            components: [optionsRow],
        });

        // ensure only user who sent command can use buttons
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await userRes.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            
            if (confirmation.customId === `option${correctOption + 1}`) {
                embed.fields.push({ name: "Result", value: "**Answer is correct!**"})
                await confirmation.update({ embeds: [embed], components: [] });
            } else {
                embed.fields.push({ name: "Result", value: `**Answer is wrong!** The correct answer was ${emojiCharacters[correctOption + 1]}`})
                await confirmation.update({ embeds: [embed], components: [] });
            }

        } catch (e) {
            console.log(e)
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }

        return;
	},
};
