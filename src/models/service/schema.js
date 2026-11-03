// src/app/models/service/schema.js
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    serviceImage: {
      type: String,
      required: true,
    },

    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    displayPrice: {
      type: Number,
      min: 0,
    },

    offerPrice: {
      type: Number,
      min: 0,
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    duration: {
      type: Number,
    },

    // ✅ Status field
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload
export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
