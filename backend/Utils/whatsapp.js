const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

let client;
let qrCodeString = null;
let connectionStatus = "DISCONNECTED"; // DISCONNECTED, CONNECTING, QR_READY, CONNECTED
let availableGroups = [];

/**
 * Initialize WhatsApp Client
 */
function initWhatsApp() {
    if (client && (connectionStatus === "CONNECTED" || connectionStatus === "CONNECTING" || connectionStatus === "QR_READY")) {
        console.log("WhatsApp already initializing or connected.");
        return;
    }

    console.log("Initializing WhatsApp Client...");
    connectionStatus = "CONNECTING";

    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "hrm-system",
            dataPath: path.join(__dirname, "../.wwebjs_auth")
        }),
        puppeteer: {
            handleSIGINT: false,
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--disable-gpu"
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
        console.log("WhatsApp Authenticated!");
    });

    client.on("auth_failure", (msg) => {
        connectionStatus = "DISCONNECTED";
        console.error("WhatsApp Auth Failure:", msg);
    });

    client.on("disconnected", async (reason) => {
        connectionStatus = "DISCONNECTED";
        qrCodeString = null;
        availableGroups = [];
        console.log("WhatsApp Disconnected:", reason);

        // If unlinked from phone, clear the session folder to force a new QR
        if (reason === "NAVIGATION" || reason === "LOGOUT") {
            try {
                await client.logout();
            } catch (e) { }
        }

        // Attempt to re-init after a delay
        setTimeout(initWhatsApp, 15000);
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

module.exports = {
    initWhatsApp,
    pushToWhatsApp,
    getWhatsAppStatus,
    syncGroups
};
