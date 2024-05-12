import { it, describe, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest";
import { TeamChannel, isTeamChannel, isCooldown, updateCooldown, getCooldown } from './TeamChannel';
import MockDiscord from "../tests/mockDiscord";
import { Collection, OverwriteType, PermissionOverwrites, PermissionsBitField } from "discord.js";
import { user1 } from '../test-users.js';

beforeAll(() => {
    const discord = new MockDiscord();
    process.env.TEAM_UP_CHANNEL_IDS = discord.getVoiceChannel().id;
});

// beforeEach(async () => {
//     const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
//     testCategory = await guild.channels.create({
//         name: '🥇 TEAM UP - TEST CHANNEL',
//         type: ChannelType.GuildCategory
//     });
//     testChannel = await guild.channels.create({
//         name: 'testchannel',
//         type: ChannelType.GuildVoice
//     });
    
//     return await testChannel.setParent(testCategory);
// });

// afterEach(async () => {
//     return Promise.all([
//         testChannel.delete(),
//         testCategory.delete()
//     ]);
// });

// afterEach(async () => {
//     await testCategory.setName('🥇 TEAM UP - TEST CHANNEL');
//     await testChannel.permissionOverwrites.edit(process.env.DISCORD_GUILD_ID, {Connect: null});
//     const permissions = testChannel.permissionOverwrites.cache;
//    
//     await permissions.each(async (permission) => {
//         if(permission.type === OverwriteType.Member) {
//             await permission.delete();
//         }
//     });
// });

it('isLocked returns false when channel is not locked', () => { 
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();

    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });

    const teamChannel = new TeamChannel(testChannel);
    expect(teamChannel.isLocked()).toBeFalsy();
});

it('isLocked returns true when channel is locked', async () => {
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();

    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().remove('Connect');
    });

    const teamChannel = new TeamChannel(testChannel);

    expect(teamChannel.isLocked()).toBeTruthy();
});

it('locks channel after calling lock', async () => {
    const discord = new MockDiscord();
    const testChannel = discord.getVoiceChannel();

    testChannel.parent.name = "🥇 TEAM UP - EMPTY";
    testChannel.parent.setName = vi.fn();
    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().remove('Connect');
    });
    testChannel.permissionOverwrites = {
        create: vi.fn()
    }

    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.lock();
   
    expect(testChannel.permissionOverwrites.create)
        .toBeCalledWith(discord.getEveryoneRole(), {Connect: false});
    expect(testChannel.parent.setName).toBeCalledWith('🔒 TEAM UP - EMPTY');
});

it('unlocks channel after calling unlock', async () => {
    const discord = new MockDiscord();
    const testChannel = discord.getVoiceChannel();

    testChannel.parent.name = "🔒 TEAM UP - EMPTY";
    testChannel.parent.setName = vi.fn();
    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });
    testChannel.permissionOverwrites = {
        edit: vi.fn()
    }

    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.unlock();
   
    expect(testChannel.permissionOverwrites.edit).toBeCalledWith(discord.getEveryoneRole(), {Connect: null});
    expect(testChannel.parent.setName).toBeCalledWith('🥇 TEAM UP - EMPTY');
});

it('adds permissions when a member is invited', async () => {
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();
    testChannel.permissionOverwrites = {
        create: vi.fn()
    }
  
    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.invite(user1.user_id);

    expect(testChannel.permissionOverwrites.create).toBeCalledWith(user1.user_id, {Connect: true});
});

it('renames the category', async () => {
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();
    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });
    testChannel.parent.setName = vi.fn();
    
    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.rename('NEW NAME');

    expect(testChannel.parent.setName).toBeCalledWith('🥇 TEAM UP - NEW NAME');
});

