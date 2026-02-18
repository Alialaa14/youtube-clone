import { Schema, model } from "mongoose";

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
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    avatar: {
      public_id: String,
      url: String,
    },

    coverImage: {
      public_id: String,
      url: String,
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
    refreshPasswordTokenExpiry: String,

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
