 import { NextResponse } from "next/server"; // Import Next.js response helper

// Function to check API key from request headers
export function checkAuthKey(request) {
  const serverKey = process.env.AUTH_KEY;   // Get the server's API key from environment variables (.env.local)
  const clientKey = request.headers.get("x-auth-key"); // Get the API key sent by the client in the request header

  // If the server key is missing, return a 500 error (server misconfiguration)
  // Removed: if (!serverKey) { ... }

  // If the client key is missing or does not match the server key, return a 401 Unauthorized error
  if (!clientKey || clientKey !== serverKey) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid AUTH_KEY" },
      { status: 401 }
    );
  }

  // If the key is valid, return null to allow the request to continue
  return null; // ✅ valid, continue
} // checkAuthKey