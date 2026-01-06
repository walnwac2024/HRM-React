const { pool } = require('./Utils/db');
async function x() {
    const [r] = await pool.execute('SELECT * FROM employee_user_types WHERE employee_id = 196');
    console.log("Asad's Roles:", r);
    process.exit();
}
x();
