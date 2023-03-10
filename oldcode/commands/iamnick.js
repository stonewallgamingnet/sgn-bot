module.exports = {
	name: 'iamnick',
	description: 'Checks if you\'re Nick.',
	execute(message, args) {
		if(message.author.id == 162954397658120192) {
			message.channel.send('Yes, you\'re Nick!');
		} else if (message.author.id == 161193235790692353) {
			message.channel.send('You are Halish, not Nick!');
		} else {
			message.channel.send('Intruder Alert! Imposter Identified!!');
		}
	},
};