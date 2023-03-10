import {it, expect, vi, skip } from 'vitest';
import MockDiscord from '../../tests/mockDiscord';
import DiscordUser from '../models/DiscordUser';
const spy = vi.spyOn(DiscordUser, 'updateOrAddNew').mockReturnValue(true);
// vi.mock('../models/DiscordUser');


// DiscordUser.prototype.updateOrAddNew = spy;
import guildMemberAdd from './guildMemberAdd';
// import client from '../client';

// import { Client, GatewayIntentBits } from 'discord.js';

it.skip('calls updateOrAddNew on guildMemberAdd', async () => {
    // const client = new Client({intents: [ GatewayIntentBits.GuildMembers]});
    
    DiscordUser.updateOrAddNew = spy;

    const mockDiscord = new MockDiscord();
    const guildMember = mockDiscord.getGuildMember();

    await guildMemberAdd.execute(guildMember);

    // client.emit('guildMemberAdd', guildMember);

    expect(spy).toBeCalled();
});