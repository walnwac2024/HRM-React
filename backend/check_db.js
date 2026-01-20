const { pool } = require("./Utils/db");

async function check() {
    try {
        console.log("--- Checking Leave Balances for 2026 ---");
        const [balances] = await pool.execute(
            "SELECT count(*) as count FROM leave_balances WHERE year = 2026"
        );
        console.log(`2026 Balances count: ${balances[0].count}`);

        if (balances[0].count === 0) {
            console.error("WARNING: No balances found for 2026!");
        } else {
            const [sample] = await pool.execute(
                "SELECT lb.*, lt.name as type_name FROM leave_balances lb JOIN leave_types lt ON lb.leave_type_id = lt.id WHERE year = 2026 LIMIT 5"
            );
            console.log("Sample 2026 Balances:", JSON.stringify(sample, null, 2));
        }

        console.log("\n--- Checking Employee Profile Image Paths ---");
        const [emps] = await pool.execute(
            "SELECT id, Employee_Name, profile_img FROM employee_records WHERE profile_img IS NOT NULL LIMIT 5"
        );
        console.log("Employees with profile images:", JSON.stringify(emps, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Check failed:", err);
        process.exit(1);
    }
}

check();
