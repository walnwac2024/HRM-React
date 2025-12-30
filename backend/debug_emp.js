const { pool } = require("./Utils/db");

async function check() {
    try {
        const [rows] = await pool.execute("SELECT id, Employee_Name, Department, Designations, Reporting FROM employee_records LIMIT 5");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
