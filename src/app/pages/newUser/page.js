// // Before Optimize code

// "use client";
// // 👆 Marks this file as a Client Component so hooks, browser APIs,
// // localStorage/sessionStorage can be used

// import { useEffect, useState, useMemo } from "react";
// // 👆 React hooks:
// // useState → manage state
// // useEffect → lifecycle (fetch data on load)
// // useMemo → optimize filtering logic

// import Image from "next/image";
// // 👆 Optimized image component from Next.js

// import Link from "next/link";
// // 👆 For navigation links (not heavily used here but kept for consistency)

// import "@ant-design/v5-patch-for-react-19";
// // 👆 Ant Design compatibility patch for React 19

// import { message } from "antd";
// // 👆 Ant Design toast messages for warnings

// import { useRouter } from "next/navigation";
// // 👆 Next.js router for page navigation

// import AppLoading from "@/app/utils/loading";
// // 👆 Custom loading animation component

// export default function Newuser() {
//   // ---------------- ROUTER ----------------
//   const router = useRouter();
//   // 👆 Used to navigate to next step (timeslot page)

//   // ---------------- STATE ----------------
//   const [services, setServices] = useState([]);
//   // 👆 All services fetched from backend

//   const [selectedServices, setSelectedServices] = useState([]);
//   // 👆 IDs of services selected by user

//   const [groomers, setGroomers] = useState([]);
//   // 👆 All groomers fetched from backend

//   const [selectedGroomer, setSelectedGroomer] = useState(null);
//   // 👆 Currently selected groomer ID

//   const [isLoading, setIsLoading] = useState(true);
//   // 👆 Loading state while fetching services & groomers

//   const [searchQuery, setSearchQuery] = useState("");
//   // 👆 Search text for filtering services

//   // ---------------- ENV VARIABLES ----------------
//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;
//   // 👆 Current shop ID

//   // const backendUrl = process.env.BACKEND_URL;
//   // 👆 Backend API base URL

//   // const authKey = process.env.AUTH_KEY;
//   // 👆 Auth key for secured APIs

//   /* ---------------- HELPER FUNCTIONS ---------------- */

//   // Extract service IDs from groomer.serviceList
//   // (handles both string IDs and populated objects)
//   const extractServiceIds = (serviceList = []) =>
//     serviceList
//       .map((s) => (typeof s === "string" ? s : s?._id))
//       .filter(Boolean);

//   /* ---------------- FETCH SERVICES & GROOMERS ---------------- */
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch services and groomers in parallel
//        const [servicesRes, groomersRes] = await Promise.all([
//   fetch(`/api/proxy?endpoint=getService&shopId=${shopId}&status=active`),
//   fetch(`/api/proxy?endpoint=getGroomer&shopId=${shopId}`),
// ]);

//         const servicesData = await servicesRes.json();
//         const groomersData = await groomersRes.json();

//         // Store data if API call is successful
//         if (servicesData.success) setServices(servicesData.data || []);
//         if (groomersData.success) setGroomers(groomersData.groomers || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//         // 👆 Stop loading once API calls finish
//       }
//     };

//     fetchInitialData();
//   }, [shopId]);

//   /* ---------------- FILTER SERVICES BY SEARCH ---------------- */
//   const filteredServices = useMemo(() => {
//     // If search query exists, filter services by name
//     return searchQuery
//       ? services.filter((s) =>
//           s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       : services;
//   }, [services, searchQuery]);

//   /* ---------------- FILTER GROOMERS BY SELECTED SERVICES ---------------- */
//   const availableGroomers = useMemo(() => {
//     // If no services selected, show all groomers
//     if (!selectedServices.length) return groomers;

//     // Show only groomers who provide ALL selected services
//     return groomers.filter((groomer) => {
//       const groomerServiceIds = extractServiceIds(groomer.serviceList);
//       return selectedServices.every((sid) =>
//         groomerServiceIds.includes(sid)
//       );
//     });
//   }, [selectedServices, groomers]);

//   /* ---------------- USER ACTIONS ---------------- */

//   // Toggle service selection
//   const toggleService = (serviceId) => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId) // unselect
//         : [...prev, serviceId]                  // select
//     );

//     // Reset groomer selection if services change
//     setSelectedGroomer(null);
//   };

//   // Select a groomer
//   const selectGroomer = (groomerId) => {
//     // Prevent groomer selection without services
//     if (!selectedServices.length) {
//       message.warning("Please select at least one service first");
//       return;
//     }
//     setSelectedGroomer(groomerId);
//   };

//   // Continue to next step (timeslot selection)
//   const handleContinue = () => {
//     if (!selectedGroomer || !selectedServices.length) return;

