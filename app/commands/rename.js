const { SlashCommandBuilder } = require('discord.js');
const { TeamChannel, isTeamChannel} = require('../TeamChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rename')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The new name of the channel')
                .setRequired(true)
        )
		.setDescription('Rename your current team channel.')
        .setDefaultMemberPermissions(0),
	async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if(!channel) {
            interaction.reply({content: 'You must be in a team channel to use this command', ephemeral: true});
            return;
        }

        if(!isTeamChannel(channel.id)) {
            interaction.reply({content: 'This command can only be used on team channels', ephemeral: true});
        }

        const teamChannel = new TeamChannel(channel);

        const name = interaction.options.getString('name');
        
        teamChannel.rename(name);

        interaction.reply({content: `Channel name is now ${name}.`, ephemeral: true});
	}
};
