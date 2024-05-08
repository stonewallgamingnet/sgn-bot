import { describe, expect, it, vi } from "vitest";
import { execute } from "./edit";
import { updateMessage } from "../Scribe";
// import MockDiscord from "../../tests/mockDiscord";

describe('EditCommand', () => {

    it("doesn't show modal if message author isn't bot", async () => {
        const interaction = {
            targetMessage: {
                author: {
                    id: 'a-different-users-id'
                },
                id: 1,
                content: "This is the message content",
                embeds: [],
                components: [],
                edit: vi.fn().mockResolvedValue()
            },
            fields: {
                getTextInputValue: vi.fn()
            },
            showModal: vi.fn(),
            reply: vi.fn()
        };

        interaction.awaitModalSubmit = vi.fn().mockResolvedValue(interaction);
        
        await execute(interaction);
        
        expect(interaction.showModal).not.toHaveBeenCalledOnce();
        expect(interaction.awaitModalSubmit).not.toHaveBeenCalled();
    });

    it('triggers the modal when the edit command is sent', async () => {
        /**
         * Couldn't get this to work
         * I always get "users is not iterable"
         * it has something to do with caching and mentions,
         * but I can't figure out what it is. if i ever use typescript
         * i'll have to figure it out, but i want this to be finished.
         */

        // const options = {
        //     message: {
        //         content: 'this is the content'
        //     }
        // };
        // const discord = new MockDiscord(options);
        // const message = discord.getMessage();

        // const command = {
        //     id: 'edit',
        //     name: 'edit',
        //     type: 3,
        //     resolved: {
        //         messages: {
        //             [message.id]: message
        //         }
        //     },
        //     target_id: message.id,
        //     options: [
        //        {
        //             name: 'message',
        //             value: message.id,
        //             type: '_MESSAGE',
        //        }
        //      ]
        // };

        // console.log(message);
        // MessageContextMenuCommandInteraction
        // const interaction = discord.getMessageContextMenuInteraction(command);
        // const spy = vi.spyOn(interaction, 'showModal');

        const interaction = {
            targetMessage: {
                author: {
                    id: process.env.DISCORD_CLIENT_ID
                },
                id: 1,
                content: "This is the message content",
                embeds: [],
                components: [],
                edit: vi.fn().mockResolvedValue()
            },
            fields: {
                getTextInputValue: vi.fn()
            },
            showModal: vi.fn(),
            reply: vi.fn()
        };

        interaction.awaitModalSubmit = vi.fn().mockResolvedValue(interaction);
        
        await execute(interaction);
        
        expect(interaction.showModal).toHaveBeenCalledOnce();
        expect(interaction.awaitModalSubmit).toHaveBeenCalled();
    })

});