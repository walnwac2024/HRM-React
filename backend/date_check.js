const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT attendance_date FROM attendance_daily');
    console.log("Attendance Dates:", r.map(row => row.attendance_date));
    process.exit();
}
x();
