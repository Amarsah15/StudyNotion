import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseDetails,
  // getFullCourseDetails,
  // editCourse,
  // getInstructorCourses,
  // deleteCourse,
} from "../controllers/Course.controller.js";
import {
  showAllCategorys,
  createCategory,
  categoryPageDetails,
} from "../controllers/Categorys.controller.js";
import {
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/Section.controller.js";
import {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} from "../controllers/Subsection.controller.js";
import {
  createRating,
  getAverageRating,
  getAllRating,
} from "../controllers/RatingAndReview.controller.js";
import { updateCourseProgress } from "../controllers/courseProgress.controller.js";
import {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ********************************************************************************************************
//                                            Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses
// router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// // Edit Course routes
// router.post("/editCourse", auth, isInstructor, editCourse);
// // Get all Courses Under a Specific Instructor
// router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// // Delete a Course
// router.delete("/deleteCourse", deleteCourse);

// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                            Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategorys);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                            Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

export default router;
