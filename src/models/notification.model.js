import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    recipent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipent is required"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["SUBSCRIPTION", "LIKE", "COMMENT", "REPLY", "SHARE", "Video"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = model("Notification", subscriptionSchema);
export default Notification;
