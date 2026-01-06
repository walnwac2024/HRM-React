const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT COUNT(*) as count FROM employee_records WHERE Department = ?', ['Human Resource-HOE']);
    console.log("Count for Human Resource-HOE:", r[0].count);

    const [allDepts] = await pool.execute('SELECT DISTINCT Department FROM employee_records');
    console.log("All Departments:", allDepts.map(d => d.Department));

    process.exit();
}
x();
