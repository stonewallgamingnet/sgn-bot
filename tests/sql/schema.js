// Don't create/drop database. keep it around so we can connect to it at the start.
// exports.createTestDatabase="CREATE DATABASE IF NOT EXISTS `sgn_website_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;";
// exports.dropTestDatabase="DROP DATABASE `sgn_website_test`";

exports.createDiscordUsersTable=`CREATE TABLE IF NOT EXISTS \`#__memberops_discordusers\` (
    \`id\` int(20) NOT NULL AUTO_INCREMENT,
    \`user_id\` bigint(64) DEFAULT NULL,
    \`nickname\` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
    \`username\` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
    \`discriminator\` varchar(255) DEFAULT NULL,
    \`presence\` varchar(7) DEFAULT NULL,
    \`member_id\` int(20) DEFAULT NULL,
    \`joined_on\` datetime DEFAULT NULL,
    \`removed\` tinyint(1) NOT NULL DEFAULT '0',
    \`removed_on\` datetime DEFAULT NULL,
    \`checked_on\` datetime DEFAULT NULL,
    \`notes\` varchar(255) DEFAULT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8;`

exports.truncateDiscordUsersTable=`TRUNCATE \`#__memberops_discordusers\``;

exports.insertDiscordUser=`INSERT INTO \`#__memberops_discordusers\` (\`user_id\`, \`nickname\`, \`username\`, \`discriminator\`, \`presence\`, \`member_id\`, \`joined_on\`, \`removed\`, \`removed_on\`, \`checked_on\`, \`notes\`) VALUES
(123456789, 'NicholasJohn85', 'NicholasJohn16', '1234', 'offline', 1, '2019-12-31 19:00:00', 0, NULL, '2022-12-07 05:30:00', NULL);`

// exports.defaults = {
//     createTestDatabase: "CREATE DATABASE IF NOT EXISTS `sgn_sgnbot_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;",
// }
