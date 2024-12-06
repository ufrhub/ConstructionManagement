import NODE_MAILER from "nodemailer";
import { SENDER_EMAIL_ADDRESS, SENDER_APP_PASSWORD } from "./Constants.js";

export const SEND_EMAIL = ({ from = SENDER_EMAIL_ADDRESS, To, Subject = "noreply", EmailBody }) => {
    const SMTP_TRANSPORT = NODE_MAILER.createTransport({
        service: "gmail",
        auth: {
            user: SENDER_EMAIL_ADDRESS,
            pass: SENDER_APP_PASSWORD,
        }
    });

    const EMAIL_OPTIONS = {
        from: from,
        to: To,
        subject: Subject,
        html: EmailBody
    };

    SMTP_TRANSPORT.sendMail(EMAIL_OPTIONS, (ERROR, INFORMATION) => {
        if (ERROR) {
            return ERROR;

        } else {
            return INFORMATION;
        };
    });
};
