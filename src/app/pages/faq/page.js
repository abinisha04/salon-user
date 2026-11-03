"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { poppins } from "@/app/fonts/poppins"; // ✅ import Poppins font

const faqs = [
  {
    question: "How Do I Book An Appointment?",
    answer:
      "Simply choose your preferred salon, select a service, pick a time slot, and confirm your appointment.",
  },
  {
    question: "Can I Reschedule Or Cancel A Booking?",
    answer:
      "Yes. Go to “Bookings,” select the appointment, and choose “Reschedule” or “Cancel.”",
  },
  {
    question: "What Services Are Available For Men?",
    answer:
      "Our partner salons offer haircuts, beard styling, shaving, facials, grooming packages, and more.",
  },
  { 
    question: "Can I Choose A Specific Stylist?",
    answer:
      "Yes. If the salon supports it, you'll see a list of available stylists during booking.",
  },
  {
    question: "How Can I Contact Customer Support?",
    answer:
      "Tap on the “Help Center” or “Support” section in your app. You can chat or raise a ticket.",
  },
  {
    question: "What Can I Do If The Salon Denies My Booking?",
    answer:
      "Contact us through the Help Center. We’ll verify the issue and help you rebook or find alternatives.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="md:hidden sm:block xl:hidden lg:hidden 2xl:hidden">
      <div className={`space-y-3 ${poppins.className}`}>
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 cursor-pointer">
            {/* Question */}
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center py-4 text-left"
            >
              <span className="text-base leading-normal flex-1 font-medium text-gray-900">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
                  openIndex === index ? "rotate-360" : ""
                }`}
              />
            </button>

            {/* Animated Answer */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              } overflow-hidden`}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-gray-600   ">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
