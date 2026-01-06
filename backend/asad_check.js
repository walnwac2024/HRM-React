const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT * FROM attendance_daily WHERE employee_id = 196');
    console.log("Asad's Attendance:", r);
    process.exit();
}
x();
