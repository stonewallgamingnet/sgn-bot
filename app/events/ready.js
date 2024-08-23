const { Events } = require('discord.js');
const DiscordUser = require('../models/DiscordUser');

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        // var guild = await client.guilds.resolve(process.env.DISCORD_GUILD_ID);

        // await guild.members.fetch({force: true});

        // if(!guild.large) {
        //     const removeBots = member => !member.user.bot;

        //     guild.members.cache.filter(removeBots).forEach(member => {
        //         DiscordUser.updateOrAddNew(member);
        //     });
        // }
    }
}