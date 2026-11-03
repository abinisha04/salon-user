import mongoose from "mongoose";

const GroomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    serviceList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    age: {
      type: Number,
      min: 0,
      required: false,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    department: {
      type: String,
      trim: true,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },

    // ✅ Added status field
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique phone per shop
GroomerSchema.index({ phone: 1, shopId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Groomer ||
  mongoose.model("Groomer", GroomerSchema);
