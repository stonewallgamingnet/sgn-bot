const join = require('../embeds/join');
// const pool = require('../mysql');
const Mafia = require('../models/mafia');

// let game = new Mafia();
// game.setTheme('changelings');

let games = new Map;


module.exports = {
	name: 'mafia',
	description: 'Start a mafia event',
	async execute(message, args) {
		let client = message.client;

		if(args[0] == 'new') {
			let joinEmbed = require('../embeds/join')(args[1] ? args[1] : 'mafia');

			const removeOtherReactions = (reaction, user) => {
				return ['✅', '👁'].includes(reaction.emoji.name); // && user.id === message.author.id;
			};

			let joinPrompt = await message.channel.send(joinEmbed);
			await joinPrompt.react('✅');
 			await joinPrompt.react('👁');

			const collector = joinPrompt.createReactionCollector(removeOtherReactions);

			// collector.on('collect', (reaction, reactionCollector) => {
			// 	console.log(`Collected ${reaction.emoji.name}`);

			// 	if(reaction.emoji.name === '✅') {
			// 		players.push(reaction.message.member);
			// 		console.log(players);
			// 	}

			// 	if(reaction.emoji.name === '👁') {

			// 	}
			// });

			joinPrompt.awaitReactions(removeOtherReactions, {time: 1 * 1000}).then(async (collected) => {
				joinPrompt.delete();
				message.delete();
				// needs better handling of reaction cases
				// if there are no players or no spectators
				// maybe set players/spectators to empty Collection instead of null?
				players = spectators = null;
				if(collected.get('✅')) {
					var players = collected.get('✅').users.filter(user => user.id != client.user.id);
				}
				if(collected.get('👁')) {
					var spectators = collected.get('👁').users.filter((user) => {
						return user.id != client.user.id && (players && !players.has(user.id));
					});
				}

				if(players) {
					let game = new Mafia({client: message.client, guild: message.guild, host: message.member});
					
					game.setTheme(args[1] ? args[1] : 'mafia');

					var category = await game.startup(players, spectators);

					games[category.id] = game;
				}
			});


		}

		if(args[0] == 'start') {
			let game = games[message.category.id];

			console.log(game.players);
		}



	}
};

// class Mafia {

// 	addPlayer() {

// 	}

// 	removePlayer() {

// 	}

// 	addSpectator() {

// 	}

// 	removeSpectator() {

// 	}

// }