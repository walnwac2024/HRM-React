const { pool } = require("./Utils/db");

async function check() {
    try {
        const [rows] = await pool.execute(`
      SELECT DISTINCT er.Reporting, m.id as manager_id, m.Employee_Name as manager_name
      FROM employee_records er
      LEFT JOIN employee_records m ON er.Reporting = m.Employee_Name
      WHERE er.Reporting != ""
    `);
        console.log("Reporting Links:");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
