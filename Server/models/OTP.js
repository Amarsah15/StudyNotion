import mongoose from "mongoose";
import mailSender from "../utils/mailSender";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 10 * 60,
  },
});

//a function -> to send mail

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion",
      otp
    );
    console.log("Email sent sucessfully", mailResponse);
  } catch (error) {
    console.log("Error occured while sending mails:", error);
    throw error;
  }
}

OTPSchema.pre("Save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
