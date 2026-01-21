const { pool } = require("./Utils/db");
const fs = require('fs');
const path = require('path');

async function runSQL() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, "database/chat_read_receipts.sql"), 'utf8');
        // Simple SQL split (might not work for complex scripts, but fine for this one)
        const queries = sql.split(';').filter(q => q.trim());
        for (const query of queries) {
            await pool.execute(query);
            console.log("Executed query successfully");
        }
        process.exit(0);
    } catch (err) {
        console.error("SQL Execution failed:", err);
        process.exit(1);
    }
}
runSQL();
