const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(guildMember) {
        const discordUser = await DiscordUser.findOrAddNew(guildMember);
        discordUser.markRemoved();
    }
}