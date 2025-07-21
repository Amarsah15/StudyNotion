import jwt from "jsonwebtoken";
import User from "../models/User.js";

//auth
export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        sucess: false,
        message: "Token not found in Auth middlewares",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      sucess: false,
      message: "Unauthorized in Auth middlewares catch block",
    });
  }
};

//isStudent
export const isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        sucess: false,
        message: "Unauthorized in isStudent middlewares",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      sucess: false,
      message: "Unauthorized in isStudent middlewares catch block",
    });
  }
};

//isInstructor
export const isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        sucess: false,
        message: "Unauthorized acces to Instructor routes",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      sucess: false,
      message: "Unauthorized acces to Instructor routes in catch block",
    });
  }
};

//isAdmin
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        sucess: false,
        message: "Unauthorized acces to Admin routes",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      sucess: false,
      message: "Unauthorized acces to Admin routes in catch block",
    });
  }
};
