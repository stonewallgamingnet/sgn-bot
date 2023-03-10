const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(guildMember) {
        DiscordUser.updateOrAddNew(guildMember);
    }
}