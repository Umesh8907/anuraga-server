import nodemailer from "nodemailer";
import env from "../../config/env.js";

let transporter;

try {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS
            }
        });

        console.log("📬 Email Transporter initialized");
    } else {
        console.warn("⚠️ SMTP credentials missing. Email service will run in mock mode.");
    }
} catch (error) {
    console.error("❌ Failed to initialize Email Transporter:", error.message);
}

/**
 * Sends a professional HTML email
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {Array} options.attachments - Optional attachments
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    if (!transporter) {
        console.warn(`📩 Mock Email to ${to}: ${subject}`);
        return { success: true, mock: true };
    }

    try {
        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            html,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email Error (to: ${to}): ${error.message}`);
        return { success: false, error: error.message };
    }
};

export default {
    sendEmail
};
