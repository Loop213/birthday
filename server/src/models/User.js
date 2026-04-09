import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    }
  },
  {
    timestamps: true
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

const User = mongoose.model("User", userSchema);

export default User;
