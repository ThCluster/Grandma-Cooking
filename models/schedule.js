import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  ReceipeName: String,
  schedule: {type : Date},
  user: String,
  time : String,
  date: {
    type: Date,
    default: Date.now(), 
  },
});

export default mongoose.model("Schedule", scheduleSchema);
