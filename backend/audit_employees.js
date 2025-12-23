const { pool } = require("./Utils/db");

async function audit() {
    try {
        console.log("--- MISSING PERSONAL EMAILS ---");
        const [emailRows] = await pool.execute(
            "SELECT Employee_ID, Employee_Name FROM employee_records WHERE is_active = 1 AND (Email IS NULL OR Email = '')"
        );
        if (emailRows.length > 0) {
            emailRows.forEach(r => console.log(`[${r.Employee_ID}] ${r.Employee_Name}`));
        } else {
            console.log("None");
        }

        console.log("\n--- MISSING SHIFT ASSIGNMENTS ---");
        const [shiftRows] = await pool.execute(
            "SELECT id, Employee_ID, Employee_Name FROM employee_records WHERE is_active = 1 AND id NOT IN (SELECT employee_id FROM employee_shift_assignments)"
        );
        if (shiftRows.length > 0) {
            shiftRows.forEach(r => console.log(`[${r.Employee_ID}] ${r.Employee_Name}`));
        } else {
            console.log("All active employees have shift assignments.");
        }
        const [tables] = await pool.execute("SHOW TABLES;");
        console.log("\n--- TABLES ---");
        tables.forEach(t => console.log(Object.values(t)[0]));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

audit();
