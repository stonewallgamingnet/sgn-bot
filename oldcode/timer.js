// if(command === 'timer') {
// 	var countdown = new Date();
// 	countdown.setMinutes(countdown.getMinutes() + 1);

// 	var now = new Date().toString();
// 	var timerEmbed = {
// 		embed: {
// 			title: 'Timer Example',
// 			fields: [
// 				{
// 					name: "Started At",
// 					value: now,
// 				},
// 				{
// 					name: "Ends In",
// 					value: "1:00 minute"
// 				}
// 			]
// 		}
// 	}

// 	if(!args[0]) {
// 		message.channel.send(timerEmbed).then((newMessage) => {
// 			var interval = setInterval(function() {
// 				var now = new Date();
// 				var diff = countdown - now;

// 				if(diff < 0 ) {
// 					clearInterval(interval);
// 					timerEmbed.embed.fields.push({name: 'Finished At', value: now.toString() });
// 					newMessage.edit(timerEmbed);
// 				} else {
// 					var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
// 					var seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, 0);

// 					timerEmbed.embed.fields[1].value = minutes + ':' + seconds + ' minutes';
// 					newMessage.edit(timerEmbed);
// 				}

// 			}, 1000);
// 		});
// 	}

// 	if(args[0] && args[0] === 'alt') {
// 		var callback = async (message) => {
// 			var now = new Date();
// 			var diff = countdown - now;

// 			var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
// 			var seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, 0);

// 			if(diff > 0) {
// 				await message.edit(minutes + ':' + seconds).then(callback);
// 			} else {
// 				await message.edit('Times up!');
// 			}
// 		};

// 		message.channel.send('1:00').then(async (message) => {
// 			await callback(message);
// 		});
// 	}
// }
// 