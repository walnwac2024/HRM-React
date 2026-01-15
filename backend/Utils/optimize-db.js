// backend/Utils/optimize-db.js
const { pool } = require('./db');

async function optimize() {
    console.log("🚀 Starting Database Optimization...");
    const conn = await pool.getConnection();
    try {
        console.log("Analyzing Indexes...");

        const queries = [
            // Attendance Daily
            "CREATE INDEX idx_att_date ON attendance_daily(attendance_date)",
            "CREATE INDEX idx_att_emp_date ON attendance_daily(employee_id, attendance_date)",
            "CREATE INDEX idx_att_status ON attendance_daily(status)",

            // Employees
            "CREATE INDEX idx_emp_active ON employee_records(is_active)",
            "CREATE INDEX idx_emp_email ON employee_records(Email)",
            "CREATE INDEX idx_emp_code ON employee_records(Employee_ID)",

            // Leaves
            "CREATE INDEX idx_leave_emp_status ON leave_applications(employee_id, status)",
            "CREATE INDEX idx_leave_dates ON leave_applications(start_date, end_date)"
        ];

        for (const q of queries) {
            try {
                await conn.execute(q);
                console.log(`✅ Executed: ${q}`);
            } catch (e) {
                if (e.code === 'ER_DUP_KEYNAME') {
                    console.log(`ℹ️ Index exists: ${q.split('ON')[1] || 'Unknown'}`);
                } else {
                    console.warn(`⚠️ Failed: ${q} - ${e.message}`);
                }
            }
        }

        console.log("✨ Database Optimization Complete!");
    } catch (err) {
        console.error("❌ Optimization Failed:", err);
    } finally {
        conn.release();
        process.exit();
    }
}

optimize();
