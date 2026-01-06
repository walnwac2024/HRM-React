const { pool } = require('./Utils/db');

async function dumpSchema() {
    try {
        const [tables] = await pool.execute("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const tableName of tableNames) {
            console.log(`\n--- Table: ${tableName} ---`);
            const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
            console.table(columns);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

dumpSchema();
