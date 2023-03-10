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