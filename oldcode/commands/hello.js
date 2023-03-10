module.exports = {
	name: 'hello',
	description: 'Say Hello to sgnBot',
	execute(message, args) {
		message.react('💖');
		message.channel.send('Hello <@'+ message.author.id + '>!');
	},
};