const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		
		if(interaction.isModalSubmit()) {
			// const modal = interaction.client.modals.get(interaction.customId);

			// if(!modal) {
			// 	console.error(`No modal matching ${interaction.customId} was found.`);
			// 	return;
			// }

			// try {
			// 	await modal.execute(interaction);
			// } catch(error) {
			// 	console.error(`Error executing ${interaction.customId}`);
			// 	console.error(error);
			// }
		}

		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
	
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
	
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
	},
};
