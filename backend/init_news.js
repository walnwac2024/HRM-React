const { pool } = require("./Utils/db");

async function initNewsTable() {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        is_published TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES employee_records(id)
      );
    `;
        await pool.execute(query);
        console.log("News table created or already exists.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating news table:", err);
        process.exit(1);
    }
}

initNewsTable();
