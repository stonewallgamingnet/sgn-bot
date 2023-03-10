import { it, describe, expect, afterAll, beforeAll, afterEach } from 'vitest';
import client from '../client';
import Mafia from './mafia';

const guild = await client.guilds.fetch(process.env.MAFIA_TEST_GUILD_ID);
const mafia = new Mafia({guild, client});

afterAll(async () => {
    let channels = await guild.channels.fetch(null, {force: true});
    
    console.log('channel count: ' + channels.size);

    // removed the await from here
    channels.each( async (channel, key) => {
        // await guild.channels.delete(key);
        // await guild.channels.delete(channel);
        await channel.delete();
    })
});

afterEach(async () => {
    let channels = await guild.channels.fetch()
    channels.each((channel) => channel.delete());
});

describe('createCategory(', () => {

    it('creates a category and returns a promise', async (done) => {
        let category;

        try {
            category = await mafia.createCategory();
            expect(category).resolves();
        } catch ( error ) {
            // expect(error).toBeUndefined();
            // done();
        }

        expect(category.name).toBe('Mafia');

    });


    it.only('creates a category and four child text channels', async () => {

        let {category, channels} = await mafia.createChannels();

        // expect(channels).resolves.toBeUndefined();

        console.log(channels);

        expect(category.children.cache.size).toBe(4);



    });

});