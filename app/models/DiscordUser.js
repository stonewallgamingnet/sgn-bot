const { pool } = require('../mysql');

class DiscordUser {

    static tableName = "#__memberops_discordusers".replace('#__', process.env.MEMBEROPS_DB_PREFIX);
    static db = pool;

    constructor(data = {}) {
        this.data = data;
    }

    static fromGuildMember(guildMember) {
        const discordUser = new DiscordUser();

        // discordUser.data = {
        //     nickname: guildMember.nickname,
        //     checked_on: new Date(),
        //     username: guildMember.user.username,
        //     discriminator: guildMember.user.discriminator,
        //     user_id: guildMember.user.id,
        //     joined_on: guildMember.joinedAt,
        //     presence: guildMember.presence?.status ? guildMember.presence.status : 'offline',
        //     removed: 0,
        //     removed_on: null
        // }

        discordUser.setData(guildMember);

        return discordUser;
    }

    setData(guildMember) {
        this.data = {
            ...this.data,
            nickname: guildMember.nickname,
            checked_on: new Date(),
            username: guildMember.user.username,
            discriminator: guildMember.user.discriminator,
            user_id: guildMember.user.id,
            joined_on: guildMember.joinedAt,
            presence: guildMember.presence?.status ? guildMember.presence.status : 'offline',
            removed: 0,
            removed_on: null
        }
    }

    static async findOrAddNew(guildMember) {
        let discordUser = await this.findByUserId(guildMember.user.id);

        if(!discordUser) {
            discordUser = DiscordUser.fromGuildMember(guildMember);
            discordUser.insert();
        }
    
        return discordUser;
    }

    static async updateOrAddNew(guildMember) {
        let discordUser = await this.findByUserId(guildMember.user.id);
    
        if(!discordUser) {
            discordUser = DiscordUser.fromGuildMember(guildMember);
        } else {
            discordUser.setData(guildMember);
        }

        discordUser.save();
    
        return discordUser;
    }
    
    static async findByUserId(userId) {
        let user;
        const sql = "SELECT * FROM " + DiscordUser.tableName + " WHERE user_id = ?";
    
        try {
            [user,] = await DiscordUser.db.execute(sql, [userId]);
        } catch(e) {
            console.log("Failed to find user by Id");
        }

        return (user && user.length) ? new DiscordUser({...user[0]}) : null;
    }

    async save() {
        return this.data.id ? this.update() : this.insert();
    }

    async insert() {
        var sql = "INSERT INTO " + DiscordUser.tableName + " ";
        sql += "(" + Object.keys(this.data).join(', ') + ")";
        sql += " VALUES (" + new Array(Object.keys(this.data).length).fill('?').join(', ') + ")";
    
        const values = Object.values(this.data);
        try {
            const [result,] = await DiscordUser.db.execute(sql, values);
            this.id = result.insertId;
            return result;
        } catch(e) {
            console.error('Failed to insert new user');
            return false;
        }
    
    }
    
    async update() {
        const fields = Object.keys(this.data).filter(k => k != 'id').map((key) => {
            return key + " = ?";
        });

        const sql = `UPDATE  ${DiscordUser.tableName} 
                     SET ${fields.join(', ')}
                     WHERE id = ${this.data.id}`;
    
        const values = Object.entries(this.data).filter(p => p[0] != 'id').map(([key, value]) => {
            return value;
        });

        var [results, ] = await DiscordUser.db.execute(sql, values);

        return results;
    }

    async markRemoved() {
        const sql = `UPDATE ${DiscordUser.tableName} 
                   SET removed = ?, removed_on = ?, checked_on = ?, presence = ? 
                   WHERE id = ?`;
    
        return DiscordUser.db.execute(sql, [1, new Date(), new Date(), 'offline', this.data.id]);
    }

}

module.exports = DiscordUser;
