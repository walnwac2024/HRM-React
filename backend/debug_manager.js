const { pool } = require("./Utils/db");

async function check() {
    try {
        console.log("--- SEARCHING FOR UMER ---");
        const [umers] = await pool.execute(`
            SELECT id, Employee_ID, Employee_Name, Department, Reporting 
            FROM employee_records 
            WHERE Employee_Name LIKE '%Umer%'
        `);
        console.log(JSON.stringify(umers, null, 2));

        console.log("\n--- SEARCHING FOR MANAGER USERS ---");
        const [managers] = await pool.execute(`
            SELECT e.id, e.Employee_Name, ut.type as role
            FROM employee_records e
            JOIN employee_user_types eut ON e.id = eut.employee_id
            JOIN users_types ut ON ut.id = eut.user_type_id
            WHERE ut.type = 'manager'
        `);
        console.log("Employees with manager role:", JSON.stringify(managers, null, 2));

        console.log("\n--- DEPARTMENT MANAGERS TABLE ---");
        const [dm] = await pool.execute("SELECT * FROM department_managers");
        console.log(JSON.stringify(dm, null, 2));

        if (umers.length > 0) {
            for (const u of umers) {
                const dept = u.Department;
                console.log(`\n--- SEARCHING FOR MANAGERS OF DEPT: "${dept}" ---`);
                const [deptMgrs] = await pool.execute("SELECT * FROM department_managers WHERE department_name = ?", [dept]);
                console.log(JSON.stringify(deptMgrs, null, 2));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
