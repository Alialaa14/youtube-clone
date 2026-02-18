import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Playlist = model("Playlist", playlistSchema);

export default Playlist;
