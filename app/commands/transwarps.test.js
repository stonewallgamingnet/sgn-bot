import { it, expect, describe, vi } from 'vitest';
import { execute, data } from './transwarp';
import { getParsedCommand, mockInteractionAndSpyReply } from '../../tests/testutils';
import MockDiscord  from '../../tests/mockDiscord';

describe("Transwarp Command", () => {
   
    it('it calls reply', () => {
        const discord = new MockDiscord();
        //const command = getParsedCommand("/transwarp destination:sol", data);
        //console.log(command);
        const command = {
            "id": "transwarp",
            "name": "transwarp", 
            "type": 1,
            options: [
                {
                    name: "destination",
                    type: 3,
                    value: "sol" // "teststring"
                }
            ]
        };
        
        // const {interaction, spy} = mockInteractionAndSpyReply(command);

        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();

        // test the result is correct
        // expect(spy).toBeCalledWith({content: "xyz", ephemeral: true});
    });

    it.only('tells the user if no matches are found', () => {
        const discord = new MockDiscord();
        const command = {
            "id": "transwarp",
            "name": "transwarp", 
            "type": 1,
            options: [
                {
                    name: "destination",
                    type: 3,
                    value: "teststring"
                }
            ]
        };
        
        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        
    });

    it('tells the user if too many matches are found', () => {
        const discord = new MockDiscord();
        const command = {
            "id": "transwarp",
            "name": "transwarp", 
            "type": 1,
            options: [
                {
                    name: "destination",
                    type: 3,
                    value: "a"
                }
            ]
        };
        
        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith({ content: `Too many matches found for "a". Please refine your search.`, ephemeral: true });
    });       
    

});