const { pool } = require("./Utils/db");

async function checkNews() {
    try {
        const [news] = await pool.query("SELECT * FROM news");
        console.log("Total News Count:", news.length);
        console.log("News records:", JSON.stringify(news, null, 2));

        const [employees] = await pool.query("SELECT id, Employee_Name FROM employee_records LIMIT 5");
        console.log("Sample Employees:", JSON.stringify(employees, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkNews();
