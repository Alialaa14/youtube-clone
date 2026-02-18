import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subsciber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Subscriber is required"],
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel is required"],
    },
  },
  { timestamps: true },
);

// To ensure that a user can only subscribe to a channel once
subscriptionSchema.index({ subsciber: 1, channel: 1 }, { unique: true });

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
