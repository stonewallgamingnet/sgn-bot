const transwarp_data = require('../../transwarp_data.json');
const transwarps = transwarp_data.transwarps;

const { SlashCommandBuilder } = require('discord.js');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('transwarp')
		.setDescription('Enter a destination in STO to find the nearest transwarp location.')
        .addStringOption(option =>
            option
                .setName('destination')
                .setDescription('Enter a destination to search for.')
                .setRequired(true)
        ),

	async execute(interaction) {
        let searchString = interaction.options.getString('destination');

        // Special cases - search string will be changed to match the JSON data
        if (searchString.toLowerCase().includes("ds9")) {
            searchString = "Deep Space Nine";
        } else if (searchString.toLowerCase().includes("earth")) {
            searchString = "Sol";
        } else if (searchString.toLowerCase().includes("qonos")) {
            searchString = "Qo'noS";
        }

        // Iterate through the JSON data for matches
        const matches = transwarps.filter((transwarp) => {
            if (transwarp.destination.toLowerCase().includes(searchString.toLowerCase())) {
                return true;
            }
            return false;
        })

        // Exceptions
        if (matches == []) {
            interaction.reply({ content: `No matches found for ${searchString}. Please check your spelling or rephrase your search.`, ephemeral: true})
        }

        if (matches.length > 5) {
            interaction.reply({ content: `Too many matches found for "${searchString}". Please refine your search.`, ephemeral: true})
        }

        // Output the results
        let results = `*${searchString}* matches the following destinations: \n\n`;

        matches.forEach((result) => {
            results += `> * ${result.destination} can be reached through **${result.missionname}** in the **${result.episodename}** episode.\n`;
        })

        interaction.reply({ content: results, ephemeral: true})
	},
};
