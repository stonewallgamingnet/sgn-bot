const questions = require('../../academy_data.json');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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

        let responseEmbed;

        // Iterate through the JSON data for matches
        const matches = questions.filter((question) => {
            if (question.volume == volume && question.chapter == chapter) {
                return true;
            }
            return false;
        })

        if (matches.length == 0) {
            responseEmbed = new EmbedBuilder()
                .setTitle(`Path to 2409 Search - Error"`)
                .setColor('#FF1111')
                .setDescription("No matches found. Please check your spelling or rephrase your search.");
        } else if (matches.length > 1) {
            responseEmbed = new EmbedBuilder()
                .setTitle(`Path to 2409 Search - Error`)
                .setColor('#FF1111')
                .setDescription("More than one match found. Please refine your search.");
        } else {
            let response = `> **Question**: ${matches[0].question}\n> **Answer**: ${matches[0].answer}`;
            responseEmbed = new EmbedBuilder()
                .setTitle(`Path to 2409 - Volume ${matches[0].volume}, Chapter ${matches[0].chapter}`)
                .setColor('#0099ff')
                .setDescription(response);
        }

        // Reply to the user
        interaction.reply({ embeds: [responseEmbed], ephemeral: true })

    }
}
