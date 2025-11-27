const { pool } = require("../../Utils/db");
const bcrypt = require("bcryptjs"); // ✅

/**
 * Fields used for the main employees list
 * NOTE: profile_img exposed as profile_picture
 */
const EMP_LIST_FIELDS = `
  id,

  profile_img       AS profile_picture,

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
      station, // Office_Location
      department, // Department
      employeeCode, // Employee_ID
      employeeName, // Employee_Name
      userName, // login_email
      status, // Status
      cnic, // CNIC
      search, // 🔍 global search
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

    // 🔍 GLOBAL SEARCH ACROSS MAIN COLUMNS
    if (search) {
      const s = `%${search}%`;
      where.push(
        `(
          Employee_ID     LIKE ? OR
          Employee_Name   LIKE ? OR
          login_email     LIKE ? OR
          Office_Location LIKE ? OR
          Department      LIKE ? OR
          Designations    LIKE ? OR
          CNIC            LIKE ? OR
          Official_Email  LIKE ? OR
          Email           LIKE ? OR
          Contact         LIKE ?
        )`
      );
      params.push(s, s, s, s, s, s, s, s, s, s);
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

// ---------- SINGLE EMPLOYEE (View / Edit) ----------

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

      canLogin: !!emp.can_login,
      isActive: !!emp.is_active,

      // ✅ include image for view page too
      profile_picture: emp.profile_img || null,
    };

    return res.json(normalized);
  } catch (err) {
    console.error("getEmployeeById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- UPDATE EMPLOYEE (profile/general) ----------

// PATCH /api/v1/employees/:id
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const {
      employeeCode,
      name,
      department,
      designation,
      station,
      status,
      dateOfJoining,
      dateOfBirth,
      cnic,
      gender,
      bloodGroup,
      emailPersonal,
      emailOfficial,
      contact,
      emergencyContact,
      address,
    } = req.body || {};

    const fields = [];
    const params = [];

    if (employeeCode !== undefined) {
      fields.push("Employee_ID = ?");
      params.push(employeeCode);
    }
    if (name !== undefined) {
      fields.push("Employee_Name = ?");
      params.push(name);
    }
    if (department !== undefined) {
      fields.push("Department = ?");
      params.push(department);
    }
    if (designation !== undefined) {
      fields.push("Designations = ?");
      params.push(designation);
    }
    if (station !== undefined) {
      fields.push("Office_Location = ?");
      params.push(station);
    }
    if (status !== undefined) {
      fields.push("Status = ?");
      params.push(status);
    }
    if (dateOfJoining !== undefined) {
      fields.push("Date_of_Joining = ?");
      params.push(dateOfJoining || null);
    }
    if (dateOfBirth !== undefined) {
      fields.push("Date_of_Birth = ?");
      params.push(dateOfBirth || null);
    }
    if (cnic !== undefined) {
      fields.push("CNIC = ?");
      params.push(cnic);
    }
    if (gender !== undefined) {
      fields.push("Gender = ?");
      params.push(gender);
    }
    if (bloodGroup !== undefined) {
      fields.push("Blood_Group = ?");
      params.push(bloodGroup);
    }
    if (emailPersonal !== undefined) {
      fields.push("Email = ?");
      params.push(emailPersonal);
    }
    if (emailOfficial !== undefined) {
      fields.push("Official_Email = ?");
      params.push(emailOfficial);
    }
    if (contact !== undefined) {
      fields.push("Contact = ?");
      params.push(contact);
    }
    if (emergencyContact !== undefined) {
      fields.push("Emergency_Contact = ?");
      params.push(emergencyContact);
    }
    if (address !== undefined) {
      fields.push("Address = ?");
      params.push(address);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const sql = `
      UPDATE employee_records
      SET ${fields.join(", ")}
      WHERE id = ?
    `;
    params.push(id);

    await pool.execute(sql, params);
    return res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("updateEmployee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- UPDATE EMPLOYEE LOGIN / VAULT ----------

// PUT /api/v1/employees/:id/login
async function updateEmployeeLogin(req, res) {
  try {
    const { id } = req.params;
    const { officialEmail, canLogin, password, userType } = req.body || {};

    const fields = [];
    const params = [];

    if (officialEmail !== undefined) {
      fields.push("Official_Email = ?");
      params.push(officialEmail);
    }
    if (userType !== undefined) {
      fields.push("user_type = ?");
      params.push(userType);
    }

    if (typeof canLogin === "boolean") {
      fields.push("can_login = ?");
      params.push(canLogin ? 1 : 0);
    }

    if (password && String(password).trim().length > 0) {
      const hash = await bcrypt.hash(String(password).trim(), 10);
      fields.push("password_hash = ?");
      params.push(hash);
      fields.push("must_change_password = 1");
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No login fields to update" });
    }

    const sql = `
      UPDATE employee_records
      SET ${fields.join(", ")}
      WHERE id = ?
    `;
    params.push(id);

    await pool.execute(sql, params);
    return res.json({ message: "Employee login updated successfully" });
  } catch (err) {
    console.error("updateEmployeeLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- UPDATE EMPLOYEE STATUS ----------

// PATCH /api/v1/employees/:id/status
async function updateEmployeeStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body || {};

    const fields = [];
    const params = [];

    if (typeof isActive === "boolean") {
      fields.push("is_active = ?");
      params.push(isActive ? 1 : 0);
    }

    if (status !== undefined) {
      fields.push("Status = ?");
      params.push(status);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No status fields to update" });
    }

    const sql = `
      UPDATE employee_records
      SET ${fields.join(", ")}
      WHERE id = ?
    `;
    params.push(id);

    await pool.execute(sql, params);
    return res.json({ message: "Employee status updated successfully" });
  } catch (err) {
    console.error("updateEmployeeStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------- LOOKUP ENDPOINTS (dropdowns) ----------

async function lookupUserTypes(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT type AS value FROM users_types ORDER BY type`
    );
    res.json(rows.map((r) => r.value));
  } catch (err) {
    console.error("lookupUserTypes error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

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
  updateEmployee,
  updateEmployeeLogin,
  updateEmployeeStatus,
  lookupUserTypes,
};
