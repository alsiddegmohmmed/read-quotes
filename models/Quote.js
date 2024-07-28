import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  bookTitle: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);