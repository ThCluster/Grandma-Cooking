import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  image: String,
  titre: String,
  description: String,
  user: String,
  date: {
    type: Date,
    default: Date.now(), // la date actu par défaut
  },
});

export default mongoose.model("Favorite", favoriteSchema);
