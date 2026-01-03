const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getMachineFingerprint, getFragmentA } = require('./ownerAuth');

/**
 * Vault Utility: Recursive Source Code Encryption/Decryption
 */

const EXTENSIONS = ['.js', '.jsx', '.css', '.env', '.html'];
const ALWAYS_IGNORE = ['node_modules', '.git', '.owner_security', '.wwebjs_auth', '.vscode', 'security', 'uploads'];
const RUNTIME_DIR = 'backend'; // Server files must stay plain text to run
const BUILD_DIR = 'build';    // Production files must stay plain text for users
const IGNORE_FILES = ['package.json', 'package-lock.json', 'vault.js', 'vault-run.js', 'ownerAuth.js', 'security-bridge.js', 'recovery.js', 'server.js'];

function getMasterKey(passkeyB) {
    const fragA = getFragmentA();
    const fragC = getMachineFingerprint();
    if (!fragA) return null;

    const masterSeed = `${fragA}:${passkeyB}:${fragC}`;
    return crypto.createHash('sha256').update(masterSeed).digest();
}

function cryptFile(filePath, key, mode = 'encrypt') {
    try {
        const data = fs.readFileSync(filePath);

        // Skip if already encrypted or if we're encrypting binary-looking data twice accidentally
        const isAlreadyEnc = data.slice(0, 7).toString('hex') === '454e4352595054'; // "ENCRYPT" (7 bytes)

        if (mode === 'encrypt') {
            if (isAlreadyEnc) return false;

            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = Buffer.concat([Buffer.from('ENCRYPT'), iv, cipher.update(data), cipher.final()]);
            fs.writeFileSync(filePath, encrypted);
            return true;
        } else {
            if (!isAlreadyEnc) return false;

            const iv = data.slice(7, 23);
            const actualData = data.slice(23);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = Buffer.concat([decipher.update(actualData), decipher.final()]);
            fs.writeFileSync(filePath, decrypted);
            return true;
        }
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
        return false;
    }
}

function processDirectory(dir, key, mode) {
    const files = fs.readdirSync(dir);
    let count = 0;

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (ALWAYS_IGNORE.includes(file)) continue;

            // Skip locking the backend and build folders so the system stays live
            if (mode === 'encrypt' && (file === RUNTIME_DIR || file === BUILD_DIR)) {
                continue;
            }

            count += processDirectory(fullPath, key, mode);
        } else {
            if (EXTENSIONS.includes(path.extname(file)) && !IGNORE_FILES.includes(file)) {
                if (cryptFile(fullPath, key, mode)) count++;
            }
        }
    }
    return count;
}

module.exports = {
    getMasterKey,
    processDirectory
};
