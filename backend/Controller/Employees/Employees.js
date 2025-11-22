const { pool } = require("../../Utils/db");

// Fields used for the main employees list
const EMP_LIST_FIELDS = `
  id,

  Employee_ID       AS employeeCode,
  Employee_Name     AS name,
  CNIC              AS cnic,
  login_email       AS userName,

  Office_Location   AS station,
  Department        AS department,
  Designations      AS designation,
  Status            AS employmentStatus,

  Official_Email    AS officialEmail,
  Email             AS personalEmail,
  Contact           AS contact,
  Gender            AS gender,

  is_active         AS isActive,
  can_login         AS canLogin,

  Date_of_Joining   AS dateOfJoining,
  Date_of_Birth     AS dateOfBirth
`;

// ---------- EMPLOYEE LIST (filters + table) ----------

// GET /api/v1/employees
async function listEmployees(req, res) {
  try {
    const {
      station,       // Office_Location
      department,    // Department
      employeeCode,  // Employee_ID
      employeeName,  // Employee_Name
      userName,      // login_email
      status,        // Status
      cnic,          // CNIC
    } = req.query;

    const where = [];
    const params = [];

    if (station) {
      where.push("Office_Location = ?");
      params.push(station);
    }

    if (department) {
      where.push("Department = ?");
      params.push(department);
    }

    if (employeeCode) {
      where.push("Employee_ID LIKE ?");
      params.push(`%${employeeCode}%`);
    }

    if (employeeName) {
      where.push("Employee_Name LIKE ?");
      params.push(`%${employeeName}%`);
    }

    if (userName) {
      where.push("login_email LIKE ?");
      params.push(`%${userName}%`);
    }

    if (status) {
      where.push("Status = ?");
      params.push(status);
    }

    if (cnic) {
      where.push("CNIC LIKE ?");
      params.push(`%${cnic}%`);
    }

    let sql = `
      SELECT ${EMP_LIST_FIELDS}
      FROM employee_records
    `;

    if (where.length) {
      sql += " WHERE " + where.join(" AND ");
    }

    sql += " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("listEmployees error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- SINGLE EMPLOYEE (View Employee) ----------

// GET /api/v1/employees/:id
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      "SELECT * FROM employee_records WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const emp = rows[0];

    const normalized = {
      id: emp.id,
      employeeCode: emp.Employee_ID,
      name: emp.Employee_Name,

      designation: emp.Designations,
      department: emp.Department,
      status: emp.Status,
      station: emp.Office_Location,

      dateOfJoining: emp.Date_of_Joining,
      dateOfBirth: emp.Date_of_Birth,

      cnic: emp.CNIC,
      gender: emp.Gender,
      bloodGroup: emp.Blood_Group,

      emailPersonal: emp.Email,
      emailOfficial: emp.Official_Email,
      contact: emp.Contact,
      emergencyContact: emp.Emergency_Contact,
      address: emp.Address,
    };

    return res.json(normalized);
  } catch (err) {
    console.error("getEmployeeById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- LOOKUP ENDPOINTS (dropdowns) ----------

// GET /api/v1/employees/lookups/stations
async function lookupStations(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT DISTINCT Office_Location AS value
      FROM employee_records
      WHERE Office_Location IS NOT NULL AND Office_Location <> ''
      ORDER BY Office_Location
      `
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupStations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/v1/employees/lookups/departments
async function lookupDepartments(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT DISTINCT Department AS value
      FROM employee_records
      WHERE Department IS NOT NULL AND Department <> ''
      ORDER BY Department
      `
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupDepartments error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/v1/employees/lookups/groups
// derive group from suffix after "-" in Department, e.g. "Sales Department - EM" -> "EM"
async function lookupGroups(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT DISTINCT TRIM(SUBSTRING_INDEX(Department, '-', -1)) AS value
      FROM employee_records
      WHERE Department IS NOT NULL
        AND Department <> ''
        AND Department LIKE '%-%'
      ORDER BY value
      `
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupGroups error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/v1/employees/lookups/designations
async function lookupDesignations(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT DISTINCT Designations AS value
      FROM employee_records
      WHERE Designations IS NOT NULL AND Designations <> ''
      ORDER BY Designations
      `
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupDesignations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/v1/employees/lookups/statuses
async function lookupStatuses(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT DISTINCT Status AS value
      FROM employee_records
      WHERE Status IS NOT NULL AND Status <> ''
      ORDER BY Status
      `
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupStatuses error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/v1/employees/lookups/role-templates
// static for now
async function lookupRoleTemplates(req, res) {
  try {
    res.json(["Admin", "HR", "Employee"]);
  } catch (err) {
    console.error("lookupRoleTemplates error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listEmployees,
  getEmployeeById,
  lookupStations,
  lookupDepartments,
  lookupGroups,
  lookupDesignations,
  lookupStatuses,
  lookupRoleTemplates,
};
