const config = process.env.NODE_ENV === 'production' ? {path: '/var/data/sgnbot/.env'} : {};
require('dotenv').config(config);

const client = require('./app/client');
const fs = require('node:fs');
const path = require('node:path');
const { Collection, Events } = require('discord.js');

client.commands = new Collection();
client.modals = new Collection();

const commandsPath = path.join(__dirname, 'app', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.includes('test'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const eventsPath = path.join(__dirname, 'app', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && !file.includes('test'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// const modalsPath = path.join(__dirname, 'app', 'modals');
// const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js') && !file.includes('test'));

// for ( const file of modalFiles) {
// 	const filePath = path.join(modalsPath, file);
// 	const modal = require(filePath);

// 	client.modals.set(modal.name, modal);
// }