const Discord = require('discord.js');
const fs = require('fs');
// const Mafia = require('./app/models/mafia.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
// const themes = require('./app/themes/mafia.js');
// const GIFEncoder = require('gifencoder');
// const Canvas = require('canvas');
const mysql = require('mysql2/promise');
const MemberOps = require('../app/memberops.js');


var config = require('./app/configs/config');
var memberOps = new MemberOps(client, mysql, config);

const commandFiles = fs.readdirSync('./app/commands');

for (const file of commandFiles) {
	const command = require(`./app/commands/${file}`);
	client.commands.set(command.name, command);
}


// create the connection to database
// const pool = mysql.createPool({
// 	host: config.db.host,
// 	user: config.db.user,
// 	database: config.db.database,
// 	password: config.db.password,
// 	waitForConnections: true,
// 	connectionLimit: 10,
// 	queueLimit: 0,
// 	charset: 'UTF8MB4_GENERAL_CI'
// });

const pool = require('../app/mysql');

console.log(pool, 'pool');

const Halloween = require('../app/halloween');
let halloween = new Halloween(client, pool, config);
halloween.loadSettings();

/*
	Maybe include Async and RSVP libs? could clean up some code.
	TODO: Change class definition following this article
	https://medium.freecodecamp.org/class-vs-factory-function-exploring-the-way-forward-73258b6a8d15
 */

// https://github.com/discordjs/guide/blob/f12bd0fbe5f5980729f94d93a1d733b396356af3/guide/popular-topics/reactions.md
// https://github.com/discordjs/guide/tree/f12bd0fbe5f5980729f94d93a1d733b396356af3/guide/command-handling

async function main() {

	client.on('error', function(error) {
		console.log(error)
	});

	client.on('ready', async () => {
		console.log('Ready!');

		//triggerNightDaily(client, pool, config);
	});

	client.on('error', console.log);

	client.on('message', async (message) => {
		
		if(!message.content.startsWith('/') || message.author.bot) return;

		const args = message.content.slice(1).split(/ +/);
		const command = args.shift().toLowerCase();

		console.log(command, 'command');

		// if(command === 'halloween') {
			
		// 	if(args[0] === 'start') {

		// 		if (message.author.id != 162954397658120192) { 
		// 			message.channel.send('Can only be started by Nick!');
		// 			return; 
		// 		}

		// 		halloween.createJoinPrompt(message);
		// 	}

		// 	if(args[0] === 'teams') {
		// 		halloween.assignTeams(message.guild);
		// 	}

		// }

		if (!client.commands.has(command)) return;

		try {
			client.commands.get(command).execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}

	});

	client.on('messageReactionAdd', async (reaction, user) => {
		if(halloween.settings.join_message_id === reaction.message.id) {
			halloween.addPlayer(reaction, user);
		}
	});

	client.on('raw', async event => {
		if (event.t !== 'MESSAGE_REACTION_ADD') return;
	
		const { d: data } = event;
		const user = client.users.get(data.user_id);
		const channel = client.channels.get(data.channel_id) || await user.createDM();

		if (channel.messages.has(data.message_id)) return;

		const message = await channel.fetchMessage(data.message_id);
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const reaction = message.reactions.get(emojiKey);

		client.emit('messageReactionAdd', reaction, user);
	});

	// client.on('voiceStateUpdate', (oldState, newState) => {
	// 	console.log('oldState', oldState);
	// 	console.log('newState', newState);

	// 	if(!oldState.channelId) { return }
		
	// 	let channelId = oldState.channelId;
	// 	let voiceChannel = client.guilds.get(config.discord.guildId).channels.get(channelId);

	// 	if(!voiceChannel.members.size) {
	// 		let parts = voiceChannel.parent.name.split('-');

	// 		if(parts) {
	// 			parts[0].trim()
	// 			parts[1] = 'Empty'

	// 			voiceChannel.parent.edit({ name: parts.join(' - ')})
	// 		}
	// 	}
	// });
}

function triggerNightDaily(client, pool, config)
{
	var now = new Date();
	var night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
	var milliseconds = night.getTime() - now.getTime();

	setTimeout(function() {
		triggerNight(client, pool, config);
		triggerNightDaily(client, pool, config);
	}, milliseconds);
}

async function triggerNight(client, pool, config) 
{
	// var announceChannel = await message.guild.channels.get(config.halloween.announceId);
	var announceChannel = client.guilds.get(config.halloween.guildId).channels.get(config.halloween.announceId);
	var [factions, ] = await pool.execute('SELECT * FROM `halloween_factions`');
	var embedValue = [];
	var colors = [0x000000, 0xff7930, 0xa73ae7];
	var color = colors[ Math.floor(Math.random() * Math.floor(colors.length)) ];

	factions.forEach(async function(faction, index) {

		var factionChannel = client.guilds.get(config.halloween.guildId).channels.get(faction.channel_id);

		var targetSql = `SELECT a.*, count(b.id) as votes
						 FROM halloween_players AS a
						 LEFT JOIN halloween_players AS b ON a.member_id = b.target_id
						 WHERE b.faction_id = ?
						 GROUP BY b.target_id
						 ORDER BY count(b.id) DESC
						 LIMIT 1`;

		var identifySql = `SELECT a.*, count(b.id) AS votes, c.name AS faction_name
						   FROM halloween_players AS a
						   LEFT JOIN halloween_players AS b ON a.member_id = b.identify_id
						   LEFT JOIN halloween_factions AS c ON a.faction_id = c.id
						   WHERE b.faction_id = ?
						   GROUP BY b.identify_id
						   ORDER BY count(b.id) DESC
						   LIMIT 1`;

		var [targetResult, ] = await pool.execute(targetSql, [faction.id]);
		var [identifyResult, ] = await pool.execute(identifySql, [faction.id]);

		if(targetResult.length && faction.can_kill == targetResult[0].faction_id) {
			var target = targetResult[0];
			var [results, ] = await pool.execute('UPDATE `halloween_players` SET dead = 1, died_on = NOW() WHERE member_id = ?', [target.member_id]);

			embedValue.push("<@" + target.member_id + "> has been killed by a " + faction.name + "!");
			// announceChannel.send("<@" + target.member_id + "> has been killed!");
			// 
		} else {
			// announceChannel.send("The " + faction.name + "'s attack failed!");
			embedValue.push("The " + faction.name + "'s attack failed!");
		}

		if(factions.length === (index + 1)) {
			var nightEmbed = {
				embed: {
					title: "Night Update",
					description: "The night is over.",
					color: color,
					fields: [{
						name: "Attacks",
						value: embedValue.join('\n')
					}]
				}
			}

			announceChannel.send(nightEmbed).then(function(message) {
				message.pin();
			});
		}

		if(identifyResult.length) {
			identify = identifyResult[0];
			factionChannel.send('<@' + identify.member_id + '> is a ' + identify.faction_name + '!');
		}

	});


	await pool.execute('UPDATE `halloween_players` SET target_id = NULL');
	await pool.execute('UPDATE `halloween_players` SET identify_id = NULL');
}

main();
//memberOps.init();

client.login(config.discord.token);