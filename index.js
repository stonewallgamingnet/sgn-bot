const Discord = require('discord.js');
// const Mafia = require('./app/models/mafia.js');
const client = new Discord.Client();
// const themes = require('./app/themes/mafia.js');
// const GIFEncoder = require('gifencoder');
// const Canvas = require('canvas');
const mysql = require('mysql2/promise');
const games = {};

if(process.env.NODE_ENV && process.env.NODE_ENV == "production") {
	var config = require('./app/configs/config.prod.json');
} else {
	console.log('Loading Debug Config');
	var config = require('./app/configs/config.dev.json');
}

client.login(config.discord.token);
/*
	Maybe include Async and RSVP libs? could clean up some code.
	TODO: Change class definition following this article
	https://medium.freecodecamp.org/class-vs-factory-function-exploring-the-way-forward-73258b6a8d15
 */
async function main() {

	client.on('error', function(error) {
		console.log(error)
	});

	// create the connection to database
	const pool = mysql.createPool({
		host: config.db.host,
		user: config.db.user,
		database: config.db.database,
		password: config.db.password,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0
	});

	console.log(pool, 'pool');

	client.on('ready', () => {
		console.log('Ready!');

		triggerNightDaily(client, pool, config);
	});

	client.on('error', console.log);

	client.on('message', async (message) => {
		if(!message.content.startsWith('/') || message.author.bot) return;

		const args = message.content.slice(1).split(/ +/);
		const command = args.shift().toLowerCase();

		if(command == 'pool') {
			console.log(pool);
		}

		// if(command == 'mafia') {
		// 	var channel = message.channel;
		// 	message.delete();

		// 	var date = new Date();
		// 	date.setMinutes(date.getMinutes() + 5);

		// 	if(args[0] === 'new') {
		// 		var theme = args[1] && themes.hasOwnProperty(args[1]) ? themes[args[1]] : themes.mafia;
		// 		var joinEmbed = require('./app/embeds/join.js')(theme);

		// 		const filter = (reaction, user) => {
		// 			return ['✅', '👁'].includes(reaction.emoji.name) && user.id != client.user.id;
		// 		};

		// 		channel.send(joinEmbed).then(async (joinPrompt) => {
					
		// 			// try {
		// 				await joinPrompt.react('✅');
		// 				await joinPrompt.react('👁');
		// 			// }

		// 			joinPrompt.awaitReactions(filter, {time: 10 * 1000}).then(collected => {
		// 				joinPrompt.delete();

		// 				// needs better handling of reaction cases
		// 				// if there are no players or no spectators
		// 				// maybe set players/spectators to empty Collection instead of null?
		// 				players = spectators = null;
		// 				if(collected.get('✅')) {
		// 					var players = collected.get('✅').users.filter(user => user.id != client.user.id);
		// 				}
		// 				if(collected.get('👁')) {
		// 					var spectators = collected.get('👁').users.filter((user) => {
		// 						return user.id != client.user.id && (players && !players.has(user.id));
		// 					});
							
		// 				}

		// 				if(players) {
		// 					var game = new Mafia(message.guild, message.author, theme);
		// 					var category = game.startup(players, spectators);

		// 					category.then((category) => {
		// 						games[category.id] = game;
		// 					});
		// 				}
		// 			});

		// 		});


		// 	}

		// 	if(args[0] === 'kill') {
		// 		if(message.mentions.users.size && games.hasOwnProperty(message.channel.parent.id)) {
		// 			var game = games[message.channel.parent.id];
		// 			if(message.author.id === game.host.id) {
		// 				game.killPlayers(message.mentions.users);
		// 			}
		// 		}
		// 	}

		// 	if(args[0] === 'vote') {
		// 		if(games.hasOwnProperty(message.channel.parent.id)) {
		// 			var game = games[message.channel.parent.id];
		// 			game.triggerVote();
		// 		}
		// 	}
			
		// 	if(args[0] === 'end') {

		// 		if (games.hasOwnProperty(message.channel.parent.id)) {
		// 			var game = games[message.channel.parent.id];

		// 			if(game.host == message.author) {
		// 				game.shutdown();
		// 			}
		// 		}

		// 	}

		// 	if(args[0] === 'count') {
		// 		console.log(Object.keys(games).length);
		// 	}

		// }

		if(command == 'halloween') {
			// var connection = await pool.getConnection();
			// console.log(pool);
			var connection = pool;

			if(args[0] === 'join') {
				var [results, fields] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [message.member.id]);

				if(results.length) {
					message.channel.send("<@" + message.author.id + ">, you've already joined the game.");
				} else {
					var role = message.guild.roles.get(config.halloween.roleId);
					var sql = `SELECT a.*, count(b.id) as player_count
							   FROM halloween_factions AS a
							   LEFT JOIN halloween_players AS b ON a.id = b.faction_id
							   GROUP BY b.faction_id
							   ORDER BY count(b.id) ASC, RAND()
							   LIMIT 1`;

					var [results, fields] = await connection.execute(sql);
					var faction = results[0];
					var channel = message.guild.channels.get(faction.channel_id);

					var [results, fields] = await connection.execute(
						'INSERT INTO `halloween_players` (member_id, username, faction_id) VALUES (?, ?, ?)',
						[message.member.id, message.author.username, faction.id]
					);

					message.member.addRole(role);

					channel.overwritePermissions(message.member.id, {
						VIEW_CHANNEL: true,
						SEND_MESSAGES: true,
						READ_MESSAGE_HISTORY: true
					});

					channel.send("<@" + message.author.id + ">, welcome to the Halloween Event!");
				}
			}

			if(args[0] === 'kill') {

				if(message.channel.parent.id != config.halloween.categoryId && message.channel.id != config.halloween.announceId) {
					message.channel.send("<@" + message.author.id + ">, please vote in your team channel.");
					message.delete();
					return;
				}

				if(!message.mentions.members.size) {
					message.channel.send("<@" + message.author.id + ">, you must enter @user#1234 when voting.");
					return;
				}

				var mentioned = message.mentions.members.first();
				var [playerResults,] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [message.member.id]);
				var [targetResult,] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [mentioned.id]);

				if(!playerResults.length) {
					message.channel.send("<@" + message.author.id + ">, you need to first join the game with /halloween join to play.");
					return;
				}

				if(!targetResult.length) {
					message.channel.send("<@" + message.author.id + ">, that member is not playing the game. Vote for a member with the <@&" + config.halloween.roleId + "> role.");
					return;
				}

				var player = playerResults[0];
				var target = targetResult[0];

				if(player.faction_id == target.faction_id) {
					message.channel.send("<@" + message.author.id + ">, don't vote for your team mate!");
					return;
				}

				if(player.dead) {
					message.channel.send("<@" + message.author.id + ">, dead players can't vote, but you can still win with your team!");
					return;
				}

				if(target.dead) {
					message.channel.send("<@" + message.author.id + ">, that player is already dead.");
					return;
				}

				var [results, fields] = await connection.execute('UPDATE `halloween_players` SET target_id = ? WHERE member_id = ?', [mentioned.id, message.member.id]);

				message.channel.send("<@" + message.author.id + ">, your vote for <@" + mentioned.user.id + "> has been saved.");
			}

			if(args[0] === 'identify') {
				if(message.channel.parent.id != config.halloween.categoryId && message.channel.id != config.halloween.announceId) {
					message.channel.send("<@" + message.author.id + ">, please vote in your team channel.");
					message.delete();
					return;
				}

				if(!message.mentions.members.size) {
					message.channel.send("<@" + message.author.id + ">, you must enter @user#1234 when voting.");
					return;
				}

				var mentioned = message.mentions.members.first();
				var [playerResults,] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [message.member.id]);
				var [targetResult,] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [mentioned.id]);

				if(!playerResults.length) {
					message.channel.send("<@" + message.author.id + ">, you need to first join the game with /halloween join to play.");
					return;
				}

				if(!targetResult.length) {
					message.channel.send("<@" + message.author.id + ">, that member is not playing the game. Vote for a member with the <@&" + config.halloween.roleId + "> role.");
					return;
				}

				var player = playerResults[0];
				var target = targetResult[0];

				if(player.faction_id == target.faction_id) {
					message.channel.send("<@" + message.author.id + ">, don't vote for your team mate!");
					return;
				}

				if(player.dead) {
					message.channel.send("<@" + message.author.id + ">, dead players can't vote, but you can still win with your team!");
					return;
				}

				if(target.dead) {
					message.channel.send("<@" + message.author.id + ">, that player is already dead.");
					return;
				}

				var [results, fields] = await connection.execute('UPDATE `halloween_players` SET identify_id = ? WHERE member_id = ?', [mentioned.id, message.member.id]);

				message.channel.send("<@" + message.author.id + ">, your vote for <@" + mentioned.user.id + "> has been saved.");

			}

			if(args[0] === 'list') {
				var colors = [0x000000, 0xff7930, 0xa73ae7];
				var color = colors[ Math.floor(Math.random() * Math.floor(colors.length)) ];
				var [playerResults,] = await connection.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [message.member.id]);

				if(!playerResults.length) {
					message.channel.send("<@" + message.author.id + ">, you need to first join the game with /halloween join to play.");
					return;
				}

				var player = playerResults[0];

				if(message.channel.parent.id != config.halloween.categoryId && message.channel.id != config.halloween.announceId) {
					message.channel.send("<@" + message.author.id + ">, please vote in your team channel.");
					message.delete();
					return;
				}

				var [players, ] = await connection.execute("SELECT * FROM `halloween_players` WHERE faction_id != ?", [player.faction_id]);
				var playerList = [];

				if(players.length) {
					players.forEach(function(player) {
						if(player.dead) {
							playerList.push('~~<@' + player.member_id + '>~~');
						} else {
							playerList.push('<@' + player.member_id + '>');
						}
					});

					var playerString = playerList.join('\n');

					var playerListEmbed = {
						embed: {
							title: 'Player List',
							description: 'A list of players not on your team.',
							color: color,
							fields: [
								{
									name: "Players",
									value: playerString
								},
								{
									name: "Note",
									value: "~~Strike~~ indicates dead players."
								}
							]
						}
					};

					message.channel.send(playerListEmbed);
				}
			}

			if(args[0] === 'forcenight') {

				// if the message come from NicholasJohn16
				if(message.author.id == 162954397658120192) {
					triggerNight(client, pool, config);
				}

			}

			// pool.releaseConnection(connection);
		}

		// if(command === 'generategif') {
		// 	var encoder = new GIFEncoder(100, 100);
		// 	encoder.start();
		// 	encoder.setRepeat(-1);
		// 	encoder.setDelay(1000);

		// 	var canvas = Canvas.createCanvas(100, 100);
		// 	var ctx = canvas.getContext('2d');

		// 	ctx.font = '30px sans-serif'; // check default Discord font
		// 	// ctx.fillText('Hi', 35, 35);
			
		// 	for (var i = 10; i >= 0; i--) {
		// 		ctx.fillStyle = '#32363c';
		// 		ctx.fillRect(0, 0, 100, 100);

		// 		ctx.fillStyle = '#dcddde';
		// 		ctx.fillText(i, 35, 35);
		// 		encoder.addFrame(ctx);
		// 	}

		// 	encoder.finish();

		// 	const attachment = new Discord.Attachment(encoder.out.getData(), 'countdown.gif');
		// 	message.channel.send({
		// 		embed: {
		// 			title: 'Testing GIFEncoder',
		// 			image: {
		// 				url: 'attachment://countdown.gif'
		// 			}
		// 		},
		// 		files: [attachment]
		// 	});
		// }

		if(command === 'listroles') {
			let guild = message.guild;
			var text = '';
			message.guild.roles.forEach((role) => {
				text = text + 'role: '+ role.name + ', position: ' + role.position + ', id: ' + role.id + '\n';
			});

			message.channel.send(text);
		}

		if(message.content === '/iamnick') {

			if(message.author.id == 162954397658120192) {
				message.channel.send('Hello Nick!');
			} else if (message.author.id == 161193235790692353) {
				message.channel.send('You are Halish, not Nick!');
			} else {
				message.channel.send('Intruder Alert! Imposter Identified!!');
			}

		}

		if(message.content === '/hello') {
			message.react('💖');
			message.channel.send('Hello <@'+ message.author.id + '>!');
		}

		if(command === 'timer') {
			var countdown = new Date();
			countdown.setMinutes(countdown.getMinutes() + 1);

			var now = new Date().toString();
			var timerEmbed = {
				embed: {
					title: 'Timer Example',
					fields: [
						{
							name: "Started At",
							value: now,
						},
						{
							name: "Ends In",
							value: "1:00 minute"
						}
					]
				}
			}

			if(!args[0]) {
				message.channel.send(timerEmbed).then((newMessage) => {
					var interval = setInterval(function() {
						var now = new Date();
						var diff = countdown - now;

						if(diff < 0 ) {
							clearInterval(interval);
							timerEmbed.embed.fields.push({name: 'Finished At', value: now.toString() });
							newMessage.edit(timerEmbed);
						} else {
							var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
							var seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, 0);

							timerEmbed.embed.fields[1].value = minutes + ':' + seconds + ' minutes';
							newMessage.edit(timerEmbed);
						}

					}, 1000);
				});
			}

			if(args[0] && args[0] === 'alt') {
				var callback = async (message) => {
					var now = new Date();
					var diff = countdown - now;

					var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
					var seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, 0);

					if(diff > 0) {
						await message.edit(minutes + ':' + seconds).then(callback);
					} else {
						await message.edit('Times up!');
					}
				};

				message.channel.send('1:00').then(async (message) => {
					await callback(message);
				});
			}


		}
	});
}

function triggerNightDaily(client, pool, config)
{
	var now = new Date();
	var night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
	var milliseconds = night.getTime() - now.getTime();

	console.log(night, 'night');

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