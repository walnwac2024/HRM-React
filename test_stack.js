const express = require('./backend/node_modules/express');
const { pathToRegexp } = require('./backend/node_modules/path-to-regexp');

try {
    const router = require('./backend/Routes/Route');
    console.log("Router loaded. Checking stack...");

    router.stack.forEach((layer, i) => {
        if (layer.route) {
            const path = layer.route.path;
            try {
                pathToRegexp(path);
                // console.log(`OK: ${path}`);
            } catch (e) {
                console.log(`!!! FAILED AT INDEX ${i}: [${path}]`);
                console.log(`Error: ${e.message}`);
                console.log(`Hex: ${Buffer.from(path).toString('hex')}`);
            }
        }
    });
    console.log("Stack check complete.");
} catch (e) {
    console.log("CRASHED during check!");
    console.log(e);
}
