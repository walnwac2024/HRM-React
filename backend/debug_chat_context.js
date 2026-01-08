const { pool } = require('./Utils/db');

async function debug() {
    try {
        const [rows] = await pool.execute("SELECT id, Employee_Name, Department, Designations FROM employee_records WHERE Employee_Name LIKE '%sana%'");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debug();
