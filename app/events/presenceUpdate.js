const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const discordUser = await DiscordUser.findByUserId(newPresence.userId);

        discordUser.data.presence = newPresence.status;

        discordUser.save();
    }
}