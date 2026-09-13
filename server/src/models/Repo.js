import { Schema, model } from "mongoose";

const repoSchema = new Schema(
  {
    owner: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    repoUrl: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    language: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    installationId: { type: String, default: '' },
    defaultBranch: { type: String, default: "main" },
    aiSummary: { type: String, default: '' },
    aiExplanation: { type: Schema.Types.Mixed, default: null },
    qualityScore: { type: Schema.Types.Mixed, default: null },
    securityScan: { type: Schema.Types.Mixed, default: null },
    dependencies: { type: Schema.Types.Mixed, default: null },
    techStack: { type: [String], default: [] },
    lastAnalyzedAt: { type: Date }
  },
  { timestamps: true }
);

// A repo is unique per owner/name per user who added it.
repoSchema.index({ owner: 1, name: 1, addedBy: 1 }, { unique: true });

export const Repo = model("Repo", repoSchema);

