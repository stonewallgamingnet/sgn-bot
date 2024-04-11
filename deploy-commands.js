const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');

/** sgnBot */
// const GUILD_ID = "162955155875037184"; // sgn 
// const CLIENT_ID = "377305806321877004"; //sgnBot
// const DISCORD_TOKEN = "Mzc3MzA1ODA2MzIxODc3MDA0.DqGdgg.GbBjdGsYxsxfQjW7sAPFJzjoONM";

/** devBot */
GUILD_ID="375133424261791755"
CLIENT_ID="500137506248065025"
DISCORD_TOKEN="NTAwMTM3NTA2MjQ4MDY1MDI1.DqGeKw.yWjS2IHLkgUhKBdhn-YFULUu980"

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./app/commands').filter(file => file.endsWith('.js') && !file.includes('test'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./app/commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
