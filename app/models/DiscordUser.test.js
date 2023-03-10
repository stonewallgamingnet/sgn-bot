import { it, describe, expect, afterAll, beforeAll, afterEach, beforeEach, only, vi } from 'vitest';
import DiscordUser from './DiscordUser';
import MockDiscord from '../../tests/mockDiscord';
import { pool } from '../mysql';
import { 
    truncateDiscordUsersTable,
    insertDiscordUser
} from '../../tests/sql/schema';


beforeEach(async () => { 
    // const [count, ] = await pool.execute('select count(id) from sgn_memberops_discordusers');
    // console.log(count, 'before count');
});

// afterAll(async () => {

// });

afterEach(async () => {
    await pool.execute(truncateDiscordUsersTable.replace('#__', process.env.MEMBEROPS_DB_PREFIX));
    // forces a wait between tests so there's no more timing issues
    // await new Promise((r) => setTimeout(r, 16));
    vi.restoreAllMocks();
});

// it('constructs a new object when guildMember passed in', () => {
//     const mockDiscord = new MockDiscord();
//     const guildMember = mockDiscord.getGuildMember();

//     console.log(guildMember);

//     const discordUser = new DiscordUser(guildMember);

//     expect(discordUser).toBeInstanceOf(DiscordUser);

//     expect(discordUser.fields.nickname).toBe('nick');
//     expect(discordUser.fields.username).toBe('USERNAME');
//     expect(discordUser.fields.discriminator).toBe('0000');
//     // expect(discordUser.fields.pressence).toBe('offline');
//     expect(discordUser.fields.joined_on).toStrictEqual(new Date("2020-01-01"));
// });

// it('sets the id', () => {
//     const mockDiscord = new MockDiscord();
//     const guildMember = mockDiscord.getGuildMember();

//     const discordUser = new DiscordUser(guildMember);

//     expect(discordUser.id).toBeUndefined();

//     discordUser.setId(1);

//     expect(discordUser.id).toBe(1);
// });

// it('throws error if trying to change id', () => {
//     const mockDiscord = new MockDiscord();
//     const guildMember = mockDiscord.getGuildMember();
//     const discordUser = new DiscordUser(guildMember);

//     discordUser.setId(1);
    
//     const resultFn = () => {
//         discordUser.setId(2);
//     }
    
//     expect(resultFn).toThrow('Discord User already has an id');
// });

it('creates a new DiscordUser from a GuildMember', () => {
    const mockDiscord = new MockDiscord();
    const guildMember = mockDiscord.getGuildMember();
    const discordUser = DiscordUser.fromGuildMember(guildMember);

    expect(discordUser).toBeInstanceOf(DiscordUser);

    expect(discordUser.data.nickname).toBe('nick');
    expect(discordUser.data.username).toBe('USERNAME');
    expect(discordUser.data.discriminator).toBe('0000');
    expect(discordUser.data.presence).toBe('offline');
    expect(discordUser.data.joined_on).toStrictEqual(new Date("2020-01-01"));
});

it('sets status to offline if no presence deteced', () => {
    const mockDiscord = new MockDiscord();
    const guildMember = mockDiscord.getGuildMember();

    guildMember.presence.status = undefined;
    // mockDiscord.getGuild().presences.cache.clear();
    
    const discordUser = DiscordUser.fromGuildMember(guildMember);

    expect(discordUser).toBeInstanceOf(DiscordUser);
    
    expect(discordUser.data.presence).toBe('offline');
});

it('inserts a new DiscordUser in the Database', async () => {
    const discordUser = new DiscordUser();
    const data = {
        user_id: 123456789,
        nickname: 'NicholasJohn85',
        username: 'NicholasJohn16',
        discriminator: '1234',
        presence: 'offline',
        member_id: 1,
        joined_on: new Date('2020-01-01'),
        checked_on: new Date('2022-12-07T10:30:00Z'),
        removed: 0,
        removed_on: null
    };

    // set milliseconds to 0 cause mysql doesnt support them
    data.checked_on.setMilliseconds(0);

    discordUser.data = data;

    const result = await discordUser.insert();

    expect(result.affectedRows).toBe(1);

    const sql = `SELECT user_id, nickname, username, discriminator, presence, member_id, joined_on, checked_on, removed, removed_on FROM #__memberops_discordusers`.replace('#__', process.env.MEMBEROPS_DB_PREFIX)
    const [results,] = await pool.execute(sql);
    const selected = {...results[0]};

    expect(selected).toEqual(data);
});

it('updates a Discord User in the database', async () => {
    await pool.execute(insertDiscordUser.replace('#__', process.env.MEMBEROPS_DB_PREFIX));

    const data = {
        id: 1,
        user_id: 234567890,
        nickname: 'NotNicholasJohn85',
        username: 'NotNicholasJohn16',
        discriminator: '2345',
        presence: 'online',
        member_id: 2,
        joined_on: new Date('2022-01-01'),
        removed: 1,
        removed_on: new Date('2022-01-01T12:30:00'),
        checked_on: new Date('2022-12-07T10:30:00Z'),
        notes: "These are notes"
    }

    const discordUser = new DiscordUser(data);
    const result = await discordUser.update();

    expect(result.affectedRows).toBe(1);
    expect(result.insertId).toBe(0);

    const sql = `SELECT * FROM #__memberops_discordusers`.replace('#__', process.env.MEMBEROPS_DB_PREFIX);
    const [results, ] = await pool.execute(sql);
    const selected = {...results[0]};

    expect(selected).toEqual(data);
});

