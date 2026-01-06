const { listNews } = require('./Controller/News/NewsController');
const { getToday, getPersonalSummary } = require('./Controller/Attendance/Attendance');
const { listEmployees } = require('./Controller/Employees/Employees');
const { getDashboard } = require('./Controller/UserDeatils/Role');

const mockUser = {
    id: 196,
    Employee_ID: 'EM/043',
    Employee_Name: 'Asad Jamil',
    Official_Email: 'asadjamil@elaanmarketing.com',
    role: 'HR',
    roles: ['HR'],
    Department: 'Human Resource-HOE',
    flags: { level: 10, create: true, edit: true, view: true },
    features: [] // Should be populated if needed
};

const mockRes = {
    json: (data) => console.log(JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
    }
};

async function runDebug() {
    console.log("--- DEBUG NEWS ---");
    await listNews({ session: { user: mockUser } }, mockRes);

    console.log("\n--- DEBUG ATTENDANCE TODAY ---");
    await getToday({ session: { user: mockUser } }, mockRes);

    console.log("\n--- DEBUG PERSONAL SUMMARY ---");
    await getPersonalSummary({ session: { user: mockUser } }, mockRes);

    console.log("\n--- DEBUG MY TEAM ---");
    await listEmployees({ session: { user: mockUser }, query: { department: mockUser.Department } }, mockRes);

    console.log("\n--- DEBUG DASHBOARD ---");
    await getDashboard({ session: { user: mockUser } }, mockRes);

    process.exit();
}

runDebug();
