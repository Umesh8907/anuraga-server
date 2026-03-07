import axios from "axios";
import env from "../../config/env.js";

/**
 * Sends a production-grade SMS via Fast2SMS DLT route
 * @param {string} templateId - DLT Template ID
 * @param {string} phone - Recipient phone number
 * @param {string[]} variables - Values to replace in the template (joined by '|')
 */
export const sendDLTSms = async (templateId, phone, variables = []) => {
    if (!env.FAST2SMS_API_KEY) {
        console.warn("⚠️ Fast2SMS API Key missing. SMS skipped.");
        return { success: false, message: "API key missing" };
    }

    try {
        const payload = {
            route: "dlt",
            sender_id: env.FAST2SMS_SENDER_ID,
            message: templateId,
            variables_values: variables.length > 0 ? variables.join("|") : "",
            numbers: phone,
            flash: 0
        };

        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            payload,
            {
                headers: {
                    authorization: env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json",
                    accept: "application/json"
                }
            }
        );

        if (response.data && response.data.return) {
            console.log(`✅ SMS sent successfully to ${phone} (Template: ${templateId})`);
            return { success: true, data: response.data };
        } else {
            console.error(`❌ Fast2SMS Failure: ${JSON.stringify(response.data)}`);
            return { success: false, data: response.data };
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`❌ Fast2SMS Error: ${errorMsg}`);
        return { success: false, error: errorMsg };
    }
};

export default {
    sendDLTSms
};
