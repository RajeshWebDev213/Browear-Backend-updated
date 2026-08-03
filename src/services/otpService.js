import OTP from "../models/OTP.js";

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

const saveOTP = async (email) => {

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await OTP.findOneAndUpdate(
    { email },
    {
      otp,
      expiresAt,
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return otp;
};

const verifyOTP = async (email, enteredOTP) => {

  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    return false;
  }

  if (otpRecord.expiresAt < new Date()) {

    await OTP.deleteOne({ email });

    return false;
  }

  if (otpRecord.otp !== enteredOTP) {
    return false;
  }

  await OTP.deleteOne({ email });

  return true;
};

export {
  saveOTP,
  verifyOTP,
};