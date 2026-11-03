import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewType: {
      type: String,
      enum: ["shop", "groomer"],
      required: true,
      default: "shop",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },

    feedback: {
      type: String,
      trim: true,
      default: "No feedback provided",
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One shop review per user per shop
feedbackSchema.index(
  { shopId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: "shop" },
  }
);

const Feedback =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);

export default Feedback;