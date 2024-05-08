const { Events } = require('discord.js');
const {TeamChannel, isTeamChannel} = require('../TeamChannel');

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {

        // means they joined a channel
        if(newState.channelId && isTeamChannel(newState.channelId)) {
            const game = newState.member.presence.activities.find(activity => activity.type === 0);
            const newChannel = await newState.guild.channels.resolve(newState.channelId);
            const teamChannel = new TeamChannel(newChannel);

            if(game && newChannel.parent.name.toLowerCase().includes('empty')) {
                await teamChannel.rename(game.name);
            }
        }

        // means they left a channel
        if(oldState.channelId && isTeamChannel(oldState.channelId)) {
            const oldChannel = await oldState.guild.channels.resolve(oldState.channelId);
            const teamChannel = new TeamChannel(oldChannel);
            
            if(!oldChannel.members.size) {
                await teamChannel.reset();;
            }
        }
	},
};
