const fs = require('fs');
const path = require('path');
const express = require('express');

// Dummy some modules to avoid full init
const originalExpress = express;
function mockExpress() {
    const app = originalExpress();
    const originalGet = app.get.bind(app);
    const originalPost = app.post.bind(app);
    const originalUse = app.use.bind(app);

    app.get = function (p, ...args) {
        console.log(`[DEBUG] Registering app.get: ${p}`);
        return originalGet(p, ...args);
    };
    app.post = function (p, ...args) {
        console.log(`[DEBUG] Registering app.post: ${p}`);
        return originalPost(p, ...args);
    };
    app.use = function (p, ...args) {
        if (typeof p === 'string') {
            console.log(`[DEBUG] Registering app.use: ${p}`);
        }
        return originalUse(p, ...args);
    };
    return app;
}

// Modify global require to intercept express? Too complex.
// Let's just create a test server.js that mocks app.

const serverContent = fs.readFileSync('backend/server.js', 'utf8');
// Replace "const app = express();" with our mock
const modifiedServer = serverContent.replace('const app = express();', 'const app = mockExpress();');

fs.writeFileSync('backend/server_debug.js', `
${mockExpress.toString()}
${modifiedServer}
`);

console.log("Created server_debug.js. Run it to see where it crashes.");
