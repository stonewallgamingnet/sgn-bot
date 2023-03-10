// const Discord = require('discord.js');

// const client = new Discord.Client();
// client.commands = new Discord.Collection();

// const mysql = require('mysql2/promise');

// var config = require('./app/configs/config');

// client.login(config.discord.token);

// client.on('guildMemberAdd', (guildMember) => {
//     console.log('guild Member added.', guildMember);
// });

// // https://dev.to/heymarkkop/how-to-implement-test-and-mock-discordjs-v13-slash-commands-with-typescript-22lc


// const guild = Reflect.construct(Discord.Guild,  [
//     client, 
//     {
//     unavailable: false,
//     id: "guild-id",
//     name: "mocked js guild",
//     icon: "mocked guild icon url",
//     splash: "mocked guild splash url",
//     region: "eu-west",
//     member_count: 42,
//     large: false,
//     features: [],
//     application_id: "application-id",
//     afkTimeout: 1000,
//     afk_channel_id: "afk-channel-id",
//     system_channel_id: "system-channel-id",
//     embed_enabled: true,
//     verification_level: 2,
//     explicit_content_filter: 3,
//     mfa_level: 8,
//     joined_at: new Date("2018-01-01").getTime(),
//     owner_id: "owner-id",
//     channels: [],
//     roles: [],
//     presences: [],
//     voice_states: [],
//     emojis: [],
//     }
// ]);


// const user = Reflect.construct(
//     Discord.User, 
//     [
//         client, {
//             id: "user-id",
//             username: "USERNAME",
//             discriminator: "user#0000",
//             avatar: "user avatar url",
//             bot: false,
//         }
//     ]
// )


// guildMember = Reflect.construct(Discord.GuildMember, [
//     client,
//     {
//         id: BigInt(1),
//         deaf: false,
//         mute: false,
//         self_mute: false,
//         self_deaf: false,
//         session_id: "session-id",
//         channel_id: "channel-id",
//         nick: "nick",
//         joined_at: new Date("2020-01-01").getTime(),
//         user: user,
//         roles: [],
//     },
//     guild
// ]);


// console.log(user);

// client.emit('guildMemberAdd', guildMember);

// testing for mafia app
// maybe we go ahead and create 15 user accounts
// we can create them with temp emails, and just treat them use them as we need
// create fake reactions like above, add and remove roles as we need, and test them
// they never need to actually be online cause we can just mock the data and emit it ourselves
// the only thing we couldn't test like this is voice stuff cause we couldn't get them to connect to the voice channel
// but maybe if we use async/await in the tests, we can run the test, await for someone to join like me, then check for the correct response
// it'll be more synchronous but atleast it'll be a test