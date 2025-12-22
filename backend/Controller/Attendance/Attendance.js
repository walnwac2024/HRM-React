// backend/Controller/Attendance/Attendance.js
const { pool } = require("../../Utils/db");

/**
 * Shift resolver: RAMADAN > SUMMER > WINTER (by date range)
 * Uses attendance_shifts table.
 */
async function resolveShiftForDate(dateStr) {
  const [rows] = await pool.execute(
    `
    SELECT id, name, start_time, end_time
    FROM attendance_shifts
    WHERE is_active = 1
      AND ? BETWEEN effective_from AND effective_to
    ORDER BY
      CASE name
        WHEN 'RAMADAN' THEN 1
        WHEN 'SUMMER' THEN 2
        WHEN 'WINTER' THEN 3
        ELSE 99
      END
    LIMIT 1
    `,
    [dateStr]
  );

  if (rows.length) return rows[0];

  // fallback: pick any active (prefer WINTER)
  const [fallback] = await pool.execute(
    `
    SELECT id, name, start_time, end_time
    FROM attendance_shifts
    WHERE is_active = 1
    ORDER BY
      CASE name
        WHEN 'WINTER' THEN 1
        WHEN 'SUMMER' THEN 2
        WHEN 'RAMADAN' THEN 3
        ELSE 99
      END
    LIMIT 1
    `
  );

  return fallback[0] || null;
}

async function getActiveRule() {
  const [rows] = await pool.execute(
    `SELECT id, grace_minutes, notify_employee, notify_hr_admin
     FROM attendance_rules
     WHERE is_active = 1
     ORDER BY id DESC
     LIMIT 1`
  );
  return rows[0] || { grace_minutes: 15, notify_employee: 1, notify_hr_admin: 1 };
}

