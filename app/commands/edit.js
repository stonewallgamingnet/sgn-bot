const { ContextMenuCommandBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { updateMessage, createModal, convertButtonsToObjects } = require("../Scribe");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Edit sgnBot message')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        const message = interaction.targetMessage;
        if(message.author.id != process.env.DISCORD_CLIENT_ID) { return; }

        let embed = [];
        let buttons = [];

        if(message.embeds.length) {
            embed = message.embeds[0].data;
            delete embed.type;
        }

        if(message.components.length) {
            buttons = convertButtonsToObjects(message.components[0].components);
        }

        const modal = createModal({
            id: message.id,
            textValue: message.content,
            embedValue: embed ? JSON.stringify(embed) : "",
            buttonsValue: buttons.length ? JSON.stringify(buttons) : ""
        });

        const filter = (interaction) => interaction.customId.startsWith('editMessage');

        interaction.awaitModalSubmit({filter, time: 240_000})
            .then((interaction) => updateMessage(message, interaction))
            .catch(console.error);

        interaction.showModal(modal);
    }
}