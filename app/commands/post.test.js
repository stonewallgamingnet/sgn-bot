import { describe, expect, it, vi } from 'vitest';
import { getParsedCommand, mockInteractionAndSpyReply } from "../../tests/testutils";
import { data, execute } from '../commands/post';
import MockDiscord from '../../tests/mockDiscord';
import { Attachment } from 'discord.js';


describe('PostCommand', () => {

    it('posts message as bot in specified channel', async () => {
        // const command = getParsedCommand('/post channel:text-channel-id text:"this is text"', data);  
        const discord = new MockDiscord();
        const text = "this is the text to post";
        const command = {
            id: 'post',
            name: 'post',
            type: 1,
            options: [
                {
                    name: 'channel',
                    value: discord.getTextChannel().id,
                    type: 7,
                },
                {
                    name: 'text',
                    type: 3,
                    value: text
                }
            ],
            resolved: {
                channels: {
                    [discord.getTextChannel().id]: {
                        id: discord.getTextChannel().id,
                        name: discord.getTextChannel().name,
                        parent: discord.getTextChannel().parent
                    }
                }
            }
        };

        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledWith({content: text});
    });

    it('posts embed as bot in specified channel', async () => {
        // const command = getParsedCommand('/post channel:text-channel-id text:"this is text"', data);  
        const discord = new MockDiscord();
        const result = {
            "title": "This is the title",
            "description": "This is the description"
        };
        const input = '{"title":"This is the title","description":"This is the description"}';
        const command = {
            id: 'post',
            name: 'post',
            type: 1,
            options: [
                {
                    name: 'channel',
                    value: discord.getTextChannel().id,
                    type: 7,
                },
                {
                    name: 'embed',
                    type: 3,
                    value: input
                }
            ],
            resolved: {
                channels: {
                    [discord.getTextChannel().id]: {
                        id: discord.getTextChannel().id,
                        name: discord.getTextChannel().name,
                        parent: discord.getTextChannel().parent
                    }
                }
            }
        };

        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledWith({embeds: result});
    });

    it.skip('posts attachment in specified channel', () => {
        const discord = new MockDiscord();
        const attachment = new Attachment({url: 'url', name: 'filename', id: '123456'});
        const command = {
            id: 'post',
            name: 'post',
            type: 1,
            options: [
                {
                    name: 'channel',
                    value: discord.getTextChannel().id,
                    type: 7,
                },
                {
                    name: 'attachment',
                    type: 11,
                    value: '123456',
                    attachment: attachment
                }
            ],
            resolved: {
                channels: {
                    [discord.getTextChannel().id]: {
                        id: discord.getTextChannel().id,
                        name: discord.getTextChannel().name,
                        parent: discord.getTextChannel().parent
                    }
                }
            }
        };

        const channelSpy = vi.spyOn(discord.getTextChannel(), 'send');
        const interaction = discord.getChatInputInteraction(command);
        const spy = vi.spyOn(interaction, 'reply');

        execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledOnce();
        expect(channelSpy).toHaveBeenCalledWith({files: [attachment]});
    });

});