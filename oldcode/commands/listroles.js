module.exports = {
	name: 'listroles',
	description: 'Lists all roles on the server',
	adminOnly: true,
	execute(message, args) {
		let guild = message.guild;
		var text = '';
		message.guild.roles.forEach((role) => {
			text = text + 'role: '+ role.name + ', position: ' + role.position + ', id: ' + role.id + '\n';
		});

		message.channel.send(text);
	},
};