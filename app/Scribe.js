const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
// import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

function parseJSON(string) {
    try {
        let json = JSON.parse(string);
        return json;
    } catch {
        return false;
    }
}

function createModal({id, textValue, embedValue, buttonsValue}) {
    const modal = new ModalBuilder()
        .setCustomId('editMessage' + id)
        .setTitle('Edit message');

    const textInput = new TextInputBuilder()
        .setMaxLength(2000)
        .setCustomId('textInput')
        .setLabel('Content')
        .setValue(textValue)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const embedInput = new TextInputBuilder()
        .setCustomId('embedInput')
        .setLabel('Embed')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setValue(embedValue);

    const buttonInput = new TextInputBuilder()
        .setCustomId('buttonInput')
        .setLabel('Buttons')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setValue(buttonsValue);

    modal.addComponents([
        new ActionRowBuilder().addComponents(textInput),
        new ActionRowBuilder().addComponents(embedInput),
        new ActionRowBuilder().addComponents(buttonInput)
    ]);

    return modal;
}

function convertButtonsToObjects(buttons) {
    return buttons.map(button => ({
        label: button.label,
        url: button.url,
        // if the button has an emoji, 
        // check if it has an id
        // if it does return id, if not return name
        // if it doesn't return null
        ...(button?.emoji && {emoji: button.emoji?.id ? button.emoji.id : button.emoji.name} )
    }));
}

async function updateMessage(message, interaction) {
    const errors = [];
    
    const textInput = interaction.fields.getTextInputValue('textInput');
    const embedInput = interaction.fields.getTextInputValue('embedInput');
    const buttonsInput = interaction.fields.getTextInputValue('buttonInput');

    const parsedEmbeds = parseJSON(embedInput);
    const parsedButtons = parseJSON(buttonsInput);

    if(embedInput && !parsedEmbeds) { errors.push("There was an error with your embed."); }
    if(buttonsInput && !parsedButtons) { errors.push("There was an error with your buttons."); }

    const options = module.exports.createMessage({ textInput, parsedEmbeds, parsedButtons});

    await message.edit(options)
        .then(() => interaction.reply({content: errors.length ? errors.join('\n\r') : 'Message updated!', ephemeral: true}))
        .catch(e => interaction.reply({
            content: "# There was an error. \n\r You should screenshot this and show Nick \n\r " + JSON.stringify(e), 
            ephemeral: true
        })); 
}

function createButtons(buttons) {
    return buttons.map((button) => (
        new ButtonBuilder({
            style: ButtonStyle.Link,
            label: button.label,
            url: button.url,
            ...(button?.emoji && {emoji: button.emoji})
        })
    ));
}

function createMessage({textInput = false, attachmentInput = false, embedInput = false, buttonsInput = false} = {}) {
    const options = {};

    if(textInput) {
        options.content = textInput;
    }

    if(attachmentInput) {
        options.files = [attachmentInput];
    }

    if(embedInput) {
        options.embeds = embedInput;
    }

    if(buttonsInput) {
        const row = new ActionRowBuilder()
                    .addComponents(module.exports.createButtons(buttonsInput));
        options.components = [row];
    }

    if(!textInput && !attachmentInput && !embedInput && !buttonsInput) {
        options.content = 'This is default text.';
    }

    return options;
}

module.exports = {
    parseJSON,
    convertButtonsToObjects,
    updateMessage,
    createButtons,
    createMessage,
    createModal
}