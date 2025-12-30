// backend/Utils/email.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "localhost",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email
 * @param {Object} options { to, subject, text, html }
 */
const sendEmail = async (options) => {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.warn("[EmailService] SMTP not configured. Skipping email to:", options.to);
        return { messageId: "skipped-no-config" };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"HRM System" <no-reply@yourcompany.com>',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("sendEmail error:", error);
        throw error;
    }
};

module.exports = { sendEmail };
