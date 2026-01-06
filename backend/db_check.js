const { pool } = require('./Utils/db');

async function check() {
    try {
        const [employees] = await pool.execute("SELECT id, Employee_Name, Official_Email FROM employee_records LIMIT 5");
        console.log("Employees:", employees);

        const [news] = await pool.execute("SELECT id, title, is_published FROM news LIMIT 5");
        console.log("News:", news);

        const [attendance] = await pool.execute("SELECT COUNT(*) as count FROM attendance_daily");
        console.log("Attendance count:", attendance[0].count);

        const [leaves] = await pool.execute("SELECT COUNT(*) as count FROM leave_applications");
        console.log("Leaves count:", leaves[0].count);

        const [shifts] = await pool.execute("SELECT id, name, is_active FROM attendance_shifts");
        console.log("Shifts:", shifts);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

check();
