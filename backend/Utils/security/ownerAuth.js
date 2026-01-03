const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

/**
 * Owner-Auth Utility for Zaniab Zia
 * Manages 3-fragment key reconstruction and machine registry.
 */

const AUTH_DIR = path.join(__dirname, '../../../.owner_security');
const REGISTRY_FILE = path.join(AUTH_DIR, 'device_registry.enc');
const OWNER_ENV = path.join(__dirname, '../../../.env.owner');

if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
}

function getMachineFingerprint() {
    try {
        // Combinatorial fingerprint: CPU ID + Disk Serial + Hostname
        let fingerprint = '';
        if (process.platform === 'win32') {
            fingerprint += execSync('wmic cpu get processorid').toString();
            fingerprint += execSync('wmic diskdrive get serialnumber').toString();
        } else {
            fingerprint += os.hostname();
            fingerprint += os.networkInterfaces().eth0?.[0]?.mac || 'unknown';
        }
        return crypto.createHash('sha256').update(fingerprint).digest('hex');
    } catch (e) {
        return crypto.createHash('sha256').update(os.hostname()).digest('hex');
    }
}

function getFragmentA() {
    if (fs.existsSync(OWNER_ENV)) {
        const content = fs.readFileSync(OWNER_ENV, 'utf8');
        const match = content.match(/FRAG_A=(.*)/);
        return match ? match[1].trim() : null;
    }
    return null;
}

function reconstructKey(fragA, fragB, fragC) {
    const masterSeed = `${fragA}:${fragB}:${fragC}`;
    return crypto.createHash('sha256').update(masterSeed).digest();
}

/**
 * Validates if the current machine and provided passkey are owner-authorized.
 */
function validateOwner(passkeyB) {
    const fragA = getFragmentA();
    const fragC = getMachineFingerprint();

    if (!fragA) {
        console.error("CRITICAL ERROR: FRAG-A MISSING. ACCESS DENIED.");
        return false;
    }

    const masterKey = reconstructKey(fragA, passkeyB, fragC);

    // Check registry (In a real impl, this would be encrypted with Frag A + B)
    if (!fs.existsSync(REGISTRY_FILE)) {
        // First boot or recovery: Initialize with current machine
        console.log("INITIALIZING OWNER REGISTRY FOR ZANIAB ZIA...");
        const registryData = JSON.stringify([fragC]);
        const cipher = crypto.createCipheriv('aes-256-cbc', masterKey, Buffer.alloc(16, 0));
        let encrypted = cipher.update(registryData, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        fs.writeFileSync(REGISTRY_FILE, encrypted);
        return true;
    }

    try {
        const encryptedRegistry = fs.readFileSync(REGISTRY_FILE, 'utf8');
        const decipher = crypto.createDecipheriv('aes-256-cbc', masterKey, Buffer.alloc(16, 0));
        let decrypted = decipher.update(encryptedRegistry, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const authorizedDevices = JSON.parse(decrypted);
        if (authorizedDevices.includes(fragC)) {
            return true;
        } else {
            console.error("ACCESS DENIED: UNAUTHORIZED DEVICE DETECTED.");
            return false;
        }
    } catch (e) {
        console.error("ACCESS DENIED: INVALID OWNER PASSKEY.");
        return false;
    }
}

module.exports = {
    validateOwner,
    getMachineFingerprint,
    getFragmentA
};
