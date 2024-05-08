const { TextInputBuilder, ButtonComponent, ActionRowBuilder } = require('discord.js');
const { parseJSON, createModal, convertButtonsToObjects, createButtons, createMessage } = require('./Scribe');

afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
});

test('parseJSON returns false when incorrect json', () => {
    expect(parseJSON("'")).toBeFalsy();
});

test('parseJSON returns true when valid JSON', () => {
    const input = `[{"VALID": "JSON"}]`;
    
    const result = parseJSON(input);
    
    expect(result).toEqual([{VALID: "JSON"}]);
});

test('createModal creates the modal with correct inputs', () => {
    const spy = jest.spyOn(TextInputBuilder.prototype, 'setValue');

    const id = "TESTID";
    const textValue = "TEST TEXT";
    const embedValue = "TEST EMBED";
    const buttonsValue = "TEST BUTTONS";

    const modal = createModal({id, textValue, embedValue, buttonsValue});

    expect(spy).toHaveBeenCalledWith(textValue);
    expect(spy).toHaveBeenCalledWith(embedValue);
    expect(spy).toHaveBeenCalledWith(buttonsValue);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(modal.data.custom_id.includes(id)).toBeTruthy();
    expect(modal.components.length).toBe(3);
});

it('converts buttons to objects', () => {
    const testButtons = [
        new ButtonComponent({
            type: 5, 
            label: "TEST LABEL",
            url: "https://example.com",
        })
    ];
 
    const result = convertButtonsToObjects(testButtons);
    
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

    const result = convertButtonsToObjects(testButtons);

    expect(result).toStrictEqual(match);

});

it('creates a message object with no input', () => {
    const message = createMessage();

    expect(typeof message).toBe("object");
    expect(message).toMatchObject({content: "This is default text."});
});

it('createMessage sets content property', () => {
    const testString = "TEST TEXT";

    const message = createMessage({textInput: testString});

    expect(message).toMatchObject({content: testString});
});

it('sets the attachment property', () => {
    const testAttachment = "TEST ATTACHMENT";

    const message = createMessage({attachmentInput: testAttachment});

    expect(message).toMatchObject({files: [testAttachment]});
});

it('sets the embed property', () => {
    const testEmbed = "TEST EMBED";

    const message = createMessage({embedInput: testEmbed});

    expect(message).toMatchObject({embeds: testEmbed});
});

it('calls createButtons and sets buttons property', () => {
    const Scribe = jest.requireActual('./Scribe');
    const testButtons = [{label: "TEST LABEL", url: 'https://example.com/'}];
    const testRow = new ActionRowBuilder();

    const spy = jest.spyOn(ActionRowBuilder.prototype, 'addComponents')
        .mockImplementation(() => testRow);

    Scribe.createButtons = jest.fn();

    const message = Scribe.createMessage({buttonsInput: testButtons });

    expect(spy).toHaveBeenCalled();
    expect(message).toMatchObject({components: [testRow]});
});