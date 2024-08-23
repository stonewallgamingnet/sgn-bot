import { it, describe, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest";
import Scribe, { parseJSON } from './Scribe';
// import { ActionRowBuilder, } from "@discordjs/builders";
import { ButtonComponent, TextInputBuilder, ActionRowBuilder } from "discord.js";

describe("Scribe", () => {

    it('creates a message object with no input', () => {
        const message = Scribe.createMessage();

        expect(message).toBeTypeOf("object");
        expect(message).toMatchObject({content: "This is default text."});
    });

    it('createMessage sets content property', () => {
        const testString = "TEST TEXT";

        const message = Scribe.createMessage({textInput: testString});

        expect(message).toMatchObject({content: testString});
    });

    it('sets the attachment property', () => {
        const testAttachment = "TEST ATTACHMENT";

        const message = Scribe.createMessage({attachmentInput: testAttachment});

        expect(message).toMatchObject({files: [testAttachment]});
    });

    it('sets the embed property', () => {
        const testEmbed = "TEST EMBED";

        const message = Scribe.createMessage({embedInput: testEmbed});

        expect(message).toMatchObject({embeds: testEmbed});
    });

    it('creates buttons passed', () => {
        const input = [
            {'label': 'Test Button', 'url': 'https://example.com/link1' },
            {'label': 'Test Button with Emoji', 'url': 'https://example.com/link2', 'emoji': '💖'}
        ]

        const buttons = Scribe.createButtons(input);

        expect(buttons.length).toBe(2);

        expect(buttons[0].data.label).toBe(input[0].label);
        expect(buttons[0].data.url).toBe(input[0].url);
        expect(buttons[0].data.style).toBe(5);

        expect(buttons[1].data.label).toBe(input[1].label);
        expect(buttons[1].data.url).toBe(input[1].url);
        expect(buttons[1].data.emoji.name).toBe(input[1].emoji);
        expect(buttons[0].data.style).toBe(5);
    });

    // TODO: to do this properly, we need to mock out ModalSubmitInteraction
    // and pass in the components as part of ModalSubmitFields, but I don't wanna right now
    it('calls edit on message when text passed in', async () => {
        const message = {
            edit: vi.fn().mockResolvedValue(),
        };

        const interaction = {
            fields: {
                getTextInputValue: vi.fn().mockImplementation(fieldName => {
                    if(fieldName == 'textInput') {
                        return "This is the test message";
                    }

                    return '';
                })
            },
            reply: vi.fn()
        };

        await Scribe.updateMessage(message, interaction);

        expect(message.edit).toHaveBeenCalledWith({content: "This is the test message"});
        expect(interaction.reply).toHaveBeenCalled();
    });

    it('gives error if embed input is malformed', async () => {
        const message = {
            edit: vi.fn().mockResolvedValue(),
        };

        const interaction = {
            fields: {
                getTextInputValue: vi.fn().mockImplementation(fieldName => {
                    if(fieldName == 'embedInput') {
                        return "[";
                    }

                    return '';
                })
            },
            reply: vi.fn()
        };

        await Scribe.updateMessage(message, interaction);

        expect(message.edit).toHaveBeenCalled();
        expect(interaction.reply).toHaveBeenCalled({content: "There was an error with your embed."});
    });

    it('gives error if button input is malformed', async () => {
        const message = {
            edit: vi.fn().mockResolvedValue(),
        };

        const interaction = {
            fields: {
                getTextInputValue: vi.fn().mockImplementation(fieldName => {
                    if(fieldName == 'buttonInput') {
                        return "[";
                    }

                    return '';
                })
            },
            reply: vi.fn()
        };

        await Scribe.updateMessage(message, interaction);

        expect(message.edit).toHaveBeenCalled();
        expect(interaction.reply).toHaveBeenCalledWith({content: "There was an error with your buttons.", ephemeral: true});
    });

    it('catches error and returns message if edit fails', async () => {
        const message = {
            edit: vi.fn().mockRejectedValue(),
        };

        const interaction = {
            fields: {
                getTextInputValue: vi.fn().mockReturnValue('')
            },
            reply: vi.fn()
        };

        await Scribe.updateMessage(message, interaction);

        expect(message.edit).toHaveBeenCalled();
        expect(interaction.reply).toHaveBeenCalledWith({content: expect.stringContaining("There was an error."), ephemeral: true});
    });

    it('sets the buttons property', () => {
        const testButtons = [{label: "TEST LABEL", url: 'https://example.com/'}, {label: "TEST LABEL", url: 'https://example.com/'}];

        const message = Scribe.createMessage({buttonsInput: testButtons});
    
        const row = message.components[0];
        const buttons = row.components;
       
        expect(row).toBeTypeOf('object');
        expect(row.data.type).toBe(1);
        
        expect(buttons[0].data.label).toBe(testButtons[0].label);
        expect(buttons[0].data.url).toBe(testButtons[0].url);
    });

    it('returns valid json after parsing', () => {
        const input = `[{"VALID": "JSON"}]`;

        const result = parseJSON(input);

        expect(result).toEqual([{VALID: "JSON"}]);
    });

    it('returns false when invalid json', () => {
        const input = ``;

        const result = parseJSON(input)

        expect(result).toBeFalsy();
    });

    it('creates a modal class with input values', () => {
        const id = "TESTID";
        const textValue = "TEST TEXT";
        const embedValue = "TEST EMBED";
        const buttonsValue = "TEST BUTTONS";

        const spy = vi.spyOn(TextInputBuilder.prototype, 'setValue');

        const modal = Scribe.createModal({id, textValue, embedValue, buttonsValue});

        expect(modal).toBeTypeOf("object");
        expect(modal.data.custom_id).toBe("editMessage" + id);
        expect(spy).toHaveBeenCalledWith(textValue);
        expect(spy).toHaveBeenCalledWith(embedValue);
        expect(spy).toHaveBeenCalledWith(buttonsValue);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('converts buttons to objects', () => {
        const testButtons = [
            new ButtonComponent({
                type: 5, 
                label: "TEST LABEL",
                url: "https://example.com",
            })
        ];
     
        const result = Scribe.convertButtonsToObjects(testButtons);
        
        expect(result).toStrictEqual([{label: "TEST LABEL", url: "https://example.com"}]);
    });

    it('converts buttons to objects with emoji', () => {
        const testButtons = [
            new ButtonComponent({
                label: "TEST BUTTON 1",
                url: "https://example.com/test1",
                emoji: {
                    id: 1
                }
            }),
            new ButtonComponent({
                label: "TEST BUTTON 2",
                url: "https://example.com/test2",
                emoji: {
                    name: "smile"
                }
            })
        ];

        const match = [
            {
                label: "TEST BUTTON 1",
                url: "https://example.com/test1",
                emoji: 1
            },
            {
                label: "TEST BUTTON 2",
                url: "https://example.com/test2",
                emoji: "smile"
            }
        ];

        const result = Scribe.convertButtonsToObjects(testButtons);

        expect(result).toStrictEqual(match);

    });

});