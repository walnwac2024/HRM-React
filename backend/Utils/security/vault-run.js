const { getMasterKey, processDirectory } = require('./vault');
const { validateOwner } = require('./ownerAuth');
const path = require('path');

/**
 * Vault Entry Point Script - v3.0 (Fixed Input)
 */

const mode = process.argv[2]; // 'lock' or 'unlock'
const rootDir = path.join(__dirname, '../../../');

if (!['lock', 'unlock'].includes(mode)) {
    console.log("Usage: node folder/vault-run.js <lock|unlock>");
    process.exit(1);
}

const stdin = process.stdin;
const stdout = process.stdout;

stdout.write(`\nV A U L T   ${mode.toUpperCase()}   I N I T I A T E D\n`);
stdout.write(`ENTER PASSKEY (FRAG-B): `);

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let passkeyB = '';

stdin.on('data', (data) => {
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (char === '\n' || char === '\r' || char === '\u0004') {
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write('\n');

            if (validateOwner(passkeyB)) {
                const key = getMasterKey(passkeyB);
                console.log(`${mode === 'lock' ? 'Securing' : 'Restoring'} codebase...`);
                const count = processDirectory(rootDir, key, mode === 'lock' ? 'encrypt' : 'decrypt');
                console.log(`\nSUCCESS: ${count} files ${mode === 'lock' ? 'encrypted' : 'decrypted'}.`);
            } else {
                console.log("\nACCESS DENIED: INVALID KEY.");
            }
            process.exit();
            return;
        } else if (char === '\u0003') {
            process.exit();
        } else if (char === '\u0008' || char === '\x7f') {
            if (passkeyB.length > 0) passkeyB = passkeyB.slice(0, -1);
        } else {
            passkeyB += char;
        }
    }
});
