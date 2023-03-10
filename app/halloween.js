const join = require('./embeds/halloween/join');
const pool = require('./mysql');

class Halloween {
    constructor(client, db, config) {
        this.client = client;
        // this.db = pool;
    }

    async loadSettings() {
        let sql = "SELECT * FROM bot_settings WHERE id = 1;"
        // let pool = await getPool;
        let [settings,] = await pool.execute(sql);
        console.log(settings);
        this.settings = settings[0];
    }

    createJoinPrompt(message) {
        let sql = "UPDATE bot_settings SET join_message_id = ? WHERE id = 1;";
        let joinEmbed = require('./embeds/halloween/join');
        let joinPrompt = message.channel.send('', joinEmbed);
        
        joinPrompt.then(message => {

            this.db.execute(sql, [message.id]).then(() => {
                message.react('✅');
            });
            
        });
    }

    async addPlayer(reaction, user) {
        if(user.bot || reaction.emoji.toString() != '✅') { return; }

        let member = await reaction.message.guild.fetchMember(user);
        var [results,] = await pool.execute('SELECT * FROM `halloween_players` WHERE member_id = ?', [member.id]);

        if(!results.length) {
            var sql = `SELECT a.*, count(b.id) as player_count
                       FROM halloween_factions AS a
                       LEFT JOIN halloween_players AS b ON a.id = b.faction_id
                       GROUP BY b.faction_id
                       ORDER BY count(b.id) ASC, RAND()
                       LIMIT 1`;

            var [results,] = await pool.execute(sql);
            var faction = results[0];

            var [results,] = await pool.execute(
                'INSERT INTO `halloween_players` (member_id, username, faction_id) VALUES (?, ?, ?)',
                [member.id, user.username, faction.id]
            );

        }
    }

    removePlayer(reaction, user) {

    }

    async assignTeams(guild) {
        let [players, ] = await pool.execute("SELECT * FROM halloween_players");
        let [factions, ] = await pool.execute("SELECT * FROM halloween_factions");

        let factionsById = {};

        for(let index in factions) {
            factionsById[factions[index].id] = factions[index];
        }

        for(let index in players) {
            let player = players[index];
            console.log(players[index]);

            let role = guild.roles.get(factionsById[player.faction_id].role_id);
           
        }

    }

    createVotingPrompts() {

    }

    createKillPrompt() {

    }

    createProtectPrompt() {

    }
}


module.exports = Halloween;