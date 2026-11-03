
import { Suspense } from "react";
import FeedbackContent from "./feedbackContent";

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading reviews...
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
