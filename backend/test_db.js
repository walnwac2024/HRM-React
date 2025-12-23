const { pool } = require('./Utils/db');
const bcrypt = require('bcryptjs');

async function testInsert() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const finalEmployeeCode = 'DB-DEBUG-' + Date.now();
    const fullName = 'Debug Test';
    const designation = 'Developer';
    const department = 'IT';
    const status = 'Active';
    const station = 'Head Office';
    const offerLetter = '';
    const dateOfJoining = '2024-01-01';
    const probation = '';
    const reportingTo = '';
    const gender = 'Male';
    const dateOfBirth = '1990-01-01';
    const cnic = '12345-1234567-1';
    const personalEmail = 'personal@test.com';
    const personalContact = '1234567';
    const bloodGroup = 'O+';
    const religion = 'Islam';
    const maritalStatus = 'Single';
    const emergencyContact = '9876543';
    const emergencyRelation = 'Brother';
    const address = 'Test Address';
    const officialEmail = 'official@test.com';
    const officialContact = '555-0199';
    const passwordHash = await bcrypt.hash('password123', 10);
    const canLogin = 1;
    const mustChangePassword = 1;

    const sql = `
        INSERT INTO employee_records (
          Employee_ID,
          Employee_Name,
          Designations,
          Department,
          Status,
          Office_Location,
          Offer_Letter,
          Date_of_Joining,
          Probation,
          \`Status.1\`,
          Reporting,
          Gender,
          Date_of_Birth,
          CNIC,
          Email,
          Contact,
          Blood_Group,
          Relagion,
          \`Status.2\`,
          Emergency_Contact,
          Relation,
          Address,
          Official_Email,
          password_hash,
          can_login,
          is_active,
          last_login_at,
          must_change_password,
          Offical_Contact,
          profile_img
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `;

    const params = [
      finalEmployeeCode,
      fullName,
      designation,
      department,
      status,
      station,
      offerLetter,
      dateOfJoining,
      probation,
      "",
      reportingTo,
      gender,
      dateOfBirth,
      cnic,
      personalEmail,
      personalContact,
      bloodGroup,
      religion,
      maritalStatus,
      emergencyContact,
      emergencyRelation,
      address,
      officialEmail,
      passwordHash,
      canLogin,
      1,
      null,
      mustChangePassword,
      officialContact,
      null
    ];

    console.log("SQL placeholder count: 30");
    console.log("Params array length:", params.length);

    const [result] = await conn.execute(sql, params);
    console.log("Insert Success:", result.insertId);
    const newEmployeeId = result.insertId;

    // Test Shift Assignment
    const shiftId = 1;
    console.log("Testing Shift Assignment for ID:", shiftId);
    await conn.execute(
      "INSERT INTO employee_shift_assignments (employee_id, shift_id, effective_from) VALUES (?, ?, ?)",
      [newEmployeeId, shiftId, dateOfJoining || new Date().toISOString().slice(0, 10)]
    );
    console.log("Shift Assignment Success");

    await conn.rollback();
  } catch (err) {
    console.error("DATABASE ERROR FOUND:");
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

testInsert();
