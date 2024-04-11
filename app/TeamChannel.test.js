import { it, describe, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import TeamChannel from './TeamChannel';
// import MockDiscord from "../tests/mockDiscord";
import client from './client';
import { ChannelType, OverwriteType, PermissionsBitField, Team } from "discord.js";
import { user1 } from '../test-users.js';

let testCategory;
let testChannel;

beforeEach(async () => {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    testCategory = await guild.channels.create({
        name: '🥇 TEAM UP - TEST CHANNEL',
        type: ChannelType.GuildCategory
    });
    testChannel = await guild.channels.create({
        name: 'testchannel',
        type: ChannelType.GuildVoice
    });
    
    return await testChannel.setParent(testCategory);
});

afterEach(async () => {
    return Promise.all([
        testChannel.delete(),
        testCategory.delete()
    ]);
});

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
    const teamChannel = new TeamChannel(testChannel);
    expect(teamChannel.isLocked()).toBeFalsy();
});

it('isLocked returns true when channel is locked', async () => {
    await testChannel.permissionOverwrites.create(process.env.DISCORD_GUILD_ID, { Connect: false });

    const teamChannel = new TeamChannel(testChannel);

    expect(teamChannel.isLocked()).toBeTruthy();
});

it('locks channel after calling lock', async () => {
    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.lock();

    const permissions = testChannel.permissionsFor(process.env.DISCORD_GUILD_ID);
    
    expect(permissions.has(PermissionsBitField.Flags.Connect)).toBeFalsy();
    expect(teamChannel.channel.parent.name.includes('🔒')).toBeTruthy();
});

it('unlocks channel after calling unlock', async () => {
    await testChannel.permissionOverwrites.create(process.env.DISCORD_GUILD_ID, {Connect: false});
    await testCategory.setName('🥇 TEAM UP - DIFFERENT NAME');

    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.unlock();

    const permissions = testChannel.permissionsFor(process.env.DISCORD_GUILD_ID);
    
    expect(permissions.has(PermissionsBitField.Flags.Connect)).toBeTruthy();
    expect(teamChannel.channel.parent.name.includes('🔒')).toBeFalsy();
});

it('adds permissions when a member is invited', async () => {
    await testChannel.permissionOverwrites.create(process.env.DISCORD_GUILD_ID, {Connect: false});
    const teamChannel = new TeamChannel(testChannel);

    await teamChannel.invite(user1.user_id);

    const permissions = await testChannel.permissionsFor(user1.user_id);

    expect(permissions.has(PermissionsBitField.Flags.Connect)).toBeTruthy();
});

it('renames the category', async () => {
    const teamChannel = new TeamChannel(testChannel);
    const newName = 'NEW NAME';

    await teamChannel.rename(newName);

    expect(testCategory.name).toEqual('TEAM UP - NEW NAME');
});

it('it shortens channel names that are too long', async () => {
    const teamChannel = new TeamChannel(testChannel);
    const newName = 'thisisareallylongstringthatstoolongtobeachannelnamethishastobeoveronehundredcharacterstotesteverypossibility';

    await teamChannel.rename(newName);

    expect(testCategory.name).toEqual('TEAM UP - thisisareallylongstringthatstoolongtobeachannelnamethishastobeoveronehundredcharacterstot');
});

it('resets the channel', async () => {
    const teamChannel = new TeamChannel(testChannel);

    await testChannel.permissionOverwrites.create(process.env.DISCORD_GUILD_ID, {Connect: false});
    await testChannel.permissionOverwrites.create(user1.user_id, {Connect: true});

    await teamChannel.reset();

    const permissions = testChannel.permissionsFor(process.env.DISCORD_GUILD_ID);
    expect(permissions.has(PermissionsBitField.Flags.Connect)).toBeTruthy();
    expect(testChannel.permissionOverwrites.cache.has(user1.user_id)).toBeFalsy();
    expect(testCategory.name).toEqual('TEAM UP - EMPTY');
});