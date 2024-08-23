const transwarps = require('../../transwarp_data.json');
const { getMatches, formatOutput } = require('../transwarp');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('transwarp')
        .setDescription('Enter a destination in STO to find the nearest transwarp location.')
        .addStringOption(option =>
            option
                .setName('destination')
                .setDescription('Enter a destination to search for.')
                .setRequired(true)
                .setMinLength(3)
        ),

    async execute(interaction) {
        let searchString = interaction.options.getString('destination');

        // Special cases - search string will be changed to match the JSON data
        if (searchString.toLowerCase().includes("ds9")) {
            searchString = "Deep Space Nine";
        } else if (searchString.toLowerCase().includes("deep space 9")) {
            searchString = "Deep Space Nine";
        } else if (searchString.toLowerCase().includes("earth")) {
            searchString = "Sol";
        } else if (searchString.toLowerCase().includes("qonos")) {
            searchString = "Qo'noS";
        }

        // Iterate through the JSON data for matches
        const matches = getMatches(transwarps, searchString);

        // Exceptions
        if (matches.length == 0) {
            interaction.reply({ content: `No matches found for ${searchString}. Please check your spelling or rephrase your search.`, ephemeral: true })
            return;
        } else if (matches.length > 10) {
            interaction.reply({ content: `Too many matches found for "${searchString}". Please refine your search.`, ephemeral: true })
            return;
        }

        // Gather the results
        let resultsText = formatOutput(matches);

        // Create the embed to output the results
        const resultsEmbed = new EmbedBuilder()
            .setTitle(`Transwarp Search Results for "${searchString}"`)
            .setColor('#0099ff')
            .setDescription(resultsText);

        // Reply to the user
        interaction.reply({ embeds: [resultsEmbed], ephemeral: true })
    }
};
