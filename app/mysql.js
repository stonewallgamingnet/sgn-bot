// const config = require('./configs/config');
const mysql = require('mysql2/promise');

console.log(process.env);

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_WEBSITE_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'UTF8MB4_GENERAL_CI',
    supportBigNumbers: true
});

const botPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_BOT_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'UTF8MB4_GENERAL_CI'
});

module.exports = {pool, botPool};


// const getPool = async () =>  {
//     // create the connection to database
//     return await mysql.createPool({
//         host: config.db.host,
//         user: config.db.user,
//         database: config.db.database,
//         password: config.db.password,
//         waitForConnections: true,
//         connectionLimit: 10,
//         queueLimit: 0,
//         charset: 'UTF8MB4_GENERAL_CI'
//     });
// }

// module.exports = getPool();

