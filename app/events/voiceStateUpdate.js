const { Events } = require('discord.js');

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
        const channelIds = process.env.TEAM_UP_CHANNEL_IDS.split(',');
        const emoji = ['🥇', '🥈', '🥉', '🏅'];
        const parts = {1: 'TEAM UP', 2: '-'};

        // means they joined a channel
        if(newState.channelId && channelIds.includes(newState.channelId)) {
            const game = newState.member.presence.activities.find(activity => activity.type === 0);
            const newChannel = await newState.guild.channels.resolve(newState.channelId);

            if(game && newChannel.parent.name.toLowerCase().includes('empty')) {
                const index = channelIds.indexOf(newState.channelId);
                parts[0] = emoji[index];
                parts[3] = game.name;

                let name = Object.values(parts).join(' ');
                name = name.length > 100 ? name.substring(0, 100) : name;

                await newChannel.parent.setName(name);
            }
        }

        // means they left a channel
        if(oldState.channelId && channelIds.includes(oldState.channelId)) {
            const oldChannel = await oldState.guild.channels.resolve(oldState.channelId);
            
            if(!oldChannel.members.size) {
                const index = channelIds.indexOf(oldState.channelId);
                parts[0] = emoji[index];
                parts[3] = 'EMPTY';
        
                oldChannel.parent.setName(Object.values(parts).join(' '));
            }
        }
	},
};
