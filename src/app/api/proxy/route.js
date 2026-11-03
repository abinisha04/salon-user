// // src/app/api/proxy/route.js
// // ✅ This runs on the SERVER — AUTH_KEY is safe here

// import { NextResponse } from "next/server";

// export async function GET(request) {
//   // ✅ Read env vars INSIDE the function — always works
//   const AUTH_KEY = process.env.AUTH_KEY;
//   const BACKEND_URL = process.env.BACKEND_URL;

//   // 🔍 Debug logs — check your terminal
//   console.log("AUTH_KEY:", AUTH_KEY);
//   console.log("BACKEND_URL:", BACKEND_URL);

//   const { searchParams } = new URL(request.url);
//   const endpoint = searchParams.get("endpoint");
//   searchParams.delete("endpoint");

//   const queryString = searchParams.toString();
//   const url = `${BACKEND_URL}/api/${endpoint}${queryString ? `?${queryString}` : ""}`;

//   console.log("Fetching:", url);

//   try {
//     const res = await fetch(url, {
//       headers: { "x-auth-key": AUTH_KEY },
//     });

//     console.log("Backend status:", res.status);

//     const data = await res.json();
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("Proxy GET error:", err.message);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   // ✅ Read env vars INSIDE the function
//   const AUTH_KEY = process.env.AUTH_KEY;
//   const BACKEND_URL = process.env.BACKEND_URL;

//   const body = await request.json();
//   const { endpoint, ...payload } = body;

//   const url = `${BACKEND_URL}/api/${endpoint}`;

//   console.log("POST Fetching:", url);

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-auth-key": AUTH_KEY,
//       },
//       body: JSON.stringify(payload),
//     });

//     console.log("Backend status:", res.status);

//     const data = await res.json();
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("Proxy POST error:", err.message);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// export async function PUT(request) {
//   // ✅ Read env vars INSIDE the function
//   const AUTH_KEY = process.env.AUTH_KEY;
//   const BACKEND_URL = process.env.BACKEND_URL;

//   const body = await request.json();
//   const { endpoint, ...payload } = body;

//   const url = `${BACKEND_URL}/api/${endpoint}`;

//   console.log("PUT Fetching:", url);

//   try {
//     const res = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "x-auth-key": AUTH_KEY,
//       },
//       body: JSON.stringify(payload),
//     });

//     console.log("Backend status:", res.status);

//     const data = await res.json();
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("Proxy PUT error:", err.message);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }






// src/app/api/proxy/route.js
// ✅ Runs on SERVER — AUTH_KEY is never exposed to browser

import { NextResponse } from "next/server";

// ✅ User app-ku allowed endpoints மட்டும்
// User-கிட்ட delete permission இல்லை — shop மட்டும் delete பண்ணலாம்
const ALLOWED_ENDPOINTS = [
  "getAppointment",
  "postAppointment",
  "putAppointment",
  "getShop",
  "postUser",
  "putUser",
  "getUser",
  "getGroomer",
  "getService",
  "getLeave",
  "getRating",
  "postRating",
  "getShopFeedback",
  "putRating",
  "sendOtp",
  "verifyOtop"
];

// ✅ Reusable endpoint validator
function validateEndpoint(endpoint) {
  if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
    return NextResponse.json(
      { success: false, error: "Invalid endpoint" },
      { status: 400 }
    );
  }
  return null;
}

// ✅ GET
export async function GET(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  searchParams.delete("endpoint");
  const queryString = searchParams.toString();
  const url = new URL(
    `/api/${endpoint}${queryString ? `?${queryString}` : ""}`,
    request.url,
  );

  try {
    const res = await fetch(url, {
      headers: { "x-auth-key": AUTH_KEY },
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    // console.error("Proxy GET error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        // ✅ Development-la மட்டும் details காட்டும்
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 }
    );
  }
}

// ✅ POST
export async function POST(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const body = await request.json();
  const { endpoint, ...payload } = body;

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  const url = new URL(`/api/${endpoint}`, request.url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-key": AUTH_KEY,
      },
      body: JSON.stringify(payload),
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    // console.error("Proxy POST error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 }
    );
  }
}

// ✅ PUT
export async function PUT(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const body = await request.json();
  const { endpoint, ...payload } = body;

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  const url = new URL(`/api/${endpoint}`, request.url);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-key": AUTH_KEY,
      },
      body: JSON.stringify(payload),
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    // console.error("Proxy PUT error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 }
    );
  }
}







