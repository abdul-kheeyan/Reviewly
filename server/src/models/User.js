import { Schema, model } from "mongoose";

// role: "owner" | "maintainer" | "contributor" | "reader"
const userSchema = new Schema(
  {
    githubId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    role: {
      type: String,
      enum: ["owner", "maintainer", "contributor", "reader"],
      default: "contributor",
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
