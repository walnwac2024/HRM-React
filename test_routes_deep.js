const { pathToRegexp } = require('./backend/node_modules/path-to-regexp');
const fs = require('fs');

function testFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Find all strings like "/something/:something"
    const regex = /["'](\/[^"']+)["']/g;
    let match;
    const routes = [];

    while ((match = regex.exec(content)) !== null) {
        const str = match[1];
        if (str.includes(':')) {
            routes.push(str);
        }
    }

    console.log(`\nTesting file: ${filePath}`);
    console.log(`Found ${routes.length} potential routes with colons.`);

    routes.forEach(route => {
        try {
            pathToRegexp(route);
        } catch (e) {
            console.log(`!!! FAILED ROUTE: [${route}]`);
            console.log(`Error: ${e.message}`);
            console.log(`Hex: ${Buffer.from(route).toString('hex')}`);
        }
    });
}

testFile('backend/Routes/Route.js');
testFile('backend/server.js');