//     // Find selected groomer object
//     const groomer = groomers.find((g) => g._id === selectedGroomer);

//     // Get selected service objects
//     const servicesData = services.filter((s) =>
//       selectedServices.includes(s._id)
//     );

//     // Store booking data temporarily for next page
//     sessionStorage.setItem(
//       "bookingData",
//       JSON.stringify({ groomer, services: servicesData })
//     );

//     // Navigate to timeslot page
//     router.push("/pages/timeslot");
//   };

//   /* ---------------- LOADING STATE ---------------- */
//   if (isLoading) return <AppLoading />;
//   // 👆 Show loader while fetching data

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="bg-white min-h-screen">
//       {/* SERVICES */}
//       <h1 className="text-2xl font-semibold pl-4 pt-8 text-black">
//         Our Services
//       </h1>

//       <div className="px-4 pt-4">
//         <input
//           placeholder="Search services..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg"
//         />
//       </div>

//       <div className="p-4 grid grid-cols-4 gap-4">
//         {filteredServices.map((service) => {
//           const isSelected = selectedServices.includes(service._id);
//           return (
//             <div
//               key={service._id}
//               onClick={() => toggleService(service._id)}
//               className="flex flex-col items-center cursor-pointer"
//             >
//                     <div
//                 className={`w-[80px] h-[80px] rounded-full flex justify-center items-center overflow-hidden border-[1px] border-gray-300 mb-3 relative`}
//               >
//                 <Image
//                   src={service.serviceImage}
//                   alt={service.serviceName}
//                   height={40}
//                   width={40}
//                   className="object-cover"
//                 />
//                 {isSelected && (
//                   <div className="absolute inset-0 bg-green-500/50 rounded-full pointer-events-none"></div>
//                 )}
//               </div>
//               <h3 className="text-center text-black font-semibold">
//                 {service.serviceName}
//               </h3>
//               <p className="text-center text-gray-500 mt-1">
//                 ₹{service.displayPrice}
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* GROOMERS */}
//       <h1 className="text-2xl font-semibold pl-4 pt-4 text-black">
//         Select Stylist
//       </h1>

//       <div className="p-4 flex flex-col gap-4 pb-[100px]">
//         {availableGroomers.length > 0 ? (
//           availableGroomers.map((groomer) => {
//             const groomerServices = extractServiceIds(
//               groomer.serviceList
//             )
//               .map((sid) => services.find((s) => s._id === sid)?.serviceName)
//               .filter(Boolean);

//             const isSelected = selectedGroomer === groomer._id;

//             return (
//               <div
//                 key={groomer._id}
//                 onClick={() => selectGroomer(groomer._id)}
//                 className={`p-4 border border-gray-300 rounded-xl cursor-pointer ${
//                   isSelected ? "bg-green-500/40" : ""
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <div className="w-16 h-16 rounded-full overflow-hidden">
//                     <Image
//                       src={groomer.profileImage}
//                       alt={groomer.name}
//                       width={64}
//                       height={64}
//                       className="object-cover"
//                     />
//                   </div>

//                   <div className="ml-4 flex-1">
//                     <p className="font-semibold text-black">{groomer.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {groomerServices.join(", ")}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <p className="text-center text-gray-500">
//             No groomers available
//           </p>
//         )}
//       </div>

//       {/* CONTINUE */}
//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
//         <button
//           onClick={handleContinue}
//           disabled={!selectedServices.length || !selectedGroomer}
//           className={`w-full p-3 rounded-lg font-semibold ${
//             selectedServices.length && selectedGroomer
//               ? "bg-black text-green-500"
//               : "bg-gray-400 text-gray-200"
//           }`}
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }

// // Optimize code

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { message } from "antd";
import { useRouter, usePathname } from "next/navigation";
import AppLoading from "@/app/utils/loading";

// ✅ Stable env read at module level
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// ✅ Extracted helper — handles both string IDs and populated objects
const extractServiceIds = (serviceList = []) =>
  serviceList.map((s) => (typeof s === "string" ? s : s?._id)).filter(Boolean);

export default function Newuser() {
  const router = useRouter();
  const pathname = usePathname();

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [selectedGroomer, setSelectedGroomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pathname === "/pages/newUser") {
      setSelectedServices([]);
      setSelectedGroomer(null);
      setSearchQuery("");
    }
  }, [pathname]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesRes, groomersRes] = await Promise.all([
          fetch(
            `/api/proxy?endpoint=getService&shopId=${SHOP_ID}&status=active`,
          ),
          fetch(`/api/proxy?endpoint=getGroomer&shopId=${SHOP_ID}`),
        ]);

        // ✅ Parse both in parallel
        const [servicesData, groomersData] = await Promise.all([
          servicesRes.json(),
          groomersRes.json(),
        ]);

        if (servicesData.success) setServices(servicesData.data || []);
        if (groomersData.success) setGroomers(groomersData.groomers || []);
      } catch (err) {
        // console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []); // ✅ SHOP_ID is stable — no need in dep array

  useEffect(() => {
    const prefetchShopData = async () => {
      try {
        const [shopRes, leaveRes] = await Promise.all([
          fetch(`/api/proxy?endpoint=getShop&shopId=${SHOP_ID}`),
          fetch(`/api/proxy?endpoint=getLeave&shopId=${SHOP_ID}`),
        ]);

        const [shopJson, leaveJson] = await Promise.all([
          shopRes.json(),
          leaveRes.json(),
        ]);

        if (shopJson.success) {
          sessionStorage.setItem(
            "prefetchedShop",
            JSON.stringify(shopJson.shops?.[0] || null),
          );
        }

        if (leaveJson.success) {
          sessionStorage.setItem(
            "prefetchedLeaves",
            JSON.stringify(leaveJson.leaves || []),
          );
        }
      } catch (error) {
        console.error("Shop prefetch error:", error);
      }
    };

    prefetchShopData();
  }, []);

  const filteredServices = useMemo(
    () =>
      searchQuery
        ? services.filter((s) =>
            s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : services,
    [services, searchQuery],
  );

  const availableGroomers = useMemo(() => {
    if (!selectedServices.length) return groomers;
    return groomers.filter((groomer) => {
      const ids = extractServiceIds(groomer.serviceList);
      return selectedServices.every((sid) => ids.includes(sid));
    });
  }, [selectedServices, groomers]);

  // ✅ useCallback — stable reference, not recreated each render
  const toggleService = useCallback((serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
    setSelectedGroomer(null);
  }, []);

  const selectGroomer = useCallback(
    (groomerId) => {
      if (!selectedServices.length) {
        message.warning("Please select at least one service first");
        return;
      }
      setSelectedGroomer(groomerId);
    },
    [selectedServices.length],
  );

  const handleContinue = useCallback(() => {
    if (!selectedGroomer || !selectedServices.length) return;

    const groomer = groomers.find((g) => g._id === selectedGroomer);
    const servicesData = services.filter((s) =>
      selectedServices.includes(s._id),
    );

    sessionStorage.removeItem("rescheduleBooking");
    sessionStorage.removeItem("bookingSummary");

    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        groomer,
        services: servicesData,
      }),
    );

    router.push("/pages/timeslot");
  }, [selectedGroomer, selectedServices, groomers, services, router]);
  if (isLoading) return <AppLoading />;

  const canContinue = selectedServices.length > 0 && !!selectedGroomer;

  return (
    <div className="bg-white min-h-screen">
      <h1 className="text-2xl font-semibold pl-4 pt-8 text-black">
        Our Services
      </h1>

      <div className="px-4 pt-4">
        <input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="p-4 grid grid-cols-4 gap-4">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service._id);
          return (
            <div
              key={service._id}
              onClick={() => toggleService(service._id)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-[80px] h-[80px] rounded-full flex justify-center items-center overflow-hidden border border-gray-300 mb-3 relative">
                <Image
                  src={service.serviceImage}
                  alt={service.serviceName}
                  height={40}
                  width={40}
                  className="object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-green-500/50 rounded-full pointer-events-none" />
                )}
              </div>
              <h3 className="text-center text-black font-semibold text-sm">
                {service.serviceName}
              </h3>
              <p className="text-center text-gray-500 mt-1 text-sm">
                ₹{service.displayPrice}
              </p>
            </div>
          );
        })}
      </div>

      <h1 className="text-2xl font-semibold pl-4 pt-4 text-black">
        Select Stylist
      </h1>

      <div className="p-4 flex flex-col gap-4 pb-[100px]">
        {availableGroomers.length > 0 ? (
          availableGroomers.map((groomer) => {
            // ✅ Compute groomer service names once per groomer render
            const groomerServiceNames = extractServiceIds(groomer.serviceList)
              .map((sid) => services.find((s) => s._id === sid)?.serviceName)
              .filter(Boolean)
              .join(", ");

            const isSelected = selectedGroomer === groomer._id;

            return (
              <div
                key={groomer._id}
                onClick={() => selectGroomer(groomer._id)}
                className={`p-4 border border-gray-300 rounded-xl cursor-pointer transition ${
                  isSelected ? "bg-green-500/40" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={groomer.profileImage}
                      alt={groomer.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-semibold text-black">{groomer.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {groomerServiceNames}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No groomers available</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full p-3 rounded-lg font-semibold transition ${
            canContinue
              ? "bg-black text-green-500"
              : "bg-gray-400 text-gray-200"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
