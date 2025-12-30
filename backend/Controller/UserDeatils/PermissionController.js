// backend/Controller/UserDeatils/PermissionController.js
const { pool } = require("../../Utils/db");

/**
 * GET /api/v1/permissions/user-types
 * Lists all user types from the database.
 */
async function listUserTypes(req, res) {
    console.log("PERMISSION_LOG: Fetching user types...");
    try {
        const [rows] = await pool.execute(
            "SELECT id, type, permission_level, Create_permission, Edit_permission, View_permission FROM users_types ORDER BY permission_level DESC"
        );
        console.log("PERMISSION_LOG: Found", rows.length, "types");
        return res.json(rows);
    } catch (err) {
        console.error("listUserTypes error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /api/v1/permissions/all
 * Lists all available permission codes.
 */
async function listAllPermissions(req, res) {
    try {
        const [rows] = await pool.execute("SELECT id, module, action, code FROM permissions ORDER BY module, action ASC");
        // Add a virtual name field for the frontend
        const mapped = rows.map(r => ({
            ...r,
            name: `${r.module} - ${r.action}`
        }));
        return res.json(mapped);
    } catch (err) {
        console.error("listAllPermissions error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /api/v1/permissions/type/:typeId
 * Gets active permission IDs for a specific user type.
 */
async function getTypePermissions(req, res) {
    try {
        const { typeId } = req.params;
        const [rows] = await pool.execute(
            "SELECT permission_id FROM user_type_permission WHERE user_type_id = ?",
            [typeId]
        );
        const permissionIds = rows.map((r) => r.permission_id);
        return res.json(permissionIds);
    } catch (err) {
        console.error("getTypePermissions error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /api/v1/permissions/type/:typeId
 * Updates permission mapping for a user type.
 */
async function updateTypePermissions(req, res) {
    const conn = await pool.getConnection();
    try {
        const { typeId } = req.params;
        const { permissionIds } = req.body || {}; // array of permission IDs

        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({ message: "permissionIds must be an array" });
        }

        await conn.beginTransaction();

        // 1) Clear existing
        await conn.execute("DELETE FROM user_type_permission WHERE user_type_id = ?", [typeId]);

        // 2) Insert new
        if (permissionIds.length > 0) {
            const values = permissionIds.map((pid) => [typeId, pid]);
            // Note: We're using a bulk insert approach if possible, or manual loop if preferred.
            // For simplicity and safety with small numbers of permissions:
            for (const pid of permissionIds) {
                await conn.execute(
                    "INSERT INTO user_type_permission (user_type_id, permission_id) VALUES (?, ?)",
                    [typeId, pid]
                );
            }
        }

        await conn.commit();
        return res.json({ message: "Permissions updated successfully" });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error("updateTypePermissions error:", err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    listUserTypes,
    listAllPermissions,
    getTypePermissions,
    updateTypePermissions,
};
