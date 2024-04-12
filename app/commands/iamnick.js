const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('iamnick')
		.setDescription('SGN bot checks to see if you\re Nick'),
	async execute(interaction) {

        if(interaction.user.id == 162954397658120192) {
			interaction.reply('Yes, you\'re Nick!');
		} else if (interaction.user.id == 161193235790692353) {
			interaction.reply('You are Halish, not Nick!');
		} else if (interaction.user.id == 230824176741515265 ) {
			interaction.reply('You are not Nick, you are the great and mighty Josh!')
		} else {
			interaction.reply('Intruder Alert! Imposter Identified!!');
		}
	},
};
