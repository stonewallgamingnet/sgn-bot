const DiscordUser = require('../models/DiscordUser');

function DiscordUserFactory(config, mysql) {
	const pool = mysql.createPool({
		host: config.db.host,
		user: config.db.user,
		database: config.memberops.database,
		password: config.db.password,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
		charset: 'UTF8MB4_GENERAL_CI'
	});

	this.table = "#__memberops_discordusers".replace('#__', config.memberops.prefix);
	this.db = pool;
}

DiscordUserFactory.prototype.create = function create(guildMember) {
	return new DiscordUser(guildMember);
}

DiscordUserFactory.prototype.findOrAddNew = async function findOrAddNew(guildMember) {
	var discordUser = await this.findByUserId(guildMember.user.id);

	if(!discordUser) {
		discordUser = await this.insert(guildMember);
	}

	return discordUser;
}

DiscordUserFactory.prototype.updateOrAddNew = async function updateOrAddNew(guildMember) {
	var discordUser = await this.findByUserId(guildMember.user.id);

	if(!discordUser) {
		discordUser = this.insert(guildMember);
	} else {
		discordUser = this.update(guildMember);
	}

	return discordUser;
}

DiscordUserFactory.prototype.findByUserId = async function findByUserId(userId) {
	var discordUser = null;
	var sql = "SELECT * FROM " + this.table + " WHERE user_id = ?";

	var [user,] = await this.db.execute(sql, [userId]);

	if(user.length) {
		discordUser = new DiscordUser(user[0]);
	}

	return discordUser;
}

DiscordUserFactory.prototype.insert = async function insert(guildMember) {
	var discordUser = new DiscordUser(guildMember);
	var sql = "INSERT INTO " + this.table + " ";
	sql += "(" + Object.keys(discordUser.fields).join(', ') + ")";
	sql += " VALUES (" + new Array(Object.keys(discordUser.fields).length).fill('?').join(', ') + ")";

	var [result,] = await this.db.execute(sql, Object.values(discordUser.fields));
	discordUser.id = result.insertId;

	return discordUser;
}

DiscordUserFactory.prototype.update = async function update(guildMember) {
	var discordUser = await this.findByUserId(guildMember.user.id);
	var fields = [];
	discordUser.update(guildMember);

	for (var [key, value] of Object.entries(discordUser.fields)) {
		fields.push(key + " = ? ");
	}

	var sql = " UPDATE " + this.table + " SET ";
	sql += fields.join(', ');
	sql += "WHERE id = " + discordUser.id;

	var [results, ] = await this.db.execute(sql, Object.values(discordUser.fields));
}

DiscordUserFactory.prototype.markRemoved = async function markRemoved(guildMember) {
	var discordUser = await this.findByUserId(guildMember.user.id);

	var sql = "UPDATE " + this.table + " SET ";
	sql += "removed = ?, removed_on = ?, checked_on = ?, presence = ? ";
	sql += "WHERE id = ?";

	this.db.execute(sql, [1, new Date(), new Date(), 'offline', discordUser.id]);
}


module.exports = DiscordUserFactory;