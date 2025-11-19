import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transport.verify((error, success) => {
  if (error) {
    console.log(`error${error}`);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const sendemail = async (email, otp) => {
  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #005f73;">💻 Devorix Account Verification</h2>

    <p>Dear User,</p>

    <p>
      Thank you for choosing <strong>Devorix</strong> — your trusted partner for
      modern web and software solutions. To complete your account verification, please use
      the following One-Time Password (OTP):
    </p>

    <h1 style="background: #e6f7ff; color: #000; padding: 10px 25px; display: inline-block; border-radius: 8px; letter-spacing: 3px;">
      ${otp}
    </h1>

    <p>
      <strong>This OTP will expire in 5 minutes.</strong><br/>
      Please do not share this code with anyone. It helps us keep your account secure.
    </p>

    <p>
      If you didn’t request this verification, you can safely ignore this email.
    </p>

    <p style="margin-top: 25px;">
      Best Regards,<br/>
      <strong>Team Devorix</strong><br/>
      <small>Innovating the web, one line of code at a time.</small>
    </p>

    <hr style="margin: 30px 0;" />

    <small style="color: #777;">
      This is an automated message from <strong>Devorix</strong>. Please do not reply to this email.
    </small>
  </div>
`;

  await transport.sendMail({
    from: `Devorix <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Devorix Account Verification - Your OTP Code",
    html: html,
  });
};

export { sendemail };
