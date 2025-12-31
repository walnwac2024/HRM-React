const { pool } = require("./Utils/db");

async function initSettings() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("Settings table ensured.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

initSettings();
