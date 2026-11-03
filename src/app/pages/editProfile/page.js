// // Before Optimize code

// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Drawer, message, Modal } from "antd";
// import LottieLoader from "@/app/utils/loading";
// import "@ant-design/v5-patch-for-react-19";

// export default function EditProfilePage() {
//   // ---------------- ROUTER ----------------
//   const router = useRouter();

//   // ---------------- ENV ----------------
//   // const authKey = process.env.AUTH_KEY;
//   //   const backendUrl = process.env.BACKEND_URL;

//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

//   // ---------------- AVATARS ----------------
//   const AVATARS = [
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_1.jpg?alt=media&token=2486fbc2-5409-448f-984e-2a18e32b6f7a",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_2.jpg?alt=media&token=d3d6502b-354d-4b40-bfd5-c75f5811451f",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_3.jpg?alt=media&token=861ec77e-d857-4087-960f-1d70fb06371f",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_4.jpg?alt=media&token=f663652e-7aff-4197-ba20-c720d97f9b0e",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_5.jpg?alt=media&token=39e74a26-959c-4f2e-a566-098028681d0a",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_6.jpg?alt=media&token=b05f0281-a421-49e3-a3e5-55a07aeb1992",
//   ];

//   // ---------------- VALIDATION ----------------
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   // ---------------- STATE ----------------
//   const [showAvatarSheet, setShowAvatarSheet] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [form, setForm] = useState({
//     userId: "",
//     profileImage: null,
//     name: "",
//     email: "",
//     phone: "",
//     age: "",
//     gender: "",
//   });

//   const [errors, setErrors] = useState({});

//   /* ---------------- LOAD USER DATA ---------------- */
//   useEffect(() => {
//     const userStr = localStorage.getItem("user");

//     if (!userStr) {
//       router.replace("/");
//       return;
//     }

//     const user = JSON.parse(userStr);

//     setForm({
//       userId: user._id,
//       profileImage: user.profileImage,
//       name: user.name || "",
//       email: user.email || "",
//       phone: user.phone || "",
//       age: String(user.age || ""),
//       gender: user.gender || "",
//     });
//   }, [router]);

//   /* ---------------- VALIDATION ---------------- */
//   const validateField = (key, value) => {
//     let error = "";

//     if (key === "name" && !value.trim()) error = "Full name is required";
//     if (key === "email" && !emailRegex.test(value))
//       error = "Enter a valid email address";
//     if (key === "phone" && value.length !== 10)
//       error = "Phone number must be 10 digits";

//     if (key === "age") {
//       const age = Number(value);
//       if (!age || age < 1 || age > 99) error = "Please enter the age";
//     }

//     if (key === "gender" && !value) error = "Please select gender";

//     setErrors((prev) => ({ ...prev, [key]: error }));
//   };

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//     validateField(key, value);
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!form.profileImage) newErrors.profileImage = "Profile image required";
//     if (!form.name.trim()) newErrors.name = "Full name is required";
//     if (!emailRegex.test(form.email)) newErrors.email = "Valid email required";
//     if (form.phone.length !== 10) newErrors.phone = "Phone must be 10 digits";

//     const age = Number(form.age);
//     if (!age || age < 1 || age > 99) newErrors.age = "Age must be 1 to 99";

//     if (!form.gender) newErrors.gender = "Select gender";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const isFormValid =
//     Object.values(errors).every((e) => !e) &&
//     form.profileImage &&
//     form.name &&
//     form.email &&
//     form.phone &&
//     form.age &&
//     form.gender;

//   /* ---------------- UPDATE PROFILE WITH CONFIRM ---------------- */
//   const handleUpdate = () => {
//     if (!validateForm()) return;

//     Modal.confirm({
//       title: "Update Profile?",
//       content: "Do you want to change your profile details?",
//       okText: "Yes, Update",
//       cancelText: "No",
//       centered: true,
//       maskClosable: true,
//       onOk: async () => {
//         try {
//           setIsSubmitting(true);

//           const payload = {
//             userId: form.userId,
//             shopId,
//             profileImage: form.profileImage,
//             name: form.name,
//             email: form.email,
//             phone: form.phone,
//             age: Number(form.age),
//             gender: form.gender,
//           };

//         const res = await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({ endpoint: "putUser", ...payload }),
// });

//           const result = await res.json();

//           if (!result || !result.user) {
//             message.error(result.error || "Update failed");
//             setIsSubmitting(false);
//             return;
//           }

//           message.success("Profile updated successfully ✅");
//           localStorage.setItem("user", JSON.stringify(result.user));
//           router.back();
//         } catch (err) {
//           console.error(err);
//           message.error("Something went wrong");
//           setIsSubmitting(false);
//         }
//       },
//     });
//   };

//   if (isSubmitting) return <LottieLoader />;

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="min-h-screen bg-white p-5 pb-28">
//       <h1 className="text-xl font-semibold mt-14 mb-6">Edit Profile</h1>

//       {/* Avatar Picker */}
//       <button
//         onClick={() => setShowAvatarSheet(true)}
//         className="w-full flex items-center gap-4 border border-gray-300 rounded-2xl p-4 mb-6"
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden">
//           {form.profileImage && (
//             <Image
//               src={form.profileImage}
//               alt="Profile"
//               fill
//               sizes="64px"
//               className="object-cover"
//             />
//           )}
//         </div>

//         <div className="text-left">
//           <p className="font-semibold">Profile Photo</p>
//           <p className="text-sm text-gray-400">Change your avatar</p>
//         </div>
//       </button>

//       {/* Fields */}
//       <div className="space-y-4">
//         <input
//           placeholder="Full Name"
//           value={form.name}
//           onChange={(e) => handleChange("name", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

//         <input
//           placeholder="Email Address"
//           value={form.email}
//           onChange={(e) => handleChange("email", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

//         <input
//           type="number"
//           placeholder="Phone Number"
//           value={form.phone}
//           onChange={(e) => {
//             const v = e.target.value.replace(/\D/g, "");
//             if (v.length <= 10) handleChange("phone", v);
//           }}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

//         <input
//           type="number"
//           placeholder="Age"
//           value={form.age}
//           onChange={(e) => {
//             const v = e.target.value.replace(/\D/g, "");
//             if (v.length <= 2) handleChange("age", v);
//           }}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

//         <select
//           value={form.gender}
//           onChange={(e) => handleChange("gender", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3 bg-white"
//         >
//           <option value="">Select Gender</option>
//           <option>Male</option>
//           <option>Female</option>
//           <option>Other</option>
//         </select>
//         {errors.gender && (
//           <p className="text-red-500 text-sm">{errors.gender}</p>
//         )}
//       </div>

//       {/* Save Button */}
//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
//         <button
//           disabled={!isFormValid}
//           onClick={handleUpdate}
//           className={`w-full py-3 rounded-lg font-semibold ${
//             isFormValid
//               ? "bg-black text-green-500"
//               : "bg-gray-300 text-gray-500"
//           }`}
//         >
//           Save Changes
//         </button>
//       </div>

//       {/* Avatar Drawer */}
//       <Drawer
//         open={showAvatarSheet}
//         onClose={() => setShowAvatarSheet(false)}
//         placement="bottom"
//         height={420}
//         title="Choose an Avatar"
//       >
//         <div className="grid grid-cols-4 gap-4">
//           {AVATARS.map((src) => (
//             <button
//               key={src}
//               onClick={() => {
//                 handleChange("profileImage", src);
//                 setShowAvatarSheet(false);
//               }}
//               className={`relative w-full aspect-square rounded-full overflow-hidden ${
//                 form.profileImage === src
//                   ? "ring-2 ring-green-500"
//                   : "hover:ring-2 ring-gray-300"
//               } transition`}
//             >
//               <Image src={src} alt="" fill sizes="64px" className="object-cover" />
//             </button>
//           ))}
//         </div>
//       </Drawer>
//     </div>
//   );
// }

// // Optimize code

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Drawer, message, Modal } from "antd";
import LottieLoader from "@/app/utils/loading";

// ✅ Module-level constants — not recreated on each render
const AVATARS = [
  "/profile/avatar8.jpg",
  "/profile/avatar6.jpg",
  "/profile/avatar7.jpg",
  "/profile/avatar2.jpg",
  "/profile/avatar5.jpg",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

const INITIAL_FORM = {
  userId: "",
  profileImage: null,
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
};

export default function EditProfilePage() {
  const router = useRouter();

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/");
      return;
    }
    const user = JSON.parse(userStr);
    setForm({
      userId: user._id,
      profileImage: user.profileImage,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      age: String(user.age || ""),
      gender: user.gender || "",
    });
  }, [router]);

  // ✅ Single validation fn used by both onChange and submit
  const validateField = useCallback((key, value) => {
    let error = "";
    if (key === "name" && !value.trim()) error = "Full name is required";
    if (key === "email" && !EMAIL_REGEX.test(value))
      error = "Enter a valid email address";
    if (key === "phone" && value.length !== 10)
      error = "Phone number must be 10 digits";
    if (key === "age") {
      const age = Number(value);
      if (!age || age < 1 || age > 99) error = "Please enter the age";
    }
    if (key === "gender" && !value) error = "Please select gender";
    return error;
  }, []);

  const handleChange = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      const error = validateField(key, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    },
    [validateField],
  );

  // ✅ validateForm reuses validateField — no duplicate logic
  const validateForm = useCallback(() => {
    const keys = ["name", "email", "phone", "age", "gender"];
    const newErrors = {};
    if (!form.profileImage) newErrors.profileImage = "Profile image required";
    keys.forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // ✅ useMemo — not recomputed unless errors or form changes
  const isFormValid = useMemo(
    () =>
      Object.values(errors).every((e) => !e) &&
      !!form.profileImage &&
      !!form.name &&
      !!form.email &&
      !!form.phone &&
      !!form.age &&
      !!form.gender,
    [errors, form],
  );

  const handleUpdate = useCallback(() => {
    if (!validateForm()) return;

    Modal.confirm({
      title: "Update Profile?",
      content: "Do you want to change your profile details?",
      okText: "Yes, Update",
      cancelText: "No",
      centered: true,
      mask: {
        closable: true,
      },
      onOk: async () => {
        try {
          setIsSubmitting(true);

          const res = await fetch("/api/proxy", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: "putUser",
              shopId: SHOP_ID,
              userId: form.userId,
              profileImage: form.profileImage,
              name: form.name,
              email: form.email,
              phone: form.phone,
              age: Number(form.age),
              gender: form.gender,
            }),
          });

          const result = await res.json();

          if (!result?.user) {
            message.error(result.error || "Update failed");
            setIsSubmitting(false);
            return;
          }

          localStorage.setItem("user", JSON.stringify(result.user));
          message.success("Profile updated successfully ✅");
          router.back();
        } catch (err) {
          // console.error(err);
          message.error("Something went wrong");
          setIsSubmitting(false);
        }
      },
    });
  }, [form, validateForm, router]);

  const handleAvatarSelect = useCallback(
    (src) => {
      handleChange("profileImage", src);
      setShowAvatarSheet(false);
    },
    [handleChange],
  );

  if (isSubmitting) return <LottieLoader />;

  return (
    <div className="min-h-screen bg-white p-5 pb-28">
      <h1 className="text-xl font-semibold mt-14 mb-6">Edit Profile</h1>

      {/* Avatar Picker */}
      <button
        onClick={() => setShowAvatarSheet(true)}
        className="w-full flex items-center gap-4 border border-gray-300 rounded-2xl p-4 mb-6"
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          {form.profileImage && (
            <Image
              src={form.profileImage}
              alt="Profile"
              fill
              sizes="64px"
              loading="eager"
              className="object-cover"
            />
          )}
        </div>
        <div className="text-left">
          <p className="font-semibold">Profile Photo</p>
          <p className="text-sm text-gray-400">Change your avatar</p>
        </div>
      </button>

      {errors.profileImage && (
        <p className="text-red-500 text-sm mb-4">{errors.profileImage}</p>
      )}

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* ✅ type="tel" + inputMode="numeric" — better mobile UX, no scroll-to-change issue */}
        <div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 10) handleChange("phone", v);
            }}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* ✅ type="text" + inputMode="numeric" — prevents scroll spinner on mobile */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Age"
            value={form.age}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 2) handleChange("age", v);
            }}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
          )}
        </div>

        <div>
          <select
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white appearance-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
        <button
          disabled={!isFormValid}
          onClick={handleUpdate}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            isFormValid
              ? "bg-black text-green-500"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Save Changes
        </button>
      </div>

      {/* Avatar Drawer */}
      {isMounted && (
        <Drawer
          open={showAvatarSheet}
          onClose={() => setShowAvatarSheet(false)}
          placement="bottom"
          size={420}
          title="Choose an Avatar"
        >
          <div className="grid grid-cols-4 gap-4">
            {AVATARS.map((src) => (
              <button
                key={src}
                onClick={() => handleAvatarSelect(src)}
                className={`relative w-full aspect-square rounded-full overflow-hidden transition ${
                  form.profileImage === src
                    ? "ring-2 ring-green-500"
                    : "hover:ring-2 ring-gray-300"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  );
}
