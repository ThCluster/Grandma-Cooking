import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: String,
  bestDish: String,
  user: String,
  quantite: Number,
  receipe: String,
  date: {
    type: Date,
    default: Date.now(), // la date actu par défaut
  },
});

export default mongoose.model("Ingredient", ingredientSchema);
