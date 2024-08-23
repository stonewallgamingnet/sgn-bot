const { Events } = require('discord.js');

module.export = {
    name: Events.GuildMembersChunk,
    execute(guildMembers, guild) {
        // const removeBots = member => !member.user.bot;

        // guildMembers.filter(removeBots).forEach(member => {
        //     DiscordUser.updateOrAddNew(member);
        // });
    }
}