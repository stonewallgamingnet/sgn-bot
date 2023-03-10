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