function toYMD(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isAdminLike(user) {
  const level = Number(user?.flags?.level || 0);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return (
    level > 6 ||
    roles.includes("super_admin") ||
    roles.includes("admin") ||
    roles.includes("hr")
  );
}

/**
 * GET /attendance/offices
 */
const listOffices = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, code
       FROM offices
       WHERE is_active = 1
       ORDER BY id ASC`
    );
    return res.json({ offices: rows });
  } catch (e) {
    console.error("listOffices error:", e);
    return res.status(500).json({ message: "Failed to load offices" });
  }
};

/**
 * GET /attendance/today
 */
const getToday = async (req, res) => {
  try {
    const user = req.session?.user;
    const employeeId = user?.id;
    if (!employeeId) return res.status(401).json({ message: "Unauthenticated" });

    const today = toYMD(new Date());
    const shift = await resolveShiftForDate(today);
    const rule = await getActiveRule();

    const [dailyRows] = await pool.execute(
      `
      SELECT *
      FROM attendance_daily
      WHERE employee_id = ? AND attendance_date = ?
      LIMIT 1
      `,
      [employeeId, today]
    );

    return res.json({
      date: today,
      shift: shift
        ? { id: shift.id, name: shift.name, start_time: shift.start_time, end_time: shift.end_time }
        : null,
      grace_minutes: Number(rule.grace_minutes || 0),
      attendance: dailyRows[0] || null,
    });
  } catch (e) {
    console.error("getToday error:", e);
    return res.status(500).json({ message: "Failed to load today's attendance" });
  }
};

/**
 * POST /attendance/punch
 * body: { office_id, punch_type: 'IN'|'OUT', employee_id? (admin only), note? }
 */
const punch = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser?.id) return res.status(401).json({ message: "Unauthenticated" });

    const { office_id, punch_type, employee_id, note, clientTime } = req.body || {};

    if (!office_id) return res.status(400).json({ message: "office_id is required" });
    if (!punch_type || !["IN", "OUT"].includes(punch_type)) {
      return res.status(400).json({ message: "punch_type must be IN or OUT" });
    }

    // --- SECURITY CHECK: CLOCK MANIPULATION ---
    const now = new Date();
    if (clientTime) {
      const cTime = new Date(clientTime);
      const diffMs = Math.abs(now.getTime() - cTime.getTime());
      const diffMin = diffMs / 60000;

      if (diffMin > 5) {
        try {
          await conn.execute(
            `INSERT INTO attendance_security_violations 
              (employee_id, server_time, client_time, drift_minutes, punch_type)
             VALUES (?, ?, ?, ?, ?)`,
            [
              employee_id || sessionUser.id,
              now,
              cTime,
              Math.round(diffMin),
              punch_type
            ]
          );
        } catch (logErr) {
          console.error("Failed to log security violation:", logErr);
        }

        return res.status(403).json({
          message: "Security violation detected: Your system clock is not synchronized with the server. Please correct your time and try again.",
          serverTime: now,
          clientTime: cTime,
          drift: Math.round(diffMin)
        });
      }
    }
    // ------------------------------------------

    // Admin can punch for others; normal user only for self
    const targetEmployeeId =
      employee_id && isAdminLike(sessionUser) ? Number(employee_id) : Number(sessionUser.id);
    const today = toYMD(now);
    const shift = await resolveShiftForDate(today);
    if (!shift) return res.status(400).json({ message: "No active shift configured" });

    const rule = await getActiveRule();
    const grace = Number(rule.grace_minutes || 0);

    await conn.beginTransaction();

    // 1) Insert punch event
    await conn.execute(
      `
      INSERT INTO attendance_punches
        (employee_id, office_id, punch_type, punched_at, source, marked_by_employee_id, note)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        targetEmployeeId,
        Number(office_id),
        punch_type,
        now,
        employee_id && isAdminLike(sessionUser) ? "ADMIN" : "WEB",
        employee_id && isAdminLike(sessionUser) ? sessionUser.id : null,
        note ? String(note).slice(0, 255) : null,
      ]
    );

    // 2) Ensure daily row exists
    const [dailyRows] = await conn.execute(
      `
      SELECT *
      FROM attendance_daily
      WHERE employee_id = ? AND attendance_date = ?
      LIMIT 1
      FOR UPDATE
      `,
      [targetEmployeeId, today]
    );

    if (!dailyRows.length) {
      await conn.execute(
        `
        INSERT INTO attendance_daily (employee_id, attendance_date, shift_id, status)
        VALUES (?, ?, ?, 'NOT_MARKED')
        `,
        [targetEmployeeId, today, shift.id]
      );
    }

    // Lock row
    const [daily2] = await conn.execute(
      `
      SELECT *
      FROM attendance_daily
      WHERE employee_id = ? AND attendance_date = ?
      LIMIT 1
      FOR UPDATE
      `,
      [targetEmployeeId, today]
    );

    const daily = daily2[0];
    const shiftStart = new Date(`${today}T${shift.start_time}`);

    if (punch_type === "IN") {
      if (daily.first_in) {
        await conn.rollback();
        return res.status(409).json({ message: "Already checked in today" });
      }

      // late calculation
      const lateMs = now.getTime() - shiftStart.getTime();
      const lateMinutesRaw = Math.floor(lateMs / 60000);
      const lateMinutes = lateMinutesRaw > grace ? lateMinutesRaw : 0;

      const status = lateMinutes > 0 ? "LATE" : "PRESENT";

      await conn.execute(
        `
        UPDATE attendance_daily
        SET first_in = ?,
            office_id_first_in = ?,
            late_minutes = ?,
            status = ?
        WHERE id = ?
        `,
        [now, Number(office_id), lateMinutes, status, daily.id]
      );
    } else {
      if (!daily.first_in) {
        await conn.rollback();
        return res.status(409).json({ message: "Cannot check out before check in" });
      }
      if (daily.last_out) {
        await conn.rollback();
        return res.status(409).json({ message: "Already checked out today" });
      }

      const workedMs = now.getTime() - new Date(daily.first_in).getTime();
      const workedMinutes = Math.max(0, Math.floor(workedMs / 60000));

      const finalStatus = daily.status === "NOT_MARKED" ? "PRESENT" : daily.status;

      await conn.execute(
        `
        UPDATE attendance_daily
        SET last_out = ?,
            office_id_last_out = ?,
            worked_minutes = ?,
            status = ?
        WHERE id = ?
        `,
        [now, Number(office_id), workedMinutes, finalStatus, daily.id]
      );
    }

    await conn.commit();

    const [updatedDaily] = await pool.execute(
      `
      SELECT *
      FROM attendance_daily
      WHERE employee_id = ? AND attendance_date = ?
      LIMIT 1
      `,
      [targetEmployeeId, today]
    );

    return res.json({
      message: "Punch saved",
      date: today,
      shift: { id: shift.id, name: shift.name, start_time: shift.start_time, end_time: shift.end_time },
      grace_minutes: grace,
      attendance: updatedDaily[0] || null,
    });
  } catch (e) {
    try { await conn.rollback(); } catch { }
    console.error("punch error:", e);
    return res.status(500).json({ message: "Failed to punch attendance" });
  } finally {
    conn.release();
  }
};

/**
 * GET /attendance/admin/missing?date=YYYY-MM-DD
 */
const adminMissing = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!isAdminLike(user)) return res.status(403).json({ message: "Forbidden" });

    const date = (req.query?.date && String(req.query.date)) || toYMD(new Date());

    const [rows] = await pool.execute(
      `
      SELECT
        e.id AS employee_id,
        e.Employee_ID,
        e.Employee_Name,
        e.Department,
        e.Designation,
        d.attendance_date,
        d.first_in,
        d.last_out,
        d.status,
        d.late_minutes
      FROM employee_records e
      LEFT JOIN attendance_daily d
        ON d.employee_id = e.id AND d.attendance_date = ?
      WHERE e.is_active = 1
        AND (
          d.id IS NULL
          OR d.first_in IS NULL
          OR (d.first_in IS NOT NULL AND d.last_out IS NULL)
        )
      ORDER BY e.Employee_Name ASC
      `,
      [date]
    );

    return res.json({ date, rows });
  } catch (e) {
    console.error("adminMissing error:", e);
    return res.status(500).json({ message: "Failed to load missing attendance" });
  }
};

module.exports = {
  listOffices,
  getToday,
  punch,
  adminMissing,
};
