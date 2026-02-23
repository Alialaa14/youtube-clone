import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../utils/ENV.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String },
    },

    coverImage: {
      public_id: { type: String, default: "" },
      url: {
        type: String,
        default: "https://getuikit.com/v2/docs/images/placeholder_600x400.svg",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    channelDescription: {
      type: String,
      default: "",
    },
    channelTags: {
      type: [String],
      default: [],
    },
    socailLinks: {
      x: String,
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      webiste: String,
    },
    notifacationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      subscriptionActivity: {
        type: Boolean,
        default: true,
      },
      commentActivity: {
        type: Boolean,
        default: true,
      },
    },

    refreshPasswordToken: String,
    refreshPasswordTokenExpiry: Date,

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
  });
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
const User = model("User", userSchema);

export default User;
