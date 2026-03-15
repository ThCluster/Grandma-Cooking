import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const resetSchema = new mongoose.Schema({
    username: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number, // ou Date
});

// Utilisation correcte du plugin en ES Module
resetSchema.plugin(passportLocalMongoose.default);

export default mongoose.model("Reset", resetSchema);
