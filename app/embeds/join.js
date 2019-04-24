module.exports = function(theme) {
	return {
		embed: {
			title: 'New Game',
			description: 'A new game of ' + theme.game + ' is starting. Click a reaction below to join.',
			fields: [
				{
					name: "Instructions",
					value: `Click \:white_check_mark: to play.\nClick \:eye: to spectate.`
				}
			],
			image: {
				url: ''
			}
		}
	}
}