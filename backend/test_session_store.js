const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
dotenv.config();

const options = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    createDatabaseTable: true
};

const sessionStore = new MySQLStore(options);

console.log("Testing session store...");

sessionStore.on('error', (err) => {
    console.error("Session Store Error Event:", err);
    process.exit(1);
});

const sessionId = 'test-session-' + Date.now();
const sessionData = { cookie: { maxAge: 100000 }, user: { id: 1, name: 'Test' } };

sessionStore.set(sessionId, sessionData, (err) => {
    if (err) {
        console.error("Failed to set session:", err);
        process.exit(1);
    }
    console.log("Session set successfully.");

    sessionStore.get(sessionId, (err, data) => {
        if (err) {
            console.error("Failed to get session:", err);
            process.exit(1);
        }
        console.log("Session retrieved:", data);
        process.exit(0);
    });
});

setTimeout(() => {
    console.error("Session test timed out.");
    process.exit(1);
}, 5000);
