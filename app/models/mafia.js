const Collection = require('discord.js/src/util/Collection');
const Player = require('./player.js')

const emojis = [
    '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟',
    '🇦','🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭',
    '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵',
    '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽',
    '🇾', '🇿', '0⃣' ];

function Mafia(guild, host, theme) {
	// this.client = client;
	this.guild = guild;
	this.host = host;
	this.theme = theme;
	this.category = null;
	this.channels = {};
	this.roles = {};
	this.players = new Collection();
	this.spectators = [];

	var getMemberByUser = function(user) {



		return this.players[user.id];
	}
}

Mafia.prototype.startup = async function(players, spectators) {
	var roles = await Promise.all([
		this.guild.createRole({name: 'Alive', hoist: true}),
		this.guild.createRole({name: 'Dead', hoist: true, color: [84, 110, 122]}),
		this.guild.createRole({name: 'Spectators', hoist: true})
	]);

	roles.forEach((role) => {
		this.roles[role.name.toLowerCase()] = role;
	});

	players.forEach((user) => {
		this.guild.fetchMember(user).then((member) => {
			var player = new Player(user, member);
			this.players.set(user.id, player);
			member.addRole(this.roles.alive);
		}).catch(console.log);
	});

	if(spectators) {
		spectators.forEach((spectator) => {
			this.guild.fetchMember(spectator).then((member) => {
				this.spectators.push(member);
				member.addRole(this.roles.spectators);
			});
		});
	}

	var basePermissions = [{
			id: this.guild.id,
			deny: ['VIEW_CHANNEL', 'CONNECT']
		},
		{
			id: '377305806321877004',
			allow: ['MANAGE_CHANNELS','VIEW_CHANNEL', 'SEND_MESSAGES']
		}];

	var category = this.guild.createChannel(this.theme.game, 'category', basePermissions.concat([{
			id: this.roles.alive.id,
			allow: ['VIEW_CHANNEL']
		},
		{
			id: this.roles.dead.id,
			allow: ['VIEW_CHANNEL']
		},
		{
			id: this.roles.spectators.id,
			allow: ['VIEW_CHANNEL']
	}]));

	category.then((category) => {
		this.category = category;

		var channelNames = ['town', 'dead', 'mafia', 'jail'];

		Promise.all([
			this.guild.createChannel(this.theme.rooms.town, 'text', basePermissions.concat([
					{
						id: this.roles.alive.id,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
					},
					{
						id: this.roles.dead.id,
						allow: ['VIEW_CHANNEL'],
						deny: ['SEND_MESSAGES']
					},
					{
						id: this.roles.spectators.id,
						allow: ['VIEW_CHANNEL'],
						deny: ['SEND_MESSAGES', 'ADD_REACTIONS']
					}
				])),
			this.guild.createChannel(this.theme.rooms.dead, 'text', basePermissions.concat([{
					id: this.roles.dead.id,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
				},
				{
					id: this.roles.alive.id,
					deny: ['VIEW_CHANNEL']
				}])),
			this.guild.createChannel(this.theme.rooms.mafia, 'text', basePermissions),
			this.guild.createChannel(this.theme.rooms.jail, 'text', basePermissions)
		]).then((channels) => {
			channels.forEach(channel => {
				channel.setParent(category);
			});

			for (var i = 0; i < channelNames.length; i++) {
				this.channels[channelNames[i]] = channels[i];
			}

			this.channels.town.send('@everyone, Welcome to ' + this.theme.game + '!');

		});
	});

	return category;
}

Mafia.prototype.beginCycle = function() {

}

Mafia.prototype.triggerVote = function() {
	var instructions = '';
	var trialReactions = new Array();
	var emojisToUser = {};
	var index = 0;

	this.players.forEach(function(player) {
		if(!player.roles.has(this.roles.dead.id)) {
			instructions += 'Vote ' + emojis[index] + ' for <@' + player.id + '>\n';
			trialReactions.push(emojis[index]);
			emojisToUser[emojis[index]] = player;
			index++;
		}
		// else {
		// 	instructions += '<@' + player.id + '> (Deceased)\n';
		// }
	});

	//trialPrompt.embed.fields[0].value = instructions;

	var trialEmbed = {
		embed: {
			title: 'Trial Selection',
			description: 'React below to put a player on trial.',
			fields: [
				{
					name: "Instructions",
					value: instructions
				},
				{
					name: 'Voting Ends In',
					value: '3:00'
				}
			]
		}
	};

	var trialPrompt = this.channels.town.send(trialEmbed);
	const trialFilter = (reaction, user) => {
		return trialReactions.includes(reaction.emoji.name);
	}

	const asyncForEach = async (array, callback) => {
		for (let i = 0; i < array.length; i++) {
			await callback(array[i], i, array);
		}
	}

	trialPrompt.then((trialPrompt) => {
		var countdown = new Date();
		countdown.setMinutes(countdown.getMinutes() + 3);
		asyncForEach(trialReactions, async (reaction) => {
			await trialPrompt.react(reaction);
		});

		// var callback = async (message) => {
		// 	var now = new Date();
		// 	var diff = countdown - now;

		// 	var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		// 	var seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, 0);

		// 	if(diff > 0) {
		// 		await message.edit(minutes + ':' + seconds).then(callback);
		// 	} else {
		// 		await message.edit('Times up!');
		// 	}
		// };

		
		var trialCollector = trialPrompt.createReactionCollector(trialFilter, {time: 3 * 60 * 1000});

		trialCollector.on('collect', (reaction, reactCollector) => {

			if(this.guild.id === 375133424261791755 && reaction.users.has(162954397658120192) ) {
				var user = emojisToUser[reaction.emoji.name];
				this.killPlayers([user]);
			}

			console.log(reaction);
		});

		trialCollector.on('end', (collected) => {

		});

	});

	// red circle, blue circle, white circle
	var guiltReactions = ['🔴', '🔵', '⚪'];

	// var guilt = 

}

Mafia.prototype.killPlayers = function(users) {
	console.log(this.players.size);
	console.log(this.spectators.length);
	// for some reason, you can still kill a spectator which isn't right.
	users.forEach((user) => {
		if(this.players.has(user.id)) {
			var player = this.players.get(user.id);
			player.member.removeRole(this.roles.alive);
			player.member.addRole(this.roles.dead);
			this.channels.town.send('<@'+ player.member.user.id +'>, you have been killed!');
		}
	});
}

Mafia.prototype.shutdown = function() {

	Promise.all(
		Object.values(this.roles).map(role => role.delete())
	)
	.then(() => {
		return Promise.all(
			Object.values(this.channels).map(channel => channel.delete())
		)
	})
	.then(() => {
		this.category.delete();
	})
	.catch(console.log);

}

module.exports = Mafia;