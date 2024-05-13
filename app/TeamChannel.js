const { PermissionsBitField, OverwriteType, Collection } = require('discord.js');

class TeamChannel {

    constructor(channel) {
        this.channel = channel;
    }
    
    isLocked() {
        const permissions = this.channel.permissionsFor(this.channel.guild.roles.everyone);
        return !permissions.has(PermissionsBitField.Flags.Connect);
    }

    async lock(name = null) {
        await this.channel.permissionOverwrites.create(this.channel.guild.roles.everyone, { Connect: false});
        name ? await this.rename(name) : await this.updateName();
    }

    async unlock(name = null) {
        await this.channel.permissionOverwrites.edit(this.channel.guild.roles.everyone, { Connect: null});
        name ? await this.rename(name) : await this.updateName();
    }

    invite(member) {
        return this.channel.permissionOverwrites.create(member, { Connect: true });
    }
    
    async reset() {
        if(this.isLocked()) {
            await this.unlock();
        }
        
        await this.rename('EMPTY');

        const permissions = this.channel.permissionOverwrites.cache;
        const promises = [];
      
        permissions.each(async (permission) => {
            if(permission.type === OverwriteType.Member) {
                promises.push(permission.delete('Resetting channel after empty'));
            }
        });

        await Promise.all(promises);
    }
    
    getIcon() {
        if(this.isLocked()) {
            return '🔒';
        }

        const channelIds = process.env.TEAM_UP_CHANNEL_IDS.split(',');
        const emoji = ['🥇', '🥈', '🥉', '🏅'];
        const index = channelIds.indexOf(this.channel.id);

        return emoji[index];
    }

    async rename(name) {
        const parts = {1: 'TEAM UP', 2: '-'};
        parts[0] = this.getIcon();
        parts[3] = name;
     
        const category = await this.channel.guild.channels.resolve(this.channel.parent.id);
        
        let newName = Object.values(parts).join(' ');
        newName = newName.length > 100 ? newName.substring(0, 100) : newName;
        
        await category.setName(newName);
    }


    async updateName() {
        const category = await this.channel.guild.channels.resolve(this.channel.parent.id);
        const regex = /. TEAM UP - (.*)/
        const matches = category.name.match(regex);
    
        await this.rename(matches[1]);
    }
}

function isTeamChannel(id) {
    const channelIds = process.env.TEAM_UP_CHANNEL_IDS.split(',');

    return channelIds.includes(id);
}

// const timestamp = Date.now();

// if timestamp is > 10 minutes ago, set count = 1

function setUpCooldown(channel) {
    const client = channel.client;
    
    if(!client.teamCooldowns) {
        client.teamCooldowns = new Collection();
    }
    
    const teamCooldowns = client.teamCooldowns;
    
    if(!teamCooldowns.has(channel.id)) {
        const now = Date.now();
        const tenMinutesAgo = now - (10 * 60 * 1000);
        teamCooldowns.set(channel.id, [0, tenMinutesAgo]);
    }
}

function getCooldown(channel) {
    let [, timeAgo] = channel.client.teamCooldowns.get(channel.id);
       
    const inTenMinutes = new Date(timeAgo+ (10 * 60 * 1000));
    const now = new Date();

    const timeDifference = (inTenMinutes - now)/1000;
    const minutes = Math.floor(timeDifference / 60);
    const seconds = Math.round(timeDifference % 60);

    return [minutes, seconds];
}

function updateCooldown(channel) {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const teamCooldowns = channel.client.teamCooldowns;
    let [count, timeAgo] = teamCooldowns.get(channel.id);
    const timeDifference = now - timeAgo;

    setUpCooldown(channel);

    count = (timeDifference > tenMinutes) ? 1 : ++count;
    
    teamCooldowns.set(channel.id, [count, now]);
}

function isCooldown(channel) {
    const now = Date.now();
    const tenMinutesAgo = now - (10 * 60 * 1000);
    const maxThreshold = 2;

    setUpCooldown(channel);

    const teamCooldowns = channel.client.teamCooldowns;

    let [count, timeAgo] = teamCooldowns.get(channel.id);
    
    if(count >= maxThreshold && timeAgo > tenMinutesAgo) {
        return true;
    }

    return false;
}

module.exports = {
    TeamChannel,
    isTeamChannel,
    isCooldown,
    updateCooldown,
    getCooldown
};