const { pool } = require("./db");

/**
 * Record a system log entry.
 * @param {Object} options 
 * @param {number} options.actorId - ID of the person performing the action
 * @param {string} options.action - Description of what happened
 * @param {string} options.category - 'Access Changes', 'Permission Updates', 'Login Attempts', 'System'
 * @param {string} options.status - 'Success', 'Failed'
 * @param {Object} [options.details] - JSON context
 * @param {number} [options.targetUserId] - ID of the subject user (if any)
 */
async function recordLog({ actorId, action, category, status, details = {}, targetUserId = null }) {
    try {
        let actorName = "Unknown";
        let actorDepartment = "Unknown";

        if (actorId) {
            const [userRows] = await pool.execute(
                "SELECT Employee_Name, Department FROM employee_records WHERE id = ? LIMIT 1",
                [actorId]
            );
            if (userRows.length > 0) {
                actorName = userRows[0].Employee_Name;
                actorDepartment = userRows[0].Department;
            }
        }

        await pool.execute(
            `INSERT INTO audit_logs 
            (user_id, actor_id, actor_name, actor_department, action, category, status, details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                targetUserId,
                actorId,
                actorName,
                actorDepartment,
                action,
                category,
                status,
                JSON.stringify(details)
            ]
        );
    } catch (err) {
        console.error("recordLog Error:", err);
    }
}

module.exports = { recordLog };
