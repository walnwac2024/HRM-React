const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const tables = [
        'attendance_alert_logs',
        'attendance_punches',
        'attendance_daily',
        'employee_shift_assignments',
        'attendance_security_violations',
        'employee_user_types',
        'employee_documents',
        'employee_info_requests',
        'employee_settings',
        'employee_transfers',
        'leave_balances',
        'leave_applications',
        'news_reactions',
        'notifications',
        'chat_messages',
        'chat_read_receipts',
        'employee_records',
        'employees'
    ];

    for (const t of tables) {
        let conn;
        try {
            conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                connectTimeout: 5000
            });
            const [cols] = await conn.execute(`DESCRIBE ${t}`);
            const hasEmpId = cols.some(c => c.Field.toLowerCase() === 'employee_id');
            const hasUserId = cols.some(c => c.Field.toLowerCase() === 'user_id');
            const hasSenderId = cols.some(c => c.Field.toLowerCase() === 'sender_id');
            const hasId = cols.some(c => c.Field.toLowerCase() === 'id');

            console.log(`TABLE: ${t}`);
            console.log(`  employee_id: ${hasEmpId}`);
            console.log(`  user_id: ${hasUserId}`);
            console.log(`  sender_id: ${hasSenderId}`);
            console.log(`  id: ${hasId}`);
            if (!hasEmpId && !hasUserId && !hasSenderId) {
                console.log(`  COLUMNS: ${cols.map(c => c.Field).join(', ')}`);
            }
        } catch (e) {
            console.log(`TABLE: ${t} - ERROR: ${e.message}`);
        } finally {
            if (conn) await conn.end();
        }
    }
    process.exit(0);
}

checkSchema();
