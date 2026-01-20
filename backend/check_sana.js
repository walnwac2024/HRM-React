const { pool } = require("./Utils/db");

async function checkSana() {
    try {
        console.log("--- Sana's Employee Record ---");
        const [sanaRows] = await pool.execute("SELECT * FROM employee_records WHERE Employee_Name LIKE '%sana%' OR id = 313");
        console.table(sanaRows);

        if (sanaRows.length > 0) {
            const sana = sanaRows[0];
            console.log(`\n--- Employees Reporting to ${sana.Employee_Name} (ID: ${sana.id}, Code: ${sana.Employee_ID}) ---`);
            const [reportingRows] = await pool.execute(
                "SELECT id, Employee_Name, Department, Reporting FROM employee_records WHERE Reporting = ? OR Reporting = ? OR Reporting LIKE ?",
                [sana.Employee_Name, sana.Employee_ID, `%${sana.Employee_Name}%`]
            );
            console.table(reportingRows);

            console.log("\n--- Department Manager Mappings for Sana ---");
            const [dmRows] = await pool.execute("SELECT * FROM department_managers WHERE manager_id = ?", [sana.id]);
            console.table(dmRows);
        }

        console.log("\n--- Recent Leave Applications ---");
        const [leaveRows] = await pool.execute(`
            SELECT la.id, er.Employee_Name, er.Department, er.Reporting, la.status, la.created_at 
            FROM leave_applications la 
            JOIN employee_records er ON la.employee_id = er.id 
            ORDER BY la.created_at DESC LIMIT 10
        `);
        console.table(leaveRows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSana();
