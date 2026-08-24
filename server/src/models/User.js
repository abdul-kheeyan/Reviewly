import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

// role: "owner" | "maintainer" | "contributor" | "reader"
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "" },
    role: {
      type: String,
      enum: ["owner", "maintainer", "contributor", "reader"],
      default: "contributor",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model("User", userSchema);