it('calls insert if there is no id when saving', () => {
    const discordUser = new DiscordUser();

    expect(discordUser.data.id).toBeUndefined();

    const spy = vi.spyOn(discordUser, 'insert').mockReturnValue();

    discordUser.save();

    expect(spy).toHaveBeenCalledOnce();
});

it('calls update if there is an id when saving', () => {
    const discordUser = new DiscordUser({id: 1});
    expect(discordUser.data.id).toBe(1);

    const spy = vi.spyOn(discordUser, 'update').mockReturnValue(true);

    discordUser.save();

    expect(spy).toHaveBeenCalledOnce();
});

it('findOrAddNew calls findByUserId and returns discordUser', async () => {
    const guildMember = { user: { id: 123456789 } };

    const findByUserIdSpy = vi.spyOn(DiscordUser, 'findByUserId').mockResolvedValue(guildMember);
    const insertSpy = vi.spyOn(DiscordUser.prototype, 'insert');

    const result = await DiscordUser.findOrAddNew(guildMember);

    expect(findByUserIdSpy).toBeCalledWith(guildMember.user.id);
    expect(insertSpy).not.toBeCalled();
    expect(result).toBe(guildMember);
});

it('findOrAddNew calls insert if a guild member is not found', async () => {
    const guildMember = { user: { id: 123456789 } };
    const discordUser = new DiscordUser();
    discordUser.data = guildMember;

    const findByUserIdSpy = vi.spyOn(DiscordUser, 'findByUserId').mockResolvedValue(null);
    const fromGuildMember = vi.spyOn(DiscordUser, 'fromGuildMember').mockReturnValue(discordUser);
    const insertSpy = vi.spyOn(discordUser, 'insert').mockResolvedValue(guildMember);

    const result = await DiscordUser.findOrAddNew(guildMember);

    expect(findByUserIdSpy).toBeCalledWith(guildMember.user.id);
    expect(fromGuildMember).toBeCalledWith(guildMember);
    expect(insertSpy).toBeCalled();
    expect(result.data).toBe(guildMember);
});

it('updateOrAddNew calls findByUserId, saves changes and returns discordUser', async () => {
    const mockDiscord = new MockDiscord();
    const guildMember = mockDiscord.getGuildMember();

    guildMember.user.id = 123456789;

    const discordUser = new DiscordUser();
    discordUser.data.user_id = guildMember.user.id;

    const findByUserIdSpy = vi.spyOn(DiscordUser, 'findByUserId').mockResolvedValue(discordUser);
    const saveSpy = vi.spyOn(discordUser, 'save');

    const result = await DiscordUser.updateOrAddNew(guildMember);

    expect(findByUserIdSpy).toBeCalledWith(guildMember.user.id);
    expect(saveSpy).toBeCalled();
    expect(result.data.user_id).toBe(guildMember.user.id);
    expect(result).toBeInstanceOf(DiscordUser);
});

it('calls save if a guild member is not found', async () => {
    const guildMember = {user: { id: 123456789 } };
    const discordUser = new DiscordUser();
    discordUser.data.user_id = guildMember.user.id;

    const findByUserIdSpy = vi.spyOn(DiscordUser, 'findByUserId').mockResolvedValue(null);
    const fromGuildMember = vi.spyOn(DiscordUser, 'fromGuildMember').mockReturnValue(discordUser);
    const saveSpy = vi.spyOn(discordUser, 'save').mockResolvedValue(guildMember);

    const result = await DiscordUser.updateOrAddNew(guildMember);

    expect(findByUserIdSpy).toBeCalledWith(guildMember.user.id);
    expect(fromGuildMember).toBeCalledWith(guildMember);
    expect(saveSpy).toBeCalled();
    expect(result.data.user_id).toBe(guildMember.user.id);
});

it('fetches a user from database by id and returns DiscordUser instance', async () => {
    await pool.execute(insertDiscordUser.replace('#__', process.env.MEMBEROPS_DB_PREFIX));

    // const [count, ] = await pool.execute('select count(id) from sgn_memberops_discordusers');
    // console.log(count, 'count');

    const data = {
        id: 1,
        user_id: 123456789,
        nickname: 'NicholasJohn85',
        username: 'NicholasJohn16',
        discriminator: '1234',
        presence: 'offline',
        member_id: 1,
        joined_on: new Date('2020-01-01'),
        removed: 0,
        removed_on: null,
        checked_on: new Date('2022-12-07T10:30:00Z'),
        notes: null
    };

    const discordUser = await DiscordUser.findByUserId(123456789);

    expect(discordUser).toBeInstanceOf(DiscordUser);
    expect(discordUser.data).toEqual(data);

});

it('returns null if no discord user is found by userid', async () => {
    await pool.execute(insertDiscordUser.replace('#__', process.env.MEMBEROPS_DB_PREFIX));

    const discordUser = await DiscordUser.findByUserId(234567891);

    expect(discordUser).toBe(null);
});

it('updates the database when marked as removed', async () => {
    await pool.execute(insertDiscordUser.replace('#__', process.env.MEMBEROPS_DB_PREFIX));

    let discordUser = await DiscordUser.findByUserId(123456789);

    expect(discordUser).toBeInstanceOf(DiscordUser);  

    await discordUser.markRemoved();

    discordUser = await DiscordUser.findByUserId(123456789);

    expect(discordUser.data.removed).toBeTruthy();
    expect(discordUser.data.removed_on).toBeInstanceOf(Date);
    expect(discordUser.data.checked_on).toBeInstanceOf(Date);
    expect(discordUser.data.presence).toBe('offline');
})