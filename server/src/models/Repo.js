import { Schema, model } from "mongoose";

const repoSchema = new Schema(
  {
    owner: { type: String, required: true },
    name: { type: String, required: true },
    installationId: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
  },
  { timestamps: true }
);

// A repo is unique per owner/name pair.
repoSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Repo = model("Repo", repoSchema);
