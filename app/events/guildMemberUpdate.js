const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        DiscordUser.updateOrAddNew(newMember);
    }
}