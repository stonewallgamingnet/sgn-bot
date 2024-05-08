const { SlashCommandBuilder } = require('discord.js');
const { TeamChannel, isTeamChannel} = require('../TeamChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Lock your current team channel.')
        .setDefaultMemberPermissions(0),
	async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if(!channel) {
            interaction.reply({content: 'You must be in a team channel to use this command', ephemeral: true});
            return;
        }

        if(!isTeamChannel(channel.id)) {
            interaction.reply({content: 'This command can only be used on team channels', ephemeral: true});
            return;
        }

        const teamChannel = new TeamChannel(channel);

        if(teamChannel.isLocked()) {
            interaction.reply({content: 'The channel is already locked.', ephemeral: true});
            return;
        }

        teamChannel.lock();

        interaction.reply({content: 'Your voice channel is now locked.', ephemeral: true});
	},
};