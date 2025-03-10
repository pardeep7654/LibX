export function generateVerificationOtpEmailTemplate(verificationCode) {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 400px; margin: auto;">
            <h2 style="color: #333; text-align: center;">Library Management System</h2>
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">Your verification code is:</p>
            <h3 style="text-align: center; font-size: 24px; color: #007bff;">${verificationCode}</h3>
            <p style="font-size: 16px;">Please enter this code to complete your verification process. This code is valid for a limited time.</p>
            <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
            <p style="font-size: 16px;">Best regards,<br>Library Management Team</p>
        </div>
    `;
}