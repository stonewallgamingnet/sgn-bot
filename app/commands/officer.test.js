import { it, expect, describe, vi, afterAll, afterEach } from 'vitest';
import { user1 } from '../../test-users.js';
import officer from './officer';
import MockDiscord from '../../tests/mockDiscord';
import client from '../client';

const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
let guildMember = await guild.members.fetch(user1.user_id);
const role = guild.roles.cache.get(process.env.OFFICER_ROLE_ID);

describe('Officer Command', () => {

    afterEach(async () => {
        await guildMember.roles.remove(process.env.OFFICER_ROLE_ID);
    })

    it('adds officer role if user doesn\'t have  role', async () => {
        const command = {'id': 'officer', 'name': 'officer', 'type': 1};
        const discord = new MockDiscord({ command });

        const interaction = discord.getInteraction();
        interaction.targetMember = guildMember;
        const spy = vi.spyOn(interaction, 'reply');

        await officer.execute(interaction);

        // force the server to update guildMember state before we check roles!
        guildMember = await guildMember.fetch(true);

        expect(guildMember.roles.cache.has(process.env.OFFICER_ROLE_ID)).toBeTruthy();
        expect(spy).toHaveBeenCalled();
    });

    it('removes officer role if user has role', async () => {
        const command = {'id': 'officer', 'name': 'officer', 'type': 1};
        const discord = new MockDiscord({ command });

        await guildMember.roles.add(process.env.OFFICER_ROLE_ID);
        guildMember = await guildMember.fetch(true);

        const interaction = discord.getInteraction();
        interaction.targetMember = guildMember;
        const spy = vi.spyOn(interaction, 'reply');

        await officer.execute(interaction);

        // force the server to update guildMember state before we check roles!
        guildMember = await guildMember.fetch(true);

        expect(guildMember.roles.cache.has(process.env.OFFICER_ROLE_ID)).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });

});