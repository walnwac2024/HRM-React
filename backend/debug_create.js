const { pool } = require('./Utils/db');

async function testCreate() {
    const payload = {
        fullName: "Debug Test",
        designation: "Developer",
        department: "IT",
        station: "Head Office",
        status: "Active",
        dateOfJoining: "2024-01-01",
        officialEmail: `debug_${Date.now()}@test.com`,
        personalEmail: "debug@personal.com",
        allowPortalLogin: true,
        password: "password123",
        userType: "standard"
    };

    try {
        const response = await fetch('http://localhost:5000/api/v1/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// Since I can't fetch from here easily, let's look at the controller logic directly again.
// Wait, I can run a node script that calls the DB directly with the same logic as the controller.
