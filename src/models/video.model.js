import { Schema, model } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [40, "Title must be less than 40 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minLength: [3, "Description must be at least 3 characters"],
      maxLength: [500, "Description must be less than 500 characters"],
    },
    video: {
      public_id: {
        type: String,
        required: [true, "Public ID is required"],
      },
      url: {
        type: String,
        required: [true, "URL is required"],
      },
    },
    thumbnail: {
      public_id: {
        type: String,
        required: [true, "Public ID is required"],
      },
      url: {
        type: String,
        required: [true, "URL is required"],
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minLength: [3, "Category must be at least 3 characters"],
      maxLength: [20, "Category must be less than 20 characters"],
    },
    tags: [
      {
        type: String,
        required: [true, "Tag is required"],
      },
    ],

    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    disLikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    shares: {
      type: Number,
      default: 0,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

videoSchema.plugin(aggregatePaginate);
videoSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});
const Video = model("Video", videoSchema);
export default Video;
