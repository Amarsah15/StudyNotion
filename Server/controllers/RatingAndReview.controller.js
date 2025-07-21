import RatingAndReviews from "../models/RatingAndReviews.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

//create rating and review
export const createRatingAndReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const { courseId, rating, review } = req.body;

    if (!userId || !courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user has purchaed the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "You have not purchased this course",
      });
    }

    // Check if user has already rated the course
    const existingRating = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (existingRating) {
      return res.status(403).json({
        success: false,
        message: "You have already rated this course",
      });
    }

    // Create new rating and review
    const newRatingAndReview = await RatingAndReviews.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });

    // Update course rating
    const updatedCourseReview = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { ratingsAndReviews: newRatingAndReview._id },
      },
      {
        new: true,
      }
    );

    console.log(updatedCourseReview);

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      newRatingAndReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in creating rating and review",
      error: error.message,
    });
  }
};

//get average rating of a course
export const getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Calculate average rating using aggregation
    const averageRating = await RatingAndReviews.aggregate([
      // new mongoose.Types.ObjectId(courseId) is used to convert string to ObjectId
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (averageRating.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        averageRating: averageRating[0].averageRating,
      });
    } else {
      return res.status(200).json({
        success: sucess,
        message: "No ratings is given for this course",
        averageRating: 0,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching average rating",
      error: error.message,
    });
  }
};

//get all ratings and reviews
export const getAllRatingsAndReviews = async (req, res) => {
  try {
    // Fetch all ratings and reviews
    const ratingsAndReviews = await RatingAndReviews.find({})
      .sort({ rating: "desc" })
      .populate("user", "firstName lastName email image")
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Ratings and reviews fetched successfully",
      ratingsAndReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching ratings and reviews",
      error: error.message,
    });
  }
};

//get all ratings and reviews of a course
export const getAllRatingsAndReviewsOfCourse = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }
    // Fetch all ratings and reviews for the course
    const ratingsAndReviews = await RatingAndReviews.find({ course: courseId });

    return res.status(200).json({
      success: true,
      message: "Ratings and reviews fetched successfully",
      ratingsAndReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching ratings and reviews",
      error: error.message,
    });
  }
};
