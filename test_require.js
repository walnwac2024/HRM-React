try {
    console.log("Attempting to require routes...");
    const routes = require('./backend/Routes/Route');
    console.log("Successfully required routes!");
} catch (e) {
    console.log("CRASHED during require!");
    console.log(e);
}
