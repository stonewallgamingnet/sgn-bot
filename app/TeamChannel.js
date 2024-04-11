const { PermissionsBitField, OverwriteType } = require('discord.js');

class TeamChannel {

    constructor(channel) {
        this.channel = channel;
    }
    
    isLocked() {
        const permissions = this.channel.permissionsFor(this.channel.guild.roles.everyone);
        return !permissions.has(PermissionsBitField.Flags.Connect);
    }

    async lock() {
        await this.channel.permissionOverwrites.create(this.channel.guild.roles.everyone, { Connect: false});
        await this.updateName();
    }

    async unlock() {
        await this.channel.permissionOverwrites.edit(this.channel.guild.roles.everyone, { Connect: null});
        await this.updateName();
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
                console.log('delete channel overwrite');
                promises.push(permission.delete('this is the reason'));
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

module.exports = TeamChannel;