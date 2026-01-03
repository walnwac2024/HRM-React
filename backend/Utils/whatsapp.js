const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

let client;
let qrCodeString = null;
let connectionStatus = "DISCONNECTED"; // DISCONNECTED, CONNECTING, QR_READY, CONNECTED
let connectionStage = null; // LAUNCHING_BROWSER, LOADING_WHATSAPP, FINALIZING
let availableGroups = [];

/**
 * Initialize WhatsApp Client
 */
async function initWhatsApp() {
    // If already doing something, don't start another init
    if (client && (connectionStatus === "CONNECTED" || connectionStatus === "CONNECTING" || connectionStatus === "QR_READY")) {
        console.log("WhatsApp already initializing or connected.");
        return;
    }

    // Clean up old instance if it exists
    if (client) {
        try {
            console.log("Destroying old WhatsApp client...");
            // Use a timeout for destroy to avoid hanging
            const destroyPromise = client.destroy();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Destroy timeout")), 5000));
            await Promise.race([destroyPromise, timeoutPromise]).catch(e => console.warn("Client destroy warning:", e.message));
            client = null;
        } catch (e) {
            console.error("Error destroying old client:", e);
        }
    }

    console.log("Initializing WhatsApp Client...");
    connectionStatus = "CONNECTING";
    connectionStage = "LAUNCHING_BROWSER";

    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "hrm-system",
            dataPath: path.join(__dirname, "../.wwebjs_auth")
        }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1015844855-alpha.html',
        },
        puppeteer: {
            handleSIGINT: false,
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--disable-extensions",
                "--disable-default-apps",
                "--mute-audio",
                "--no-first-run",
                "--disable-web-security",
                "--disable-accelerated-2d-canvas",
                "--no-pings",
                "--disable-notifications",
                "--disable-background-networking",
                "--disable-default-browser-check",
                "--blink-settings=imagesEnabled=false",
                "--disable-remote-fonts",
                "--disable-features=IsolateOrigins,site-per-process",
                "--js-flags='--expose-gc'",
            ],
        }
    });

    client.on("qr", (qr) => {
        qrCodeString = qr;
        connectionStatus = "QR_READY";
        console.log("WhatsApp QR Code received.");
        qrcode.generate(qr, { small: true });
    });

    client.on("ready", async () => {
        qrCodeString = null;
        connectionStatus = "CONNECTED";
        connectionStage = null;
        console.log("WhatsApp Client is READY!");

        try {
            const chats = await client.getChats();
            availableGroups = chats
                .filter(chat => chat.isGroup)
                .map(g => ({
                    id: g.id._serialized,
                    name: g.name
                }));
            console.log(`Synced ${availableGroups.length} WhatsApp groups.`);
        } catch (err) {
            console.error("Error syncing groups:", err);
        }
    });

    client.on("authenticated", () => {
        qrCodeString = null;
        connectionStatus = "AUTHENTICATED";
        console.log("WhatsApp Authenticated! Finalizing setup...");
    });

    client.on("auth_failure", (msg) => {
        connectionStatus = "DISCONNECTED";
        console.error("WhatsApp Auth Failure:", msg);
    });

    client.on("disconnected", async (reason) => {
        const wasConnected = connectionStatus === "CONNECTED";
        connectionStatus = "DISCONNECTED";
        connectionStage = null;
        qrCodeString = null;
        availableGroups = [];
        console.log("WhatsApp Disconnected:", reason);

        // If unlinked from phone, or if we were connected and now aren't, 
        // ensure we call logout only if it's NOT already a logout reason to avoid loop
        if (wasConnected && reason !== "LOGOUT" && (reason === "NAVIGATION")) {
            try {
                await client.logout();
            } catch (e) { }
        }

        // Attempt to re-init after a delay (reduced from 15s for better UX)
        setTimeout(initWhatsApp, 5000);
    });

    client.initialize().catch(err => {
        console.error("WhatsApp Initialization Error:", err);
        connectionStatus = "DISCONNECTED";
    });
}

