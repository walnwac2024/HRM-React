const { pathToRegexp } = require('./backend/node_modules/path-to-regexp');
const fs = require('fs');

const content = fs.readFileSync('backend/Routes/Route.js', 'utf8');
const routes = [];
const regex = /router\.(get|post|patch|put|delete)\(\s*["']([^"']+)["']/g;
let match;

while ((match = regex.exec(content)) !== null) {
    routes.push(match[2]);
}

console.log(`Found ${routes.length} routes. Testing...`);

routes.forEach(route => {
    try {
        pathToRegexp(route);
    } catch (e) {
        console.log(`FAILED ROUTE: [${route}]`);
        console.log(`Error: ${e.message}`);

        // Hex dump of the failed route string
        const buf = Buffer.from(route);
        console.log(`Hex: ${buf.toString('hex')}`);
    }
});
