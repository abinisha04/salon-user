"use client";

import { useState } from "react";
import { message } from "antd";
import { poppins } from "@/app/fonts/poppins";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    number: "",
    messageText: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Allow only digits for mobile number field
    if (name === "number") {
      if (!/^\d*$/.test(value)) return; // stops any non-numeric input
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (
        !formData.fullname.trim() ||
        !formData.email.trim() ||
        !formData.number.trim() ||
        !formData.messageText.trim()
      ) {
        message.error(" Please fill all the fields!");
        return;
      }

      const nameRegex = /^[A-Za-z\s]{3,}$/;
      if (!nameRegex.test(formData.fullname)) {
        message.error("❌ Please enter a valid full name (min 3 letters).");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        message.error(" Please enter a valid email address!");
        return;
      }

      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.number)) {
        message.error(" Please enter a valid 10-digit mobile number!");
        return;
      }

      if (formData.messageText.trim().length < 10) {
        message.error(" Message must be at least 10 characters long.");
        return;
      }

      message.success(" Your form has been submitted successfully!");

      setFormData({
        fullname: "",
        email: "",
        number: "",
        messageText: "",
      });
    } catch (error) {
      // console.error("Form submission error:", error);
      message.error(" Something went wrong! Please try again.");
    }
  };

  return (
    <div className={`flex flex-col ${poppins.className}`}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Get in touch</h2>
        <p className="text-gray-500 mb-4 text-sm">
          We are here to help! Reach out with any questions or feedback
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              spellCheck="false"
              placeholder="name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1EA780]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Email Id <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              spellCheck="false"
              onChange={handleChange}
              placeholder="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1EA780]"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Mobile no <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                +91
              </span>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="mobile"
                maxLength="10"
                inputMode="numeric" // ✅ mobile keyboard for numbers
                className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1EA780]"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Write your message here
            </label>
            <textarea
              name="messageText"
              value={formData.messageText}
              onChange={handleChange}
              rows={3}
              spellCheck="false"
              placeholder="Write here..."
              className="w-full h-44 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1EA780]"
            />
          </div>
        </form>
      </div>

      {/* Fixed Submit Button */}
      <div className="mt-20 shadow-md">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-[#1EA780] text-white py-3 font-semibold rounded-md hover:bg-[#159067] transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
