import { instance } from "../config/razorpay";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import { courseEnrollmentEmail } from "../mail/templates/courseEnrollmentEmail.js";

export const capturePayment = async (req, res) => {
  try {
    //get courseID and userID from request body
    //validation
    //valid courseID
    //valid courseDetails
    //user already pay for this course
    //create order
    // return response with order details
    const { courseId } = req.body;
    const userId = req.user.id;
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and User ID are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.sudentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "User already enrolled in this course",
      });
    }

    const options = {
      amount: course.price * 100, // Convert to smallest currency unit
      currency: "INR",
      receipt: `receipt_${courseId}_${userId}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await instance.orders.create(options);
    if (order) {
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: order.id,
        currency: order.currency,
        amount: order.amount,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error creating order",
      });
    }
  } catch (error) {
    console.error("Error capturing payment:", error);
    return res.status(500).json({
      sucess: false,
      message: "Error capturing payment. Please try again later",
      error: error.message,
    });
  }
};

// Verify signature of Razorpay payment and Server
export const verifySignature = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).json({
        success: false,
        message: "Webhook secret is required",
      });
    }

    const signature = req.headers["x-razorpay-signature"];

    const hmac = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== hmac) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const { courseId, userId } = req.body.payload.payment.entity.notes;
    const course = await Course.findById(courseId);

    // course.sudentsEnrolled.push(userId);
    // await course.save();
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      {
        $push: { studentsEnrolled: userId },
      },
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrolledUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { courses: courseId },
      },
      { new: true }
    );

    if (!enrolledUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emailResponse = await mailSender({
      email: enrolledUser.email,
      title: "Course Enrollment Confirmation",
      body: courseEnrollmentEmail(enrolledUser.name, enrolledCourse.courseName),
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      emailResponse,
    });
  } catch (error) {
    console.error("Error verifying signature:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment signature. Please try again later",
      error: error.message,
    });
  }
};
