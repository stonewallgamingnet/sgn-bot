var DiscordUserFactory = require('./util/DiscordUserFactory');
var removeBots = function(guildMember) {
	return !guildMember.user.bot;
};

function MemberOps(client, mysql, config) {
	this.client = client;
	this.config = config;
	this.factory = new DiscordUserFactory(config, mysql);
}

MemberOps.prototype.init = function init() {
	console.log('member ops init');

	this.client.on('ready', async () => {
		console.log('member ops ready');
		// trigger fetchMembers so we can listen for guildMembersChunk
		var guild = await this.client.guilds.get(this.config.discord.guildId).fetchMembers();
		
		guild.members.filter(removeBots).forEach((guildMember) => {
			console.log(guildMember);
			this.factory.updateOrAddNew(guildMember);
		});
	});

	this.client.on('guildMemberAdd', (newMember) => {
		this.factory.updateOrAddNew(newMember);
	});

	this.client.on('guildMemberRemove', async (guildMember) => {
		this.factory.markRemoved(guildMember);
	});

	this.client.on('guildMemberUpdate', (oldMember, newMember) => {
		this.factory.updateOrAddNew(newMember);
	});

	this.client.on('guildMembersChunk', function(guildMembers, guild) {
		guildMembers.filter(removeBots).forEach(function(guildMember) {
			this.factory.updateOrAddNew(guildMember);
		});
	});

};

module.exports = MemberOps;