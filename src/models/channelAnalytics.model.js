import { Schema, model } from "mongoose";
const channelAnalyticsSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Channel is required"],
  },
  totalViews: {
    type: Number,
    default: 0,
  },

  totalSubscribers: {
    type: Number,
    default: 0,
  },
  totalVideos: {
    type: Number,
    default: 0,
  },
  totalLikes: {
    type: Number,
    default: 0,
  },
  totalDislikes: {
    type: Number,
    default: 0,
  },
  totalComments: {
    type: Number,
    default: 0,
  },
  dailyStats: [
    {
      data: { type: Date, required: [true, "Date is required"] },
      views: { type: Number, default: 0 },
      subscribersGained: { type: Number, default: 0 },
      subscribersLost: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  ],
});

//
channelAnalyticsSchema.index({ channel: 1 });
const ChannelAnalytics = model("ChannelAnalytics", channelAnalyticsSchema);
export default ChannelAnalytics;
