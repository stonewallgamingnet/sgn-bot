var DiscordUserFactory = require('./repositories/DiscordUsers');
var config = require('./configs/config');
var removeBots = function(guildMember) {
	return !guildMember.user.bot;
};

const LARGE_GUILD_THRESHOLD = 50;

function MemberOps(client, mysql) {
	this.client = client;
	this.factory = new DiscordUserFactory(config, mysql);
}

MemberOps.prototype.init = function init() {
	this.client.on('ready', async () => {
		// trigger fetchMembers so we can listen for guildMembersChunk
		var guild = await this.client.guilds.get(config.discord.guildId).fetchMembers();
		
		// Only use this code when developing
		if (guild.memberCount <= LARGE_GUILD_THRESHOLD) {
			guild.members.filter(removeBots).forEach((guildMember) => {
				this.factory.updateOrAddNew(guildMember);
			});
		}
	});

	this.client.on('guildMemberAdd', (guildMember) => {
		this.factory.updateOrAddNew(guildMember);
	});

	this.client.on('guildMemberRemove', (guildMember) => {
		this.factory.markRemoved(guildMember);
	});

	this.client.on('guildMemberUpdate', (oldMember, newMember) => {
		this.factory.updateOrAddNew(newMember);
	});

	this.client.on('guildMembersChunk', (guildMembers, guild) => {
		guildMembers.filter(removeBots).forEach((guildMember) => {
			this.factory.updateOrAddNew(guildMember);
		});
	});

	this.client.on('presenceUpdate', (oldMember, newMember) => {
		if(this.factory.findByUserId(newMember.user.id)) {
			this.factory.update(newMember);
		}
	});

};

module.exports = MemberOps;