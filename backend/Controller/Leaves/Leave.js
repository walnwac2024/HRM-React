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

        // ✅ Check Leave Balance
        const [balanceRows] = await conn.execute(
            "SELECT balance FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?",
            [user.id, leave_type_id, new Date().getFullYear()]
        );

        if (balanceRows.length === 0) {
            return res.status(400).json({ message: "No leave balance found for this type/year." });
        }

        if (balanceRows[0].balance < total_days) {
            return res.status(400).json({ message: `Insufficient balance. Available: ${balanceRows[0].balance} days.` });
        }

        await conn.beginTransaction();

        // 1. Auto-Approval for Top Roles (Permission level >= 9)
        const isAutoApproved = (user.flags?.level >= 9);
        const status = isAutoApproved ? 'approved' : 'pending';

        const [result] = await conn.execute(
            `INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, leave_type_id, start_date, end_date, total_days, reason, status]
        );

        const applicationId = result.insertId;

        // 2. Routing: Find Department Manager
        const [empRows] = await conn.execute("SELECT Department, Reporting FROM employee_records WHERE id = ?", [user.id]);
        const dept = empRows[0]?.Department;
        const [dmRows] = await conn.execute("SELECT manager_id FROM department_managers WHERE department_name = ?", [dept]);

        let approverId = dmRows[0]?.manager_id || null;

        // Prevention: A manager cannot approve their own leave
        if (approverId === user.id) {
            console.log(`[applyLeave] User ${user.id} is the manager of their own dept. Routing to Admin.`);
            // Route to someone with level 10 (Admin)
            const [adminRows] = await conn.execute(
                `SELECT eut.employee_id 
                 FROM employee_user_types eut
                 JOIN users_types ut ON eut.user_type_id = ut.id
                 WHERE ut.permission_level >= 10 AND eut.employee_id != ?
                 LIMIT 1`, [user.id]
            );
            approverId = adminRows[0]?.employee_id || null;
        }

        // 3. Approval Record
        await conn.execute(
            `INSERT INTO approvals (approvable_type, approvable_id, requested_by, approver_id, status)
             VALUES ('Leave', ?, ?, ?, ?)`,
            [applicationId, user.id, approverId, status]
        );

        // 4. If auto-approved, deduct balance immediately
        if (isAutoApproved) {
            await conn.execute(
                `UPDATE leave_balances 
                 SET used = used + ?, balance = balance - ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
                [total_days, total_days, user.id, leave_type_id, new Date().getFullYear()]
            );
        }

        await conn.commit();
        return res.status(201).json({
            message: isAutoApproved ? "Leave approved automatically." : "Leave applied successfully.",
            applicationId,
            autoApproved: isAutoApproved
        });
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
            `SELECT la.*, lt.name as leave_type_name, app.comment as rejection_reason, 
                    er.Employee_Name as approver_name
             FROM leave_applications la
             JOIN leave_types lt ON la.leave_type_id = lt.id
             LEFT JOIN approvals app ON app.approvable_type = 'Leave' AND app.approvable_id = la.id
             LEFT JOIN employee_records er ON app.approver_id = er.id
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
        const user = req.session?.user;
        const r = String(user?.role || "").toLowerCase();
        const isAdmin = ["super_admin", "admin", "hr", "developer"].includes(r);

        let query = `
            SELECT la.*, lt.name as leave_type_name, 
                   er.Employee_Name, er.Employee_ID as employee_code,
                   er.Department, er.Designations,
                   app.approver_id, app_er.Employee_Name as handled_by,
                   la.reason
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            JOIN employee_records er ON la.employee_id = er.id
            LEFT JOIN approvals app ON app.approvable_type = 'Leave' AND app.approvable_id = la.id
            LEFT JOIN employee_records app_er ON app.approver_id = app_er.id
        `;

        let params = [];
        if (!isAdmin) {
            // ✅ Check if this user is a department manager
            const [myDepts] = await pool.execute("SELECT department_name FROM department_managers WHERE manager_id = ?", [user.id]);
            const deptNames = myDepts.map(d => d.department_name);

            if (deptNames.length > 0) {
                console.log(`[getAllLeaves] Manager "${user.name}" (ID: ${user.id}) found departments:`, deptNames);
                const placeholders = deptNames.map(() => "?").join(",");
                query += ` WHERE (er.Department IN (${placeholders}) OR er.Reporting = ?) `;
                params = [...deptNames, user.name];
            } else {
                console.warn(`[getAllLeaves] User "${user.name}" (ID: ${user.id}) has no manager mappings. Falling back to Reporting check.`);
                query += ` WHERE er.Reporting = ? `;
                params.push(user.name);
            }
        }

        query += ` ORDER BY la.created_at DESC`;

        const [rows] = await pool.execute(query, params);
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

        const user = req.session?.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        await conn.beginTransaction();

        await conn.execute(
            "UPDATE leave_applications SET status = ? WHERE id = ?",
            [status, id]
        );

        await conn.execute(
            "UPDATE approvals SET status = ?, comment = ?, approver_id = ?, updated_at = CURRENT_TIMESTAMP WHERE approvable_type = 'Leave' AND approvable_id = ?",
            [status, comment, user.id, id]
        );

        // ✅ Deduct Balance on Approval
        if (status === "approved") {
            const [[la]] = await conn.execute("SELECT employee_id, leave_type_id, total_days FROM leave_applications WHERE id = ?", [id]);
            await conn.execute(
                `UPDATE leave_balances 
                 SET used = used + ?, balance = balance - ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
                [la.total_days, la.total_days, la.employee_id, la.leave_type_id, new Date().getFullYear()]
            );
        }

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
            [name, entitlement_days, description || "", is_active ?? 1, id]
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

/**
 * GET /leaves/balances
 */
const getLeaveBalances = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        const [rows] = await pool.execute(
            `SELECT lb.*, lt.name as leave_type_name
             FROM leave_balances lb
             JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ? AND lb.year = ?`,
            [user.id, new Date().getFullYear()]
        );

        return res.json({ balances: rows });
    } catch (e) {
        console.error("getLeaveBalances error:", e);
        return res.status(500).json({ message: "Failed to load leave balances" });
    }
};

/**
 * GET /leaves/summary/stats
 */
const getLeaveDashboardStats = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        // 1. My Requests (Pending count)
        const [myRequests] = await pool.execute(
            "SELECT COUNT(*) as count FROM leave_applications WHERE employee_id = ? AND status = 'pending'",
            [user.id]
        );

        // 2. My Approvals (Pending count for me to approve)
        const [myApprovals] = await pool.execute(
            "SELECT COUNT(*) as count FROM approvals WHERE approver_id = ? AND status = 'pending' AND approvable_type = 'Leave'",
            [user.id]
        );

        return res.json({
            myRequestsCount: myRequests[0].count,
            myApprovalsCount: myApprovals[0].count
        });
    } catch (e) {
        console.error("getLeaveDashboardStats error:", e);
        return res.status(500).json({ message: "Failed to load leave stats" });
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
    getLeaveBalances,
    getLeaveDashboardStats,
};
