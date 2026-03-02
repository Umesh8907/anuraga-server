import axios from "axios";
import env from "../config/env.js";

const sendSms = async (phone, message) => {
    if (!env.FAST2SMS_API_KEY) {
        console.warn("Fast2SMS API Key not found. SMS not sent.");
        return { success: false, message: "API key missing" };
    }

    try {
        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "q",
                message: message,
                language: "english",
                flash: 0,
                numbers: phone,
            },
            {
                headers: {
                    authorization: env.FAST2SMS_API_KEY,
                },
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Fast2SMS Error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

const sendOtpSms = async (phone, otp) => {
    const message = `Your Anuraga verification code is: ${otp}. Valid for 10 minutes.`;
    return sendSms(phone, message);
};

export default {
    sendSms,
    sendOtpSms
};
