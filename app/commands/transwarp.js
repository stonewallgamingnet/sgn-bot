const transwarp_data = require('../../transwarp_data.json');
const transwarps = transwarp_data.transwarps;

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
        if (matches.length == 0) {
            interaction.reply({ content: `No matches found for ${searchString}. Please check your spelling or rephrase your search.`, ephemeral: true })
            return;
        } else if (matches.length > 5) {
            interaction.reply({ content: `Too many matches found for "${searchString}". Please refine your search.`, ephemeral: true })
            return;
        }

        // Gather the results

        let missionResultsList = [];
        let abilityResultsList = [];
        let fleetResultsList = [];
        let repResultsList = [];

        matches.forEach((result) => {
            switch (result.transwarptype) {
                case "mission":
                    missionResultsList += `* **${result.destination}** can be reached through **${result.missionname}** in the **${result.episodename}** episode.\n`;
                    break;
                case "builtin-fed":
                    abilityResultsList += `* **${result.destination}** is available to **Federation captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-kdf":
                    abilityResultsList += `* **${result.destination}** is available to **KDF captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-rom":
                    abilityResultsList += `* **${result.destination}** is available to **Romulan captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-dom":
                    abilityResultsList += `* **${result.destination}** is available to **Dominion captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-fed-align":
                    abilityResultsList += `* **${result.destination}** is available to **Federation-aligned** captains. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-kdf-align":
                    abilityResultsList += `* **${result.destination}** is available to **KDF-aligned captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "builtin-unaligned":
                    abilityResultsList += `* **${result.destination}** is available to **all captains**. Requirement: ${result.requirement}.\n`;
                    break;
                case "fleet-fed":
                    fleetResultsList += `* **${result.destination}** is available to **Federation captains** through the *Fleet Transwarp Conduit*. Requirement: ${result.requirement}.\n`;
                    break;
                case "fleet-kdf":
                    fleetResultsList += `* **${result.destination}** is available to **KDF captains** through the *Fleet Transwarp Conduit*. Requirement: ${result.requirement}.\n`;
                    break;
                case "fleet-unaligned":
                    fleetResultsList += `* **${result.destination}** is available to **all captains** through the *Fleet Transwarp Conduit*. Requirement: ${result.requirement}.\n`;
                    break;
                case "rep":
                    repResultsList += `* **${result.destination}** is available to **all captains** through the *Reputation System*. Requirement: ${result.requirement}.\n`;
                    break;
                default:
                    break;
            }
        })

        let resultsText = "The following destinations were found based on your serach criteria.\n"

        if (missionResultsList.length != 0) {
            resultsText += "### Missions\n"
            resultsText += missionResultsList;
        }
        if (abilityResultsList.length != 0) {
            resultsText += "### Ability Transwarps\n"
            resultsText += abilityResultsList;
        }
        if (fleetResultsList.length != 0) {
            resultsText += "### Fleet\n"
            resultsText += fleetResultsList;
        }
        if (repResultsList.length != 0) {
            resultsText += "### Reputation\n"
            resultsText += repResultsList;
        }

        // Create the embed to output the results

        const resultsEmbed = new EmbedBuilder()
            .setTitle(`Transwarp Search Results for "${searchString}"`)
            .setColor('#0099ff')
            .setDescription(resultsText);


        // Reply to the user
        interaction.reply({ embeds: [resultsEmbed], ephemeral: true })
    }
};
