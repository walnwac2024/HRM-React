const { pool } = require('./Utils/db');

async function checkSchema() {
    try {
        const [rows] = await pool.execute("DESCRIBE attendance_rules");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
