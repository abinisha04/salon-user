// Import the Mongoose library for MongoDB interaction.
import mongoose from "mongoose";

// This async function handles the database connection logic.
const connectDB = async () => {
  try {
    // Check if the connection is already established (readyState is 1 for "connected").
    // In serverless environments like Next.js, this prevents creating multiple connections on every API call during development.
    if (mongoose.connection.readyState === 1) {
      // If already connected, reuse the existing connection.
      // `asPromise()` returns a promise that resolves to the connection object.
      return mongoose.connection.asPromise();
    }

    // Connect to the MongoDB database using the URI from environment variables.
    // Modern Mongoose versions handle options like `useNewUrlParser` internally, so they are no longer needed.
    await mongoose.connect(process.env.MONGODB_URI); 
    // console.log("MongoDB Connected ");
  } catch (error) {
    // Log any connection errors to the console.
    // console.error("MongoDB connection error :", error.message);
    // Rethrow the error to be handled by the calling function or higher-level error handling.
    // In Next.js, it's better to throw an error than to terminate the process (`process.exit(1)`).
    throw error;
  }
};

// Export the `connectDB` function for use in API routes or server-side components.
export default connectDB;
