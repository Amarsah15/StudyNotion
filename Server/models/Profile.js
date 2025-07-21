import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
    },
    dateOfBirth:{
        type:String,
    },
    about : {
        type:String,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true,
    }
});

export default mongoose.model("Profile",profileSchema);