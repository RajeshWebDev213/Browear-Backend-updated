import transporter from "../config/mail.js";

const sendOTPEmail = async (email, otp) => {
  console.log("📩 sendOTPEmail called");

  try {
    console.log("Before sendMail");

    const info = await transporter.sendMail({
      from: `"Browear" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Browear OTP ${Date.now()}`,
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

    console.log("After sendMail");
    console.log("Message ID:", info.messageId);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
console.log("✅ MAIL SERVICE LOADED");
export default sendOTPEmail;