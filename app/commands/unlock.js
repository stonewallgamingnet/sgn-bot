const { SlashCommandBuilder } = require('discord.js');
const { TeamChannel, isTeamChannel} = require('../TeamChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlock your current team channel.')
        .setDefaultMemberPermissions(0),
	async execute(interaction) {
        const channel = interaction.member.voice.channel;
        const channelIds = process.env.TEAM_UP_CHANNEL_IDS.split(',');

        if(!channel) {
            interaction.reply({content: 'You must be in a team channel to use this command', ephemeral: true});
            return;
        }

        if(!isTeamChannel(channel.id)) {
            interaction.reply({content: 'This command can only be used on team channels', ephemeral: true});
        }

        const teamChannel = new TeamChannel(channel);

        if(!teamChannel.isLocked()) {
            interaction.reply({content: 'The channel is already unlocked.', ephemeral: true});
            return;
        }

        teamChannel.unlock();

        interaction.reply({content: 'Your voice channel is now unlocked.', ephemeral: true});
	}
};
