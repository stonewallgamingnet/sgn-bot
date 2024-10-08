const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {     
        const discordUser = await DiscordUser.findOrAddNew(newPresence.member);

        if(!discordUser) { return; }

        discordUser.data.presence = newPresence.status;

        discordUser.save();
    }
}