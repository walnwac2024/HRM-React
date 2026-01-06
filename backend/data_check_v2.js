const { pool } = require('./Utils/db');

async function checkData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log("Today's date string:", today);

        // Check shifts
        const [shifts] = await pool.execute("SELECT * FROM attendance_shifts WHERE is_active = 1");
        console.log("Active Shifts:", shifts);

        // Check if Asad has a shift assignment
        const [assignments] = await pool.execute("SELECT * FROM employee_shift_assignments WHERE employee_id = 196");
        console.log("Asad's Shift Assignments:", assignments);

        // Check attendance today for Asad
        const [todayAttendance] = await pool.execute("SELECT * FROM attendance_daily WHERE employee_id = 196 AND attendance_date = ?", [today]);
        console.log("Asad's Attendance Today:", todayAttendance);

        // Check news
        const [news] = await pool.execute("SELECT * FROM news WHERE is_published = 1");
        console.log("Published News Count:", news.length);

        // Check leaves
        const [leaves] = await pool.execute("SELECT * FROM leave_applications WHERE employee_id = 196");
        console.log("Asad's Leaves:", leaves);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkData();
