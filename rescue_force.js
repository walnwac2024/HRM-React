const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * RESCUE FORCE v1.0
 * Bypasses fingerprint inconsistencies by matching with device_registry.enc
 */

const FRAG_A = "ZANIA_ZIA_ROOT_FRAGMENT_DO_NOT_SHARE_7733";
const PASSKEY_B = "oM/xd,44B,48";
const REGISTRY_FILE = path.join(__dirname, '.owner_security/device_registry.enc');

function getVariations() {
    const vars = [];
    try {
        const cpu = execSync('wmic cpu get processorid').toString();
        const disk = execSync('wmic diskdrive get serialnumber').toString();
        const host = os.hostname();

        // Variation 1: Raw (what many scripts do)
        vars.push(cpu + disk);

        // Variation 2: Component-wise trimmed
        vars.push(cpu.trim() + disk.trim());

        // Variation 3: Pure IDs (stripping headers)
        const cpuId = cpu.replace('ProcessorId', '').trim();
        const diskId = disk.replace('SerialNumber', '').trim();
        vars.push(cpuId + diskId);

        // Variation 4: No internal spaces
        vars.push((cpuId + diskId).replace(/\s+/g, ''));

        // Variation 5: Hostname only
        vars.push(host);
        vars.push(host.trim());

    } catch (e) { }
    return [...new Set(vars)];
}

function testKey(key, encryptedRegistry) {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
        let decrypted = decipher.update(encryptedRegistry, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted); // Success if it parses as JSON
    } catch (e) {
        return null;
    }
}

function decryptFile(filePath, key) {
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
            if (!['node_modules', '.git', '.owner_security', '.wwebjs_auth', 'build'].includes(file)) {
                count += scan(full, key);
            }
        } else if (decryptFile(full, key)) {
            count++;
        }
    }
    return count;
}

console.log("\n==========================================");
console.log("          RESCUE FORCE v1.0            ");
console.log("==========================================\n");

if (!fs.existsSync(REGISTRY_FILE)) {
    console.log("❌ CRITICAL ERROR: device_registry.enc not found.");
    process.exit(1);
}

const encryptedRegistry = fs.readFileSync(REGISTRY_FILE, 'utf8');
const variations = getVariations();
let masterKey = null;

console.log(`Checking ${variations.length} hardware Variations...`);

for (const v of variations) {
    const fragC = crypto.createHash('sha256').update(v).digest('hex');
    const seed = `${FRAG_A}:${PASSKEY_B}:${fragC}`;
    const key = crypto.createHash('sha256').update(seed).digest();

    if (testKey(key, encryptedRegistry)) {
        console.log("✅ MATCH FOUND! Unlocked using hardware variation.");
        masterKey = key;
        break;
    }
}

if (!masterKey) {
    console.log("\n❌ FAILED: No hardware match found.");
    console.log("Is the Passkey correct? Provided: " + PASSKEY_B);
} else {
    console.log("Restoring all files...");
    const total = scan(path.join(__dirname, '.'), masterKey);
    console.log(`\n🎉 SUCCESS! ${total} files restored. System is UNLOCKED.`);
}
