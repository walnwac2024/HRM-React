const mysql = require('mysql2/promise');
require('dotenv').config();

async function ping() {
    console.log('Testing connection to:', process.env.DB_HOST, ':', process.env.DB_PORT);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        console.log('Successfully connected to database!');
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

ping();
