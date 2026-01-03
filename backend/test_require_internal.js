try {
    console.log("Attempting to require routes from internal backend...");
    const routes = require('./Routes/Route');
    console.log("Successfully required routes!");
} catch (e) {
    console.log("CRASHED during require!");
    console.log(e);
}
