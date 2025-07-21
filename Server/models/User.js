import mongoose from "mongoose";
import { resetPasswordToken } from "../controllers/ResetPassword.controller";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["Admin", "Student", "Instructor"],
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile",
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  image: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },
  courfseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
});

export default mongoose.model("User", userSchema);
