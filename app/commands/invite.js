const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { TeamChannel, isTeamChannel } = require('../TeamChannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Allow a member to join your locked team channel')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('the member to invite')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect),
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
        const member = interaction.options.getMember('member');

        teamChannel.invite(interaction.options.getMember('member'));

        interaction.reply({content: `<@${member.user.id}> has been invited.`, ephemeral: true});
    }
}