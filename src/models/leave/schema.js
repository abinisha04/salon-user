// src/app/models/leave/schema.js
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    isShop: {
      type: Boolean,
      required: true,
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    groomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Groomer",
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "No reason provided",
    },
  },
  { timestamps: true }
);

// ✅ Validation rules
leaveSchema.pre("validate", function (next) {
  if (this.isShop && this.groomerId) {
    return next(new Error("groomerId must be null for shop leave"));
  }

  if (!this.isShop && !this.groomerId) {
    return next(new Error("groomerId is required for groomer leave"));
  }

  if (this.endDate < this.startDate) {
    return next(new Error("endDate cannot be before startDate"));
  }

  next();
});

const Leave =
  mongoose.models.Leave || mongoose.model("Leave", leaveSchema);

export default Leave;
