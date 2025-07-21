import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    descripyion:{
        type:String,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
});

export default mongoose.model("Category",categorySchema);