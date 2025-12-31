const { pool } = require("./Utils/db");

async function checkUserRoles() {
    try {
        const [userTypes] = await pool.query(`
            SELECT ut.type 
            FROM employee_user_types eut
            JOIN users_types ut ON ut.id = eut.user_type_id
            WHERE eut.employee_id = 196
        `);
        console.log("Roles for Asad Jamil (ID 196):", JSON.stringify(userTypes, null, 2));

        const [news] = await pool.query("SELECT * FROM news");
        console.log("Current News:", JSON.stringify(news, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUserRoles();
