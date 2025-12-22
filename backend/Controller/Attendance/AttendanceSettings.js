// backend/Controller/Attendance/AttendanceSettings.js
const { pool } = require("../../Utils/db");

const getShifts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT id, name, start_time, end_time, effective_from, effective_to, is_active, created_at
      FROM attendance_shifts
      ORDER BY
        CASE name
          WHEN 'RAMADAN' THEN 1
          WHEN 'SUMMER' THEN 2
          WHEN 'WINTER' THEN 3
          ELSE 99
        END,
        effective_from DESC
      `
    );
    return res.json({ shifts: rows });
  } catch (e) {
    console.error("getShifts error:", e);
    return res.status(500).json({ message: "Failed to load shifts" });
  }
};

const updateShift = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { start_time, end_time, effective_from, effective_to, is_active } = req.body || {};

    if (!id) return res.status(400).json({ message: "Invalid shift id" });
    if (!start_time || !end_time) return res.status(400).json({ message: "start_time and end_time are required" });
    if (!effective_from || !effective_to) return res.status(400).json({ message: "effective_from and effective_to are required" });

    await pool.execute(
      `
      UPDATE attendance_shifts
      SET start_time = ?,
          end_time = ?,
          effective_from = ?,
          effective_to = ?,
          is_active = ?
      WHERE id = ?
      `,
      [start_time, end_time, effective_from, effective_to, is_active ? 1 : 0, id]
    );

    const [rows] = await pool.execute(
      `SELECT id, name, start_time, end_time, effective_from, effective_to, is_active
       FROM attendance_shifts WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.json({ message: "Shift updated", shift: rows[0] || null });
  } catch (e) {
    console.error("updateShift error:", e);
    return res.status(500).json({ message: "Failed to update shift" });
  }
};

const getRules = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT id, grace_minutes, notify_employee, notify_hr_admin, is_active, created_at
      FROM attendance_rules
      ORDER BY id DESC
      LIMIT 10
      `
    );
    return res.json({ rules: rows });
  } catch (e) {
    console.error("getRules error:", e);
    return res.status(500).json({ message: "Failed to load rules" });
  }
};

const updateActiveRule = async (req, res) => {
  try {
    const { grace_minutes, notify_employee, notify_hr_admin } = req.body || {};
    const g = Number(grace_minutes);

    if (!Number.isFinite(g) || g < 0 || g > 240) {
      return res.status(400).json({ message: "grace_minutes must be a number (0-240)" });
    }

    await pool.execute(`UPDATE attendance_rules SET is_active = 0 WHERE is_active = 1`);

    await pool.execute(
      `
      INSERT INTO attendance_rules (grace_minutes, notify_employee, notify_hr_admin, is_active)
      VALUES (?, ?, ?, 1)
      `,
      [g, notify_employee ? 1 : 0, notify_hr_admin ? 1 : 0]
    );

    return res.json({ message: "Rule updated" });
  } catch (e) {
    console.error("updateActiveRule error:", e);
    return res.status(500).json({ message: "Failed to update rule" });
  }
};

module.exports = {
  getShifts,
  updateShift,
  getRules,
  updateActiveRule,
};
