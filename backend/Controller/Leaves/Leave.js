// backend/Controller/Leaves/Leave.js
const { pool } = require("../../Utils/db");

/**
 * GET /leaves/types
 */
const getLeaveTypes = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM leave_types WHERE is_active = 1");
        return res.json({ types: rows });
    } catch (e) {
        console.error("getLeaveTypes error:", e);
        return res.status(500).json({ message: "Failed to load leave types" });
    }
};

/**
 * POST /leaves/apply
 */
const applyLeave = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const user = req.session?.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        const { leave_type_id, start_date, end_date, reason } = req.body || {};

        if (!leave_type_id || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffTime = Math.abs(end - start);
        const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        await conn.beginTransaction();

        const [result] = await conn.execute(
            `INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [user.id, leave_type_id, start_date, end_date, total_days, reason]
        );

        const applicationId = result.insertId;

        await conn.execute(
            `INSERT INTO approvals (approvable_type, approvable_id, requested_by, status)
       VALUES ('Leave', ?, ?, 'pending')`,
            [applicationId, user.id]
        );

        await conn.commit();
        return res.status(201).json({ message: "Leave applied successfully", applicationId });
    } catch (e) {
        await conn.rollback();
        console.error("applyLeave error:", e);
        return res.status(500).json({ message: "Failed to apply leave" });
    } finally {
        conn.release();
    }
};

/**
 * GET /leaves/my
 */
const getMyLeaves = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        const [rows] = await pool.execute(
            `SELECT la.*, lt.name as leave_type_name
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = ?
       ORDER BY la.created_at DESC`,
            [user.id]
        );

        return res.json({ leaves: rows });
    } catch (e) {
        console.error("getMyLeaves error:", e);
        return res.status(500).json({ message: "Failed to load your leaves" });
    }
};

/**
 * GET /leaves/admin/all
 */
const getAllLeaves = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT la.*, lt.name as leave_type_name, er.Employee_Name, er.Employee_ID as employee_code
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       JOIN employee_records er ON la.employee_id = er.id
       ORDER BY la.created_at DESC`
        );

        return res.json({ leaves: rows });
    } catch (e) {
        console.error("getAllLeaves error:", e);
        return res.status(500).json({ message: "Failed to load all leaves" });
    }
};

/**
 * PATCH /leaves/approve/:id
 */
const approveLeave = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params;
        const { status, comment } = req.body || {};

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await conn.beginTransaction();

        await conn.execute(
            "UPDATE leave_applications SET status = ? WHERE id = ?",
            [status, id]
        );

        await conn.execute(
            "UPDATE approvals SET status = ?, comment = ? WHERE approvable_type = 'Leave' AND approvable_id = ?",
            [status, comment, id]
        );

        await conn.commit();
        return res.json({ message: `Leave ${status} successfully` });
    } catch (e) {
        await conn.rollback();
        console.error("approveLeave error:", e);
        return res.status(500).json({ message: "Failed to update leave status" });
    } finally {
        conn.release();
    }
};

/**
 * POST /leaves/types
 * Admin only
 */
const createLeaveType = async (req, res) => {
    try {
        const { name, entitlement_days, description } = req.body || {};
        if (!name || !entitlement_days) {
            return res.status(400).json({ message: "Name and entitlement days are required" });
        }

        await pool.execute(
            "INSERT INTO leave_types (name, entitlement_days, description, is_active) VALUES (?, ?, ?, 1)",
            [name, entitlement_days, description || ""]
        );

        return res.status(201).json({ message: "Leave type created successfully" });
    } catch (e) {
        console.error("createLeaveType error:", e);
        return res.status(500).json({ message: "Failed to create leave type" });
    }
};

/**
 * PATCH /leaves/types/:id
 * Admin only
 */
const updateLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, entitlement_days, description, is_active } = req.body || {};

        await pool.execute(
            "UPDATE leave_types SET name = ?, entitlement_days = ?, description = ?, is_active = ? WHERE id = ?",
            [name, entitlement_days, description, is_active ?? 1, id]
        );

        return res.json({ message: "Leave type updated successfully" });
    } catch (e) {
        console.error("updateLeaveType error:", e);
        return res.status(500).json({ message: "Failed to update leave type" });
    }
};

/**
 * DELETE /leaves/types/:id (Soft delete)
 * Admin only
 */
const deleteLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute("UPDATE leave_types SET is_active = 0 WHERE id = ?", [id]);
        return res.json({ message: "Leave type deactivated successfully" });
    } catch (e) {
        console.error("deleteLeaveType error:", e);
        return res.status(500).json({ message: "Failed to delete leave type" });
    }
};

module.exports = {
    getLeaveTypes,
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
};
