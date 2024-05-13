const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { TeamChannel, isTeamChannel, isCooldown, updateCooldown, getCooldown} = require('../TeamChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlock your current team channel.')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('New name for your current team channel.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect),
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

        const name = interaction.options.getString('name');

        if(isCooldown(channel)) {
            const [minutes, seconds] = getCooldown(channel);
            const minutesString = minutes > 1 ? 'minutes' : 'minute';
            const secondsString = seconds > 1 ? 'seconds' : 'second';
            interaction.reply({content: `This channel is currently on cooldown for ${minutes} ${minutesString} and ${seconds} ${secondsString}.`, ephemeral: true});
            return;
        }

        teamChannel.unlock(name);
        updateCooldown(channel);
        
        interaction.reply({content: 'Your voice channel is now unlocked.', ephemeral: true});
	}
};
