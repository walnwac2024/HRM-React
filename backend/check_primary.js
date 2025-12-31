const { pool } = require("./Utils/db");

async function checkPrimaryRole() {
    try {
        const [rows] = await pool.query("SELECT * FROM employee_user_types WHERE employee_id = 196");
        console.log("Employee User Types for 196:", JSON.stringify(rows, null, 2));

        const [types] = await pool.query("SELECT * FROM users_types");
        console.log("All User Types:", JSON.stringify(types, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPrimaryRole();
