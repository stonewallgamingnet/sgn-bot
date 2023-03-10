const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Say Hello to SGN bot!'),
	async execute(interaction) {
		await interaction.reply('Hello <@'+interaction.member.id+'> 💖!');
	},
};
