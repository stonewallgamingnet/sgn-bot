const { ContextMenuCommandBuilder, ApplicationCommandType, roleMention } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Toggle Officer Role')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
	async execute(interaction) {
        const member = interaction.targetMember;
        const officer = process.env.OFFICER_ROLE_ID;
        // console.log(interaction);
        if(member.roles.cache.has(officer)) {
            await Promise.all([
                member.roles.remove(officer),
                interaction.reply({content: '<@&'+officer+'> role has been removed from <@'+member+'>.', ephemeral: true})
            ])
        } else {
            await Promise.all([
                member.roles.add(officer),
                interaction.reply({content: '<@'+member+'> has been given the <@&'+officer+'> role.', ephemeral: true})
            ])
        }
	}
};
