import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  timeDuration: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
});

export default mongoose.model("SubSection", subSectionSchema);
