import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

commentSchema.plugin(mongoosePaginate);

const Comment = model("Comment", commentSchema);
export default Comment;
