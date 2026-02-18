import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: [true, "User is required"],
    },
  },
  { timestamps: true },
);

// Ensure that a user can only like a specific video or comment once
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });

likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });

likeSchema.pre("save", function (next) {
  if (this.video && this.comment) {
    return next(
      new Error("A like cannot be associated with both a video and a comment"),
    );
  }

  if (!this.video && !this.comment) {
    return next(
      new Error("A like must be associated with either a video or a comment"),
    );
  }
  next();
});

const Like = model("Like", likeSchema);
export default Like;
