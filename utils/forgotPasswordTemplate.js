export const forgotPasswordTemplate = (resetLink) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset Request</h2>
            <p>Hi,</p>
            <p>We received a request to reset your password.expires in 15 min Click the link below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p>Thanks,</p>
            <p>Your Company Team</p>
        </div>
    `;
};
