const { pool } = require("./Utils/db");
async function check() {
    try {
        const [rows] = await pool.execute("DESCRIBE chat_messages");
        console.log("chat_messages schema:", JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
