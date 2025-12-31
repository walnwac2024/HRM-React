const { pool } = require("./Utils/db");

async function verifyAuthor() {
    try {
        const [emp] = await pool.query("SELECT * FROM employee_records WHERE id = 196");
        console.log("Employee with ID 196:", JSON.stringify(emp, null, 2));

        const [adminEmp] = await pool.query("SELECT id, Employee_Name FROM employee_records WHERE Employee_Name LIKE '%Asad%'");
        console.log("Employees matching 'Asad':", JSON.stringify(adminEmp, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

verifyAuthor();
