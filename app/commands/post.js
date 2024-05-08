const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createMessage, parseJSON } = require('../Scribe');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post')
        .setDescription('Posts a new sgnBot message in a specified channel')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to post into')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('text')
                .setDescription('The text to be posted. Can be edited later.')
                .setMaxLength(2000)
        )
        .addAttachmentOption(option => 
            option.setName('attachment')
                .setDescription('Include attachment in post')
        )
        .addStringOption(option => 
            option.setName('embed')
                .setDescription('Include embed in post, formatted as JSON')
        )
        .addStringOption(option => 
            option.setName('buttons')
                .setDescription('Add buttons to end of post')
        )
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const textInput = interaction.options.getString('text');
        const attachment = interaction.options.getAttachment('attachment');
        const embedInput = interaction.options.getString('embed');
        const buttonsInput = interaction.options.getString('buttons');
        const errors = [];

        const parsedEmbeds = parseJSON(embedInput);
        const parsedButtons = parseJSON(buttonsInput);
   
        if(embedInput && !parsedEmbeds) { errors.push("There was an error with your embed."); }
        if(buttonsInput && !parsedButtons) { errors.push("There was an error with your buttons."); }

        const message = createMessage({
            textInput: textInput,
            attachmentInput: attachment,
            embedInput: parsedEmbeds,
            buttonsInput: parsedButtons
        });

        channel.send(message);

        interaction.reply({content: errors.length ? errors.join('\n\r') : 'Message created!', ephemeral: true});
    }
}