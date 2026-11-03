import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    shopId: {
      type: String,
      required: true,
      trim: true,
    },
    groomerId: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentId: {
      type: String,
      default: null,
    },
    leaveDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      default: "No reason provided",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Leave =
  mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);

export default Leave;
