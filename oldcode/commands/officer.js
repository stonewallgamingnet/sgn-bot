var config = require('../configs/config');

module.exports = {
	name: 'officer',
	description: 'promote/demote users to the officer rank',
	adminOnly: true,
	execute(message, args) {
        
        if(!message.member.roles.has(config['officer-role'])) {
            message.channel.send('Only Officers can use this command.');
            return;
        }
        
        var mentioned = message.mentions.members.first();
        if(!mentioned) {
            message.channel.send('You must mention a user to promote/demote!');
            return;
        }

        if(args[0] === 'demote') {
            mentioned.removeRole(config['officer-role']);
        }

        if(args[0] === 'promote') {
            mentioned.addRole(config['officer-role']);
        }
	}
};