const { pool } = require("./Utils/db");

async function checkReporting() {
    try {
        console.log("--- Employee Reporting Structure ---");
        const [empRows] = await pool.execute("SELECT id, Employee_ID, Employee_Name, Department, Reporting FROM employee_records LIMIT 20");
        console.table(empRows);

        console.log("\n--- Department Managers ---");
        const [dmRows] = await pool.execute("SELECT * FROM department_managers");
        console.table(dmRows);

        console.log("\n--- User Roles ---");
        const [roleRows] = await pool.execute(`
            SELECT eut.employee_id, er.Employee_Name, ut.type 
            FROM employee_user_types eut 
            JOIN employee_records er ON eut.employee_id = er.id 
            JOIN users_types ut ON eut.user_type_id = ut.id 
            WHERE eut.is_primary = 1
        `);
        console.table(roleRows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkReporting();
