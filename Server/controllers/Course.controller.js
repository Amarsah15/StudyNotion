import Course from "../models/Course.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { imageUploader } from "../utils/imageUploader.js";

//create Course handler function
export const createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    //get thumnail image
    const thumbnail = req.files.thumbnail;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !thumbnail ||
      !category
    ) {
      return res
        .status(400)
        .json({ sucess: false, message: "All fields are required" });
    }
    //check for instructor
    const instructor = await User.findById(req.user.id);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res.status(400).json({
        sucess: false,
        message: "Instructor not found or Only instructors can create courses",
      });
    }

    //check for category is valid
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res
        .status(400)
        .json({ sucess: false, message: "category Details not found" });
    }

    //upload thumbnail image to cloudinary
    const thumbnailUrl = await imageUploader(
      thumbnail,
      process.env.CLOUDINARY_FOLDER_NAME
    );

    const course = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      instructor: instructor._id,
      category: categoryDetails._id,
      thumbnail: thumbnailUrl.secure_url,
    });

    //update instructor's courses array
    // instructor.courses.push(course._id);
    // await instructor.save();
    await User.findByIdAndUpdate(
      { _id: instructor._id },
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    //update category's courses array
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      {
        //update category
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    res
      .status(201)
      .json({ sucess: true, course, message: "Course created successfully" });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ sucess: false, message: "Failed to create course" });
  }
};

//get all courses handler function
const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        sudentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    if (!allCourses || allCourses.length === 0) {
      return res.status(404).json({
        sucess: false,
        message: "No courses found in the database",
      });
    }

    return res.status(200).json({
      sucess: true,
      data: allCourses,
      message: "All courses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ sucess: false, message: "Failed to fetch courses" });
  }
};

const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        sucess: false,
        message: "Course ID is required",
      });
    }

    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        sucess: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      sucess: true,
      data: courseDetails,
      message: "Course details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res
      .status(500)
      .json({
        sucess: false,
        message: "Failed to fetch course",
        error: error.message,
      });
  }
};
