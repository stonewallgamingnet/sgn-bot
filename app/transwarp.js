export function getMatches(transwarps, searchString) {
    return transwarps.filter((transwarp) => {
        if (transwarp.destination.toLowerCase().includes(searchString.toLowerCase())) {
            return true;
        }
        return false;
    })
}

export function formatOutput(matches) {
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
                abilityResultsList += `* **${result.destination}** is available to **Federation-aligned captains**. Requirement: ${result.requirement}.\n`;
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

    let resultsText = "The following destinations were found based on your search criteria.\n"

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

    return resultsText;
}