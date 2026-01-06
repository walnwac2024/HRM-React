const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT COUNT(*) as count FROM sessions');
    console.log("Session Count:", r[0].count);
    const [latest] = await pool.execute('SELECT * FROM sessions ORDER BY expires DESC LIMIT 1');
    console.log("Latest Session Expiry:", latest[0]?.expires);
    process.exit();
}
x();
