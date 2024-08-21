import { it, expect, describe, vi } from 'vitest';
import { execute, data } from './academy';
import { getParsedCommand, mockInteractionAndSpyReply } from '../../tests/testutils';
import MockDiscord  from '../../tests/mockDiscord';

describe ("Academy Command", () => {
    it('it calls reply', () => {
        const discord = new MockDiscord();
        const command = {
            "id": "academy",
            "name": "academy", 
            "type": 1,
            options: [
                {
                    name: "volume",
                    type: 4,
                    value: 1
                },
                {
                    name: "chapter",
                    type: 4,
                    value: 1
                }
            ]
        };
        
        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
    });

    it('tells the user if no matches are found', () => {
        const discord = new MockDiscord();
        const command = {
            "id": "academy",
            "name": "academy", 
            "type": 1,
            options: [
                {
                    name: "volume",
                    type: 4,
                    value: 1
                },
                {
                    name: "chapter",
                    type: 4,
                    value: 99
                }
            ]
        };
        
        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
    });
});