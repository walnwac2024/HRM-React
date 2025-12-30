const { pool } = require("./Utils/db");

async function init() {
    try {
        console.log("Starting initialization...");

        // 1. Initialize Leave Balances
        const [employees] = await pool.execute("SELECT id FROM employee_records WHERE id IS NOT NULL");
        const [types] = await pool.execute("SELECT id, entitlement_days FROM leave_types WHERE is_active = 1");

        console.log(`Found ${employees.length} employees and ${types.length} leave types.`);

        const currentYear = new Date().getFullYear();

        for (const emp of employees) {
            for (const lt of types) {
                // Check if exists
                const [existing] = await pool.execute(
                    "SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?",
                    [emp.id, lt.id, currentYear]
                );

                if (existing.length === 0) {
                    await pool.execute(
                        "INSERT INTO leave_balances (employee_id, leave_type_id, entitlement, balance, year) VALUES (?, ?, ?, ?, ?)",
                        [emp.id, lt.id, lt.entitlement_days, lt.entitlement_days, currentYear]
                    );
                }
            }
        }
        console.log("Leave balances initialized.");

        // 2. Map Department Managers (Best effort)
        // Find most common reporter for each department
        const [deptRep] = await pool.execute(`
      SELECT Department, Reporting, COUNT(*) as cnt
      FROM employee_records
      WHERE Department != "" AND Reporting != ""
      GROUP BY Department, Reporting
      ORDER BY cnt DESC
    `);

        const mappedDepts = new Set();
        for (const dr of deptRep) {
            if (mappedDepts.has(dr.Department)) continue;

            // Find the ID of the manager
            const [mRows] = await pool.execute(
                "SELECT id FROM employee_records WHERE Employee_Name = ? LIMIT 1",
                [dr.Reporting]
            );

            if (mRows.length > 0) {
                // Check if already mapped in department_managers
                const [existing] = await pool.execute(
                    "SELECT id FROM department_managers WHERE department_name = ?",
                    [dr.Department]
                );

                if (existing.length === 0) {
                    await pool.execute(
                        "INSERT INTO department_managers (department_name, manager_id) VALUES (?, ?)",
                        [dr.Department, mRows[0].id]
                    );
                    console.log(`Mapped ${dr.Department} to manager ${dr.Reporting} (ID: ${mRows[0].id})`);
                }
                mappedDepts.add(dr.Department);
            }
        }

        console.log("Initialization complete.");
        process.exit(0);
    } catch (err) {
        console.error("Initialization failed:", err);
        process.exit(1);
    }
}

init();
