const { pool } = require("./Utils/db");

async function fixSana() {
    try {
        console.log("--- Adding Sana as manager of KREATORS ---");
        // Sana ID is 313
        await pool.execute("INSERT IGNORE INTO department_managers (department_name, manager_id) VALUES (?, ?)", ['KREATORS', 313]);

        console.log("--- Updating reporting for KREATORS employees ---");
        // Set everyone in KREATORS (except Sana herself) to report to "sana"
        await pool.execute("UPDATE employee_records SET Reporting = ? WHERE Department = ? AND id != ?", ['sana', 'KREATORS', 313]);

        console.log("--- Done ---");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixSana();
