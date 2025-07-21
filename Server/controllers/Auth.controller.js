import User from "../models/User.js";
import OTP from "../models/OTP.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//sendotp
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ sucess: false, message: "User already exists" });
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //check uniqueness of otp
    let existingOtp = await OTP.findOne({ otp });

    while (existingOtp) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ otp });
    }

    const otpPayload = {
      email,
      otp,
    };

    const otpResponse = await OTP.create(otpPayload);
    console.log(otpResponse);

    res
      .status(200)
      .json({ sucess: true, otp, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ sucess: false, message: "Error in otp generation controller" });
  }
};

//singup
export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res
        .status(403)
        .json({ sucess: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        sucess: false,
        message: "Passwords do not match with confirm password",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ sucess: false, message: "User already exists" });
    }

    //find most recent otp
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!recentOtp || recentOtp.length === 0) {
      return res.status(400).json({ sucess: false, message: "OTP not found" });
    }

    if (recentOtp.otp !== otp) {
      return res.status(400).json({ sucess: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profiler.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const userPayload = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      aditonalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    };

    const user = await User.create(userPayload);
    res
      .status(200)
      .json({ sucess: true, message: "User is registered successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ sucess: false, message: "Error in signup controller" });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(403)
        .json({ sucess: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).populate("aditonalDetails");
    if (!user) {
      return res
        .status(401)
        .json({ sucess: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, accountType: user.accountType },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    user.password = undefined;

    const cookieOptions = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ sucess: false, message: "Error in login controller" });
  }
};

//changePassword
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(403)
        .json({ sucess: false, message: "All fields are required" });
    }

    if(oldPassword === newPassword){
      return res.status(400).json({
        sucess: false,
        message: "New password and old password cannot be same",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        sucess: false,
        message: "New password and confirm password do not match",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ sucess: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ sucess: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ sucess: false, message: "Error in changePassword controller" });
  }
};