/**
 * Send message to a group or contact
 */
async function pushToWhatsApp(message, target = null, imagePath = null) {
    if (connectionStatus !== "CONNECTED" || !client) {
        console.warn("Cannot send WhatsApp message: Client not connected.");
        return false;
    }

    try {
        const chatId = target || process.env.WHP_GROUP_ID;
        if (!chatId) {
            console.error("No target Chat ID provided or set in .env");
            return false;
        }

        // Send with image if provided
        if (imagePath && require('fs').existsSync(imagePath)) {
            const { MessageMedia } = require("whatsapp-web.js");
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(chatId, media, { caption: message });
            console.log(`WhatsApp message with image sent to ${chatId}`);
        } else {
            // Send text only
            await client.sendMessage(chatId, message);
            console.log(`WhatsApp message sent to ${chatId}`);
        }

        return true;
    } catch (err) {
        console.error("pushToWhatsApp error:", err);
        // If it fails with a session error, force disconnect
        if (err.message && err.message.includes("Session closed")) {
            connectionStatus = "DISCONNECTED";
        }
        return false;
    }
}

async function getWhatsAppStatus() {
    // Active check if connected to ensure it hasn't gone stale
    if (connectionStatus === "CONNECTED" && client) {
        try {
            // Add a timeout to getState() as it can hang
            const statePromise = client.getState();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 2000)
            );

            const state = await Promise.race([statePromise, timeoutPromise]).catch(() => null);

            if (state && state !== "CONNECTED") {
                console.log("Stale WhatsApp connection detected. Resetting status.");
                connectionStatus = "DISCONNECTED";
            }
        } catch (e) {
            console.error("Error in status check:", e);
        }
    }

    return {
        status: connectionStatus,
        stage: connectionStage,
        qr: qrCodeString,
        groups: availableGroups
    };
}

async function syncGroups() {
    if (connectionStatus !== "CONNECTED" || !client) return [];
    try {
        const chats = await client.getChats();
        availableGroups = chats
            .filter(chat => chat.isGroup)
            .map(g => ({
                id: g.id._serialized,
                name: g.name
            }));
        console.log(`Manually synced ${availableGroups.length} WhatsApp groups.`);
        return availableGroups;
    } catch (err) {
        console.error("Manual sync error:", err);
        return availableGroups;
    }
}

const fs = require("fs");

async function logoutWhatsApp(hardReset = false) {
    if (!client && !hardReset) return;
    try {
        if (client) {
            console.log("Logging out of WhatsApp...");
            try {
                // Use timeouts for logout and destroy
                const logoutPromise = client.logout();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Logout timeout")), 5000));
                await Promise.race([logoutPromise, timeoutPromise]).catch(e => console.warn("Logout warning:", e.message));

                const destroyPromise = client.destroy();
                const destroyTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Destroy timeout")), 5000));
                await Promise.race([destroyPromise, destroyTimeout]).catch(e => console.warn("Destroy warning:", e.message));
            } catch (e) {
                console.warn("Error during client cleanup:", e.message);
            }
            client = null;
        }

        if (hardReset) {
            const authPath = path.join(__dirname, "../.wwebjs_auth");
            if (fs.existsSync(authPath)) {
                console.log("Hard resetting WhatsApp: Deleting session folder...");
                fs.rmSync(authPath, { recursive: true, force: true });
            }
        }

        connectionStatus = "DISCONNECTED";
        qrCodeString = null;
        availableGroups = [];
        console.log(`WhatsApp ${hardReset ? "hard reset" : "logged out"} successfully.`);

        // Restart after a small delay to let files release
        setTimeout(initWhatsApp, 2000);
    } catch (err) {
        console.error("Error during WhatsApp logout/reset:", err);
        connectionStatus = "DISCONNECTED";
    }
}

module.exports = {
    initWhatsApp,
    pushToWhatsApp,
    getWhatsAppStatus,
    syncGroups,
    logoutWhatsApp
};
