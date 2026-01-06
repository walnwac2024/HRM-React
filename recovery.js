const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * RECOVERY SYSTEM v5.0 (ULTIMATE BRUTE-FORCE)
 * High-probability restoration script.
 */

// 1. Get the real Fragment A
function getFragA() {
    try {
        const dotEnv = fs.readFileSync(path.join(__dirname, '.env.owner'), 'utf8');
        return dotEnv.match(/FRAG_A=(.*)/)[1].trim();
    } catch (e) {
        return "ZANIA_ZIA_ROOT_FRAGMENT_DO_NOT_SHARE_7733";
    }
}

// 2. Exact replication of the Fingerprint logic used during Vault Lock
function getHardwareID() {
    try {
        let f = '';
        if (process.platform === 'win32') {
            f += execSync('wmic cpu get processorid').toString();
            f += execSync('wmic diskdrive get serialnumber').toString();
        } else {
            f += os.hostname();
            f += os.networkInterfaces().eth0?.[0]?.mac || 'unknown';
        }
        return crypto.createHash('sha256').update(f).digest('hex');
    } catch (e) {
        return crypto.createHash('sha256').update(os.hostname()).digest('hex');
    }
}

function decrypt(filePath, key) {
    try {
        const data = fs.readFileSync(filePath);
        if (data.slice(0, 7).toString() !== 'ENCRYPT') return false;
        const iv = data.slice(7, 23);
        const ciphertext = data.slice(23);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        fs.writeFileSync(filePath, plain);
        return true;
    } catch (e) { return false; }
}

function scan(dir, key) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            if (!['node_modules', '.git'].includes(file)) count += scan(full, key);
        } else if (decrypt(full, key)) {
            count++;
        }
    }
    return count;
}

console.log("\n==========================================");
console.log("    RECOVERY SYSTEM v5.0 (BRUTE-FORCE)    ");
console.log("==========================================\n");
console.log("Target Key: oM/xd,44B,48");
process.stdout.write("Press ENTER to start deep-scant restoration...");

const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.on('data', () => {
    stdin.setRawMode(false);
    stdin.pause();

    console.log("\n\n🛠️ Starting Restoration...");

    const fragA = getFragA();
    const fragC = getHardwareID();
    const passkeyB = "oM/xd,44B,48";

    // Attempt variations in case of whitespace/formatting issues
    const variations = [
        passkeyB,
        passkeyB.trim(),
        passkeyB.replace(/\r/g, ''),
        passkeyB.split(' ')[0]
    ];

    let success = false;
    for (const v of variations) {
        const seed = `${fragA}:${v}:${fragC}`;
        const key = crypto.createHash('sha256').update(seed).digest();

        console.log(`Checking key variation: [${v}]`);
        const result = scan(path.join(__dirname, '.'), key);

        if (result > 0) {
            console.log(`\n✅ RECOVERY SUCCESS! ${result} files restored.`);
            success = true;
            break;
        }
    }

    if (!success) {
        console.log("\n❌ ALL KEY VARIATIONS FAILED.");
        console.log("Possibility: Hardware Fingerprint has changed.");
        console.log("Checking fallback fingerprint (Hostname)...");

        const fallbackC = crypto.createHash('sha256').update(os.hostname()).digest('hex');
        const seed = `${fragA}:${passkeyB}:${fallbackC}`;
        const key = crypto.createHash('sha256').update(seed).digest();
        const result = scan(path.join(__dirname, '.'), key);

        if (result > 0) {
            console.log(`\n✅ FALLBACK SUCCESS! ${result} files restored.`);
        } else {
            console.log("\nCRITICAL: Passkey rejected. No match found.");
        }
    }

    process.exit();
});
