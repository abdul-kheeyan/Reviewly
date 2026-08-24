import { Schema, model } from 'mongoose';

const bugReportSchema = new Schema(
  {
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true, index: true },
    bugs: [
      {
        filePath: { type: String, required: true },
        line: { type: Number },
        severity: { type: String, enum: ['critical', 'warning', 'info'], required: true },
        type: { type: String, enum: ['bug', 'vulnerability', 'code-smell', 'performance'], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        suggestedFix: { type: String }
      }
    ],
    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String }
  },
  { timestamps: true }
);

export const BugReport = model('BugReport', bugReportSchema);
