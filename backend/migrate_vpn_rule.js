const { pool } = require('./Utils/db');

async function applyMigration() {
    try {
        console.log("Checking if block_vpn column exists...");
        const [columns] = await pool.execute("SHOW COLUMNS FROM attendance_rules LIKE 'block_vpn'");

        if (columns.length === 0) {
            console.log("Adding block_vpn column to attendance_rules...");
            await pool.execute("ALTER TABLE attendance_rules ADD COLUMN block_vpn TINYINT(1) DEFAULT 0 AFTER notify_hr_admin");
            console.log("Migration successful.");
        } else {
            console.log("Column block_vpn already exists.");
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

applyMigration();
