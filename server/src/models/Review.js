import { Schema, model } from "mongoose";

// severity: "blocking" | "warning" | "style"
const suggestionSchema = new Schema(
  {
    filePath: { type: String, required: true },
    line: { type: Number, required: true },
    severity: { type: String, enum: ["blocking", "warning", "style"], required: true },
    message: { type: String, required: true },
    suggestedFix: { type: String },
  },
  { _id: false }
);

const feedbackSchema = new Schema(
  {
    suggestionIndex: { type: Number, required: true },
    reaction: { type: String, enum: ["helpful", "not_helpful"], required: true },
    byUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    pullRequest: { type: Schema.Types.ObjectId, ref: "PullRequest", required: true, index: true },
    suggestions: { type: [suggestionSchema], default: [] },
    feedback: { type: [feedbackSchema], default: [] },
  },
  { timestamps: true }
);

export const Review = model("Review", reviewSchema);