it('it shortens channel names that are too long', async () => {
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();
    testChannel.permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });
    testChannel.parent.setName = vi.fn();
    
    const teamChannel = new TeamChannel(testChannel);
    
    const newName = 'thisisareallylongstringthatstoolongtobeachannelnamethishastobeoveronehundredcharacterstotesteverypossibility';

    await teamChannel.rename(newName);

    expect(testChannel.parent.setName).toBeCalledWith('🥇 TEAM UP - thisisareallylongstringthatstoolongtobeachannelnamethishastobeoveronehundredcharacterst');
});

it('resets the channel', async () => {
    const discord = new MockDiscord();
    const testChannel = discord.getVoiceChannel();

    testChannel.parent.name = "🔒 TEAM UP - DEAD BY DAYLIGHT";

    testChannel.permissionsFor = vi.fn().mockImplementationOnce(() => {
        return new PermissionsBitField().remove('Connect');
    }).mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });

    const permissionOverwritesCache = new Collection([
        [0, {
            type: OverwriteType.Member,
            delete: vi.fn().mockResolvedValue()
        }],
        [1, {
            type: OverwriteType.Role,
            delete: vi.fn().mockResolvedValue()
        }]
    ]);

    testChannel.permissionOverwrites = {
        edit: vi.fn(),
        cache: permissionOverwritesCache
    };

    testChannel.parent.setName = vi.fn();

    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.reset();

    expect(testChannel.permissionOverwrites.edit).toBeCalledWith(discord.getEveryoneRole(), {Connect: null});
    expect(testChannel.parent.setName).toBeCalledWith('🥇 TEAM UP - EMPTY');

    expect(testChannel.permissionOverwrites.cache.at(0).delete).toBeCalled();
    expect(testChannel.permissionOverwrites.cache.at(1).delete).not.toBeCalled();

});

it('returns true when channel is a team channel', () => {
    const discord = new MockDiscord();

    const testChannel = discord.getVoiceChannel();

    const result = isTeamChannel(testChannel.id);

    expect(result).toBeTruthy();
});

it('returns false when channel is not a team channel', () => {
    const result = isTeamChannel('non-valid-id');

    expect(result).toBeFalsy();
});

describe('isCooldown', () => {

    it('returns true if count is 2 or higher and timeAgo is less then 10 minutes', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [2, Date.now()]);
        
        const result = isCooldown(channel);
        
        expect(result).toBeTruthy();
    });
    
    it('returns false if count is 2 or higher and timeAgo is more than 10 minutes ago', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [2, Date.now() - 15 * 60 * 1000]);
        
        const result = isCooldown(channel);       
       
        expect(result).toBeFalsy();
    });
    
    it('returns false if count is less than 2', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [1, Date.now() + 1000]);
        
        const result = isCooldown(channel);
              
        expect(result).toBeFalsy();
    });

});

describe('updateCooldown', () => {
    it('increases the count if time ago is less than ten minutes', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [4, Date.now() - 1 * 60 * 1000]);
        
        updateCooldown(channel);
        
        expect(client.teamCooldowns.get(channel.id)[0]).toBe(5);
    });

    it('sets the count to 1 if the time ago is more than 10 minutes', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [2, Date.now() - 11 * 60 * 1000]);
        
        updateCooldown(channel);  
       
        expect(client.teamCooldowns.get(channel.id)[0]).toBe(1);
    });

    it('updates the time ago', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();
        
        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [2, Date.now()]);
        
        updateCooldown(channel);  
       
        expect(client.teamCooldowns.get(channel.id)[0]).toBe(3);
    });


});

describe('getCooldown', () => { 
    
    it('returns with the correct number of minutes and seconds', () => {
        const discord = new MockDiscord();
        const client = discord.getClient();
        const channel = discord.getVoiceChannel();

        client.teamCooldowns = new Collection();
        client.teamCooldowns.set(channel.id, [1, Date.now() - (330 * 1000) ]);

        let [minutes, seconds] = getCooldown(channel);

        expect(minutes).toBe(4);
        expect(seconds).toBe(30);

    });

});