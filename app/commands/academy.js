const question_data = require('../../pathto2409_data.json');
const questions = question_data.questions;

const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('academy')
        .setDescription('Look up the answer to the Academy daily questions.')
        .addIntegerOption(option =>
            option
                .setName('volume')
                .setDescription('Enter the volume number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(29)
        )
        .addIntegerOption(option =>
            option
                .setName('chapter')
                .setDescription('Enter the chapter number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)
        ),

    async execute(interaction) {
        const volume = interaction.options.getInteger('volume');
        const chapter = interaction.options.getInteger('chapter');

        // Iterate through the JSON data for matches
        const matches = questions.filter((question) => {
            if (question.volume == volume && question.chapter == chapter) {
                return true;
            }
            return false;
        })

        if (matches.length == 0) {
            interaction.reply({ content: `That combination of volume and chapter number wasn't found. Please check the volume and chapter combination and try again.`, ephemeral: true})
        } else if (matches.length > 1) {
            interaction.reply({ content: `More than one match was found. There may be a problem with the volume and chapter combination you entered. Please try again.`, ephemeral: true})
        } else {
            let response = `Volume ${matches[0].volume}, Chapter ${matches[0].chapter}:\nQuestion: ${matches[0].question}\nAnswer: ${matches[0].answer}`;
            interaction.reply({ content: response, ephemeral: true})
        }

    }
}
