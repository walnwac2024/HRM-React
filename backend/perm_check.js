const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT COUNT(*) as count FROM permissions');
    console.log("Permissions Count:", r[0].count);
    const [all] = await pool.execute('SELECT * FROM permissions LIMIT 5');
    console.log("Sample Permissions:", all);
    process.exit();
}
x();
