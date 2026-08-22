import { Schema, model } from "mongoose";

// state: "open" | "closed" | "merged"
const pullRequestSchema = new Schema(
  {
    repo: { type: Schema.Types.ObjectId, ref: "Repo", required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    state: { type: String, enum: ["open", "closed", "merged"], default: "open" },
    headSha: { type: String, required: true },
  },
  { timestamps: true }
);

pullRequestSchema.index({ repo: 1, number: 1 }, { unique: true });
pullRequestSchema.index({ repo: 1, state: 1 });

export const PullRequest = model("PullRequest", pullRequestSchema);
