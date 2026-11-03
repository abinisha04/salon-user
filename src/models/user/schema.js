import mongoose from "mongoose";

// ✅ Define the User schema
const UserSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true, // Name is mandatory
      trim: true, // Remove leading/trailing spaces automatically
    },

    // User's email
    email: {
      type: String,
      required: true, // Email is mandatory
      lowercase: true, // Store email in lowercase
      trim: true, // Remove accidental spaces
    },

    // User's phone number
    phone: {
      type: String,
      required: true, // Phone is mandatory
      trim: true, // Remove spaces
    },

    // User's age
    age: {
      type: Number,
      required: true, // Age is mandatory
    },

    // Gender field with allowed enum values
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"],
      required: true,
    },

    // Optional profile image URL or path
    profileImage: {
      type: String,
      default: "", // Defaults to empty string if not provided
    },

    // Reference to the shop this user belongs to

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      trim: true,
    },

    // ✅ JWT token for the user
    token: {
      type: String,
      default: "", // Empty string by default
    },
      // 🔔 FCM token for push notifications
fcmToken: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  }
);

// Avoid model overwrite errors in Next.js hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
