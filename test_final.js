const { pathToRegexp } = require('./backend/node_modules/path-to-regexp');

const routes = [
    "/api/v1/csrf",
    "*",
    "(.*)",
    "/:any*",
    "*any"
];

routes.forEach(r => {
    try {
        console.log(`Testing: [${r}]`);
        pathToRegexp(r);
        console.log("SUCCESS");
    } catch (e) {
        console.log(`FAILED: [${r}]`);
        console.log(e);
        console.log(`Hex: ${Buffer.from(r).toString('hex')}`);
    }
});
