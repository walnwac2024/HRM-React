const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const sharp = require("sharp");

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
        // webVersionCache removed to allow library to use compatible version
        puppeteer: {
            handleSIGINT: false,
            headless: true, // Revert to legacy headless for better Windows stability
            protocolTimeout: 0,
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
                "--disable-ipc-flooding-protection",
                "--disable-renderer-backgrounding",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-client-side-phishing-detection",
                "--shm-size=2gb", // Increase shared memory for media
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

        // 🛠️ MONKEY PATCH: Safely wrap sendSeen to prevent internal WhatsApp Web crashes
        try {
            await client.pupPage.evaluate(() => {
                if (window.WWebJS && window.WWebJS.sendSeen) {
                    const originalSendSeen = window.WWebJS.sendSeen;
                    window.WWebJS.sendSeen = async (chat) => {
                        try {
                            return await originalSendSeen(chat);
                        } catch (e) {
                            console.warn("Caught WWebJS.sendSeen error safely:", e.message);
                            return true; // Pretend it succeeded
                        }
                    };
                    console.log("WWebJS.sendSeen monkey patch applied successfully.");
                }
            });
        } catch (e) {
            console.warn("Failed to apply sendSeen monkey patch:", e.message);
        }

        // Sync groups in background to avoid blocking
        syncGroups().catch(err => console.error("Initial group sync error:", err));
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

    // Add generic error listener to catch connection issues
    client.on('error', (err) => {
        console.error("WhatsApp Client Error:", err);
        if (err.message && err.message.includes("Session closed")) {
            connectionStatus = "DISCONNECTED";
        }
    });
}

/**
 * Get Mime Type from filename
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav'
    };
    return map[ext] || 'application/octet-stream';
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

        // 🛠️ NEW: Check if pupPage is still alive to prevent protocol hangs
        if (!client.pupPage || client.pupPage.isClosed()) {
            console.error("WhatsApp Browser page is closed or not available. Re-init might be needed.");
            connectionStatus = "DISCONNECTED";
            return false;
        }

        // Send with image if provided
        if (imagePath) {
            const fs = require('fs');
            const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.resolve(imagePath);
            const exists = fs.existsSync(absolutePath);

            console.log(`pushToWhatsApp: Processing image at ${absolutePath} - Exists: ${exists}`);

            if (exists) {
                try {
                    const { MessageMedia } = require("whatsapp-web.js");

                    // 🟢 NORMALIZATION: Standardize to high-compatibility JPEG
                    const buffer = await sharp(absolutePath)
                        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toBuffer();

                    const data = buffer.toString('base64');
                    const media = new MessageMedia('image/jpeg', data, `announcement.jpg`);

                    console.log(`pushToWhatsApp: Sending PHOTO to ${chatId}...`);

                    // 1️⃣ SEND MEDIA (Without caption to maximize success rate)
                    await client.sendMessage(chatId, media, { sendSeen: false });
                    console.log(`pushToWhatsApp: Photo sent successfully.`);

                    // Wait a moment for WhatsApp to process the photo
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    // 2️⃣ SEND CAPTION/TEXT (As separate message)
                    console.log(`pushToWhatsApp: Sending TEXT to ${chatId}...`);
                    await client.sendMessage(chatId, message, { sendSeen: false });

                    console.log(`pushToWhatsApp: Full announcement delivered successfully.`);
                    return true;
                } catch (mediaErr) {
                    console.error("pushToWhatsApp: Photo delivery failed. Retrying with text-only...", mediaErr.message);
                    // Continue to fallback text-only sending
                }
            } else {
                console.warn(`pushToWhatsApp: Image path provided but file not found. Falling back to text-only.`);
            }
        }

        // 3️⃣ FALLBACK: Send text only
        console.log(`pushToWhatsApp: Triggering text-only delivery to ${chatId}...`);
        await client.sendMessage(chatId, message, { sendSeen: false });

        console.log(`pushToWhatsApp: Text message delivered to ${chatId}`);
        return true;
    } catch (err) {
        console.error("pushToWhatsApp Final Error:", err.message || err);
        if (err.message && (err.message.includes("Session closed") || err.message.includes("Protocol error"))) {
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
