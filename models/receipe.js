import mongoose from "mongoose";

const receipeSchema = new mongoose.Schema({
    name: String,
    image: String,
    user: String
});


export default mongoose.model("Receipe", receipeSchema);
