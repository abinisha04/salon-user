import mongoose from "mongoose";

// Shop Schema → Stores all information about each shop/salon
const ShopSchema = new mongoose.Schema(
  {
    // Shop basic details
    shopName: { type: String, required: true },
    shopEmail: { type: String, required: true, unique: true },
    shopOwnerName: { type: String, required: true },
    shopMobile: { type: String, required: true },
    shopLocation: { type: String, required: true },

    // Geo-coordinates
    latitude: { type: Number,  },
    longitude: { type: Number,  },

    // Shop profile image
    shopImage: { type: String, default: "" },

    // Opening Hours (array of objects per day)
    openingHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        open: { type: String, required: true }, // "09:00"
        close: { type: String, required: true }, // "22:00"
      },
    ],

    // Weekly Closing Days
    closingDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [],
    },

    status: {
      type: String,
      enum: ["active","inactive"], // Modified to only allow "active"
      default: "active",
    },

    //  JWT token for shop authentication
    token: {
      type: String,
      default: "", // Will be generated when shop is created
    },
      // 🔔 FCM token for push notifications
fcmToken: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true, // Auto-adds createdAt & updatedAt
  }
);

// Export model (avoid overwrite in Next.js dev)
export default mongoose.models.Shop || mongoose.model("Shop", ShopSchema);