const { validateOwner } = require('./ownerAuth');
const { spawn } = require('child_process');
const fs = require('fs');

const command = process.argv[2] || 'npm start';

console.log("\n==========================================");
console.log("  HRM MAXIMUM-SECURITY ARCHITECTURE  ");
console.log("        OWNER: ZANIAB ZIA        ");
console.log("==========================================\n");

const envPasskey = process.env.OWNER_PASSKEY_B || process.env.FRAG_B;

if (envPasskey) {
    console.log("Using passkey from environment...");
    if (validateOwner(envPasskey)) {
        console.log("\n✅ OWNER AUTHORIZED (ENV). UNLOCKING SYSTEM...\n");
        startChild();
    } else {
        console.log("\n❌ ACCESS DENIED - INVALID ENV PASSKEY");
        process.exit(1);
    }
} else {
    console.log("\n❌ ACCESS DENIED - PASSKEY REQUIRED");
    console.log("Please provide passkey via OWNER_PASSKEY_B environment variable.\n");
    console.log("Example: set OWNER_PASSKEY_B=your_passkey && npm start\n");
    process.exit(1);
}

function startChild() {
    const shell = process.platform === 'win32' ? true : '/bin/sh';
    const child = spawn(command, [], {
        stdio: 'inherit',
        shell: shell
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });
}
