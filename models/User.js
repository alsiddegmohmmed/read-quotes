// server/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String },
  image: { type: String },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);