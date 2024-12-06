import { COMPANY_NAME, HELPLINE_EMAIL } from "./Constants.js";

export const EMAIL_VERIFICATION_TEMPLATE = (OTP) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f9;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .email-header {
        background-color: #007bff;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .email-header h1 {
        margin: 0;
        font-size: 24px;
      }
      .email-body {
        padding: 20px;
        color: #333333;
        line-height: 1.6;
      }
      .email-body h2 {
        color: #007bff;
        margin-top: 0;
      }
      .otp {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: #007bff;
        margin: 20px 0;
      }
      .email-footer {
        background-color: #f4f4f9;
        text-align: center;
        padding: 15px;
        font-size: 14px;
        color: #999999;
      }
      .email-footer a {
        color: #007bff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>Welcome to ${COMPANY_NAME}</h1>
      </div>
      <div class="email-body">
        <p>Hello,</p>
        <p>Thank you for signing up with ${COMPANY_NAME}! To complete your email verification, please use the OTP below:</p>
        <div class="otp">${OTP}</div>
        <p>If you did not request this, please ignore this email or contact support if you have any concerns.</p>
        <p>Thank you,</p>
        <p>The ${COMPANY_NAME} Team</p>
      </div>
      <div class="email-footer">
        <p>If you have any questions, please contact our support team at <a href="mailto:support@${HELPLINE_EMAIL.toLowerCase()}.com">support@${HELPLINE_EMAIL.toLowerCase()}.com</a>.</p>
        <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};