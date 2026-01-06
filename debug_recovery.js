const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const os = require('os');

const filePath = 'e:/hrm-react/HRM-React/hrm/src/features/employees/components/EmployeeProfileRequest.js';

if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    console.log("File Header (Hex):", buffer.slice(0, 32).toString('hex'));
    console.log("File Header (Text):", buffer.slice(0, 32).toString());
} else {
    console.log("File not found:", filePath);
}

function getFingerprint() {
    try {
        let f = '';
        if (process.platform === 'win32') {
            const cpu = execSync('wmic cpu get processorid').toString();
            const disk = execSync('wmic diskdrive get serialnumber').toString();
            f = cpu + disk;
            console.log("F_RAW_WIN (Length):", f.length);
        }
        const f_clean = f.trim();
        const hash = crypto.createHash('sha256').update(f_clean).digest('hex');
        console.log("F_HASH (Clean):", hash);

        const h_hash = crypto.createHash('sha256').update(os.hostname()).digest('hex');
        console.log("H_HASH (Hostname):", h_hash);
    } catch (e) {
        console.log("Fingerprint error:", e.message);
    }
}

getFingerprint();
