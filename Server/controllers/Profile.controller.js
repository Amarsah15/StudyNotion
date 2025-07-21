import Profile from "../models/Profile.js";
import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    const userId = req.user.id;

    if (!userId || !contactNumber || !gender) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userDetails = await Profile.findOne({ user: userId });
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;

    const profile = await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in updating profile",
      error: error.message,
    });
  }
};

// Delete Profile
export const deleteProfileAndUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete the user's profile
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    // Unenroll user from sudentsEnrolled course
    await User.updateMany({}, { $pull: { sudentsEnrolled: userId } });

    // HW -> Delete user after certains days like 5 days
    // Note: This is a placeholder for the actual logic to delete the user after a certain period.
    // In a real application, you might want to use a job scheduler or a background task to handle this.
    // For now, we will delete the user immediately.
    // You can implement a delay mechanism if needed.
    // cron job can be used for delayed deletion of user after a certain period of time in background.

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in deleting profile",
      error: error.message,
    });
  }
};

// Get all user details
export const getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in fetching user details",
      error: error.message,
    });
  }
};
