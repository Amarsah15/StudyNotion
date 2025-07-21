import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        userNewUrlPArserr : true,
        useUnifiedTopology:true,
    })
    .then( () => console.log("DB Connected"))
    .catch( (error) => {
        console.log("CD connection failed");
        console.error(error);
        process.exit(1);
    })
};