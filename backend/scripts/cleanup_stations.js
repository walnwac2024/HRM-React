const { pool } = require("../Utils/db");

const MISSPELLED_VARIANTS = [
    "Haed Office",
    "Head Offiice",
    "Head Offoce",
    "Heead Office",
    "Head Ofice",
    "Head Office ",
    " Head Office",
    "Head office",
    "head office"
];

async function cleanup() {
    console.log("Starting Stations Cleanup...");
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Check how many records match misspelled variants
        const [rows] = await conn.query(
            `SELECT Office_Location, COUNT(*) as count 
       FROM employee_records 
       WHERE TRIM(Office_Location) IN (?, ?, ?, ?, ?, ?, ?, ?, ?)
          OR Office_Location LIKE '%Head Off%'
       GROUP BY Office_Location`,
            MISSPELLED_VARIANTS
        );

        console.log("Found variants:", rows);

        // 2. Perform the update for Head Office
        const [hRes] = await conn.query(
            `UPDATE employee_records 
       SET Office_Location = 'Head Office' 
       WHERE TRIM(Office_Location) IN (?, ?, ?, ?, ?, ?, ?, ?, ?)
          OR (Office_Location LIKE '%Head Off%' AND Office_Location != 'Head Office')`,
            MISSPELLED_VARIANTS
        );
        console.log(`Updated ${hRes.affectedRows} records to 'Head Office'.`);

        // 3. Additional Merge: Magnus
        const [mRes] = await conn.query(
            "UPDATE employee_records SET Office_Location = 'Magnus' WHERE TRIM(Office_Location) = 'MAhnus'"
        );
        console.log(`Merged ${mRes.affectedRows} 'MAhnus' records into 'Magnus'.`);

        // 4. General Trim
        const [tRes] = await conn.query(
            "UPDATE employee_records SET Office_Location = TRIM(Office_Location) WHERE Office_Location IS NOT NULL"
        );
        console.log(`Trimmed whitespace for ${tRes.affectedRows} records.`);

        // 5. Check final state
        const [remaining] = await conn.query(
            `SELECT DISTINCT Office_Location FROM employee_records ORDER BY Office_Location`
        );
        console.log("Current unique Office locations after full cleanup:", remaining.map(r => r.Office_Location));

    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

cleanup();
