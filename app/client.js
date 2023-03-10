// store all the client stuff here and export it.
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ], 
    partials: [ 
        Partials.Channel,
        Partials.GuildMember
    ] });

client.login(process.env.DISCORD_TOKEN);

module.exports = client;