import Section from "../models/Section.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

export const createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    // Check if course exists
    if (!courseId || !sectionName) {
      return res
        .status(400)
        .json({ message: "Course ID and section name are required" });
    }

    const newSection = await Section.create({ sectionName });

    const updatingCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { sections: newSection._id },
      },
      { new: true } // Return the updated course
    );
    //populate to update the section details in the course and subsections details
    const updatedCourse = await Course.findById(updatingCourseDetails._id)
      .populate("sections")
      .populate("sections.subSection")
      .exec();

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
      updatingCourseDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        sucess: false,
        message: "Error creating section",
        error: error.message,
      });
  }
};

//Updating section details
export const updateSection = async (req, res) => {
  try {
    const { sectionId, sectionName } = req.body;

    // Check if sectionId and sectionName are provided
    if (!sectionId || !sectionName) {
      return res
        .status(400)
        .json({ message: "Section ID and name are required" });
    }

    // Find the section by ID and update it
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true } // Return the updated section
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updatedSection,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating section",
        error: error.message,
      });
  }
};


// Deleting a section
export const deleteSection = async (req, res) => {
  try {
    // Ensure sectionId is provided in the params
    const { sectionId } = req.params;
    const deletedSection = await Section.findByIdAndDelete(sectionId);
    if (!deletedSection) {
      return res.status(404).json({ message: "Section not found" });
    }
    // TODO : Remove the section from the course's sections array
    // Remove the section from the course's sections array  
    // await Course.updateMany(
    //   { sections: sectionId },
    //   { $pull: { sections: sectionId } }
    // );

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      deletedSection,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting section", error });
  }
};