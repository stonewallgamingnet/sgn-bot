function DiscordUser(guildMember) {
	this.fields = {};

	this.setValues(guildMember)
}

DiscordUser.prototype.update = function update(guildMember) {
	this.setValues(guildMember);
}

DiscordUser.prototype.setValues = function setValues(guildMember) {
	this.fields.nickname = guildMember.nickname;
	this.fields.joined_on = guildMember.joinedAt;
	this.fields.checked_on = new Date();
	// var user = guildMember.user ? guildMmember.user : guildMember;

	if(guildMember.user) {
		this.fields.user_id = guildMember.user.id;
		this.fields.username = guildMember.user.username;
		this.fields.discriminator = guildMember.user.discriminator;
	} else {
		this.id = guildMember.id;
		this.fields.user_id = guildMember.user_id;
		this.fields.username = guildMember.username;
		this.fields.discriminator = guildMember.discriminator;
	}
}

DiscordUser.prototype.setId = function setId($id) {
	if(!this.id)  {
		this.id = $id;
	}

	return this;
}

module.exports = DiscordUser;
