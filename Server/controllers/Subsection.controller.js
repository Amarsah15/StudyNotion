import SubSection from "../models/SubSection.js";
import Section from "../models/Section.js";
import { imageUploader } from "../utils/imageUploader.js";

//create subsection
export const createSubSection = async (req, res) => {
  try {
    const { title, timeDuration, description, sectionId } = req.body;
    const { video } = req.files.videoFile;

    // Validate input
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!video) {
      return res.status(400).json({ message: "Video URL is required" });
    }

    // Upload video to Cloudinary
    const uploadResponse = await imageUploader(
      video,
      process.env.CLOUDINARY_FOLDER_NAME
    );

    // Check if upload was successful
    if (!uploadResponse || !uploadResponse.secure_url) {
      return res.status(500).json({ message: "Video upload failed" });
    }

    const newSubSection = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadResponse.secure_url,
    });

    // Find the section and update it with the new subsection

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: newSubSection._id } },
      { new: true } // Return the updated section
    );

    // Populate the updated section to include the new subsection details
    const populatedSection = await Section.findById(updatedSection._id)
      .populate("subSection")
      .exec();

    res.status(201).json({
      success: true,
      message: "Subsection created successfully",
      populatedSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating subsection",
      error: error.message,
    });
  }
};

// Update subsection details
export const updateSubSection = async (req, res) => {
  try {
    const { subsectionId, title, timeDuration, description } = req.body;

    //Update video if provided
    const { video } = req.files.videoFile;

    if (video) {
      // Upload new video to Cloudinary
      const uploadResponse = await imageUploader(
        video,
        process.env.CLOUDINARY_FOLDER_NAME
      );

      // Check if upload was successful
      if (!uploadResponse || !uploadResponse.secure_url) {
        return res.status(500).json({ message: "Video upload failed" });
      }

      const updatedSubSection = await SubSection.findByIdAndUpdate(
        subsectionId,
        {
          title,
          timeDuration,
          description,
          videoUrl: uploadResponse.secure_url,
        },
        { new: true } // Return the updated subsection
      );

      if (!updatedSubSection) {
        return res.status(404).json({ message: "Subsection not found" });
      }

      res.status(200).json({
        success: true,
        message: "Subsection updated successfully",
        updatedSubSection,
      });
    }
    // If no video is provided, update without changing the video URL
    else {
      // Validate input
      if (!subsectionId || !title || !timeDuration || !description) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const updatedSubSection = await SubSection.findByIdAndUpdate(
        subsectionId,
        { title, timeDuration, description },
        { new: true } // Return the updated subsection
      );

      if (!updatedSubSection) {
        return res.status(404).json({ message: "Subsection not found" });
      }

      res.status(200).json({
        success: true,
        message: "Subsection updated successfully",
        updatedSubSection,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating subsection",
      error: error.message,
    });
  }
};

// Deleting a subsection
export const deleteSubSection = async (req, res) => {
  try {
    const { subsectionId, sectionId } = req.body;

    // Validate input
    if (!subsectionId || !sectionId) {
      return res
        .status(400)
        .json({ message: "Subsection ID and Section ID are required" });
    }

    // Find the subsection and delete it
    const deletedSubSection = await SubSection.findByIdAndDelete(subsectionId);

    if (!deletedSubSection) {
      return res.status(404).json({ message: "Subsection not found" });
    }

    // Remove the subsection reference from the section
    await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subsectionId } },
      { new: true } // Return the updated section
    );

    res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
      deletedSubSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting subsection",
      error: error.message,
    });
  }
};
