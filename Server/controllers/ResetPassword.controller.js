import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcrypt";

//resertPasswordToken
export const resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        sucess: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "User does not exist",
      });
    }

    //generate token
    const token = crypto.randomUUID();

    //update user with token
    user.token = token;
    user.resetPasswordExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    //create url
    const resetPasswordUrl = `http://localhost:3000/update-password/${token}`;

    //send mail to user
    await mailSender(
      email,
      "Reset Password Link from StudyNotion",
      `
    <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px; font-size: 110%;"></div>
    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Reset Your Password</h2>
    <p>Click on the link below to reset your password</p>
    <a href=${resetPasswordUrl} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Reset Password</a>
    <p>If you have not requested this email then please ignore it.</p>
    <p>Thanks</p>
    <p>StudyNotion</p>
    `
    );

    res.status(200).json({
      sucess: true,
      message: "Email sent successfully, please check your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      message: "Something went wrong in resetPasswordToken controller",
    });
  }
};

//resetPassword in Db
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        sucess: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        sucess: false,
        message: "Password and confirm password do not match",
      });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "User does not exist",
      });
    }

    if (user.resetPasswordExpiry < Date.now()) {
      return res.status(400).json({
        sucess: false,
        message: "Token has been expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.token = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      sucess: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      message: "Something went wrong in resetPassword controller",
    });
  }
};
