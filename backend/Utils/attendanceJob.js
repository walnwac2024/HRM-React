// backend/Utils/attendanceJob.js
const cron = require("node-cron");
const { pool } = require("./db");
const { sendEmail } = require("./email");
require("dotenv").config();

/**
 * Main function to check for missing attendance
 */
async function checkMissingAttendance() {
  console.log("[AttendanceJob] Running check...");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const now = new Date();

  try {
    // 1. Get active rule
    const [rules] = await pool.execute(
      "SELECT * FROM attendance_rules WHERE is_active = 1 LIMIT 1"
    );
    const rule = rules[0] || { grace_minutes: 15, notify_employee: 1, notify_hr_admin: 1 };
    const grace = Number(rule.grace_minutes || 0);
    const buffer = 10; // 10 minutes buffer

    // 2. Fetch all missing employees for today
    // ✅ MODIFIED: Using e.Email (Personal Email) and joining via employee_shift_assignments
    const [missingRows] = await pool.execute(
      `
      SELECT
        e.id,
        e.Employee_ID,
        e.Employee_Name,
        e.Department,
        e.Designations as Designation,
        e.Office_Location,
        e.Email as Personal_Email,
        s.start_time,
        s.name as shift_name
      FROM employee_records e
      INNER JOIN employee_shift_assignments esa ON e.id = esa.employee_id
      INNER JOIN attendance_shifts s ON s.id = esa.shift_id
      LEFT JOIN attendance_daily d ON e.id = d.employee_id AND d.attendance_date = ?
      WHERE e.is_active = 1
        AND s.is_active = 1
        AND (esa.effective_to IS NULL OR esa.effective_to >= ?)
        AND (d.id IS NULL OR d.first_in IS NULL)
        AND e.id NOT IN (SELECT employee_id FROM attendance_alert_logs WHERE attendance_date = ? AND alert_type = 'MISSING_IN')
        AND e.id NOT IN (
          SELECT employee_id FROM leave_applications
          WHERE status = 'approved' AND ? BETWEEN start_date AND end_date
        )
      `,
      [today, today, today, today]
    );

    for (const emp of missingRows) {
      if (!emp.start_time) continue;

      const [sh, sm] = emp.start_time.split(":").map(Number);
      const deadline = new Date(now);
      deadline.setHours(sh, sm + grace + buffer, 0, 0);

      if (now > deadline) {
        console.log(`[AttendanceJob] Alerting for ${emp.Employee_Name}`);

        const subject = `Missing Attendance Alert - ${today}`;
        const body = `
          Hello ${emp.Employee_Name},

          You have not marked your attendance for today (${today}).
          Your expected shift (${emp.shift_name}) start time was ${emp.start_time}.

          Details:
          Department: ${emp.Department}
          Designation: ${emp.Designation}
          Location: ${emp.Office_Location}

          Please mark your attendance as soon as possible.
        `;

        try {
          if (rule.notify_employee && emp.Personal_Email) {
            await sendEmail({ to: emp.Personal_Email, subject, text: body });
          }

          // 1. Email Admin/HR
          if (rule.notify_hr_admin && process.env.HR_EMAIL) {
            await sendEmail({ to: process.env.HR_EMAIL, subject: `Admin Alert: ${subject}`, text: body });
          }

          // 2. Dashboard Notifications for Authorities
          // Find all admins/hr + the department manager
          const [authorities] = await pool.execute(
            `
            SELECT e.id
            FROM employee_records e
            JOIN employee_user_types eut ON e.id = eut.employee_id
            JOIN users_types ut ON ut.id = eut.user_type_id
            WHERE ut.type IN ('admin', 'super_admin', 'hr')
            UNION
            SELECT manager_id as id FROM department_managers WHERE department_name = ?
            `,
            [emp.Department]
          );

          // Exclude the missing employee from their own notification
          const uniqueAuthIds = [...new Set(
            authorities.map(a => Number(a.id))
              .filter(id => id && id !== Number(emp.id))
          )];

          const notifyTitle = "Attendance Alert";
          const notifyMsg = `${emp.Employee_Name} has failed to mark attendance for today (${today}).`;

          for (const authId of uniqueAuthIds) {
            await pool.execute(
              "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'attendance')",
              [authId, notifyTitle, notifyMsg]
            );
          }

          await pool.execute(
            `INSERT INTO attendance_alert_logs
              (employee_id, attendance_date, alert_type, rule_id, emailed_employee, emailed_admins, email_subject, sent_at)
             VALUES (?, ?, 'MISSING_IN', ?, ?, ?, ?, NOW())`,
            [
              emp.id,
              today,
              rule.id || null,
              rule.notify_employee ? 1 : 0,
              rule.notify_hr_admin ? 1 : 0,
              subject
            ]
          );

        } catch (mailErr) {
          console.error(`Failed to notify ${emp.Employee_Name}:`, mailErr);
        }
      }
    }
  } catch (e) {
    console.error("[AttendanceJob] Error:", e);
  }
}

function initAttendanceJob() {
  cron.schedule("*/10 * * * *", () => {
    checkMissingAttendance();
  });
  console.log("[AttendanceJob] Scheduled: every 10 minutes");
}

module.exports = { initAttendanceJob, checkMissingAttendance };
