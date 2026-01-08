const { pool } = require('./Utils/db');

async function diagnose() {
    try {
        console.log("--- Last 5 Punches ---");
        const [punches] = await pool.execute('SELECT id, employee_id, punched_at, punch_type FROM attendance_punches ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(punches, null, 2));

        console.log("\n--- Last 5 Security Violations ---");
        const [violations] = await pool.execute('SELECT * FROM attendance_security_violations ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(violations, null, 2));

        console.log("\n--- Current Server Time ---");
        console.log(new Date().toISOString());
        console.log(new Date().toLocaleString());

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
