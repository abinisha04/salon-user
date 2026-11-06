"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, ArrowLeft, Pencil, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID || "6ae7c9ff38c6f355726abd90";

export default function MyFeedbackPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true); // only for the content area
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 1. Instantly read user + try cached review
  useEffect(() => {
    const loadFeedback = async () => {
      const stored = localStorage.getItem("user");

      if (!stored) {
        router.replace("/");
        return;
      }

      let id;

      try {
        const user = JSON.parse(stored);
        id = user._id || user.id;

        if (!id) {
          setError("User information is missing.");
          setLoading(false);
          return;
        }

        setUserId(id);

        // Show cached feedback immediately
        const cached = sessionStorage.getItem(`my-feedback-${id}`);

        if (cached) {
          const parsed = JSON.parse(cached);

          setReview(parsed);
          setRating(parsed.rating || 0);
          setFeedback(parsed.feedback || "");
          setLoading(false);
        }
      } catch {
        setError("Unable to read user information.");
        setLoading(false);
        return;
      }

      // Fetch the latest feedback
      try {
        const response = await fetch(
          `/api/proxy?endpoint=getRating&shopId=${SHOP_ID}&userId=${id}`,
          { cache: "no-store" },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load feedback");
        }

        const myReview = result.data || null;

        setReview(myReview);

        if (myReview) {
          setRating(myReview.rating || 0);
          setFeedback(myReview.feedback || "");

          sessionStorage.setItem(`my-feedback-${id}`, JSON.stringify(myReview));
        } else {
          setRating(0);
          setFeedback("");
          sessionStorage.removeItem(`my-feedback-${id}`);
        }

        setError("");
      } catch (error) {
        setError(error.message || "Unable to load feedback");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [router]);

  const handleUpdate = async () => {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    if (!review?._id) {
      setError("Review ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/proxy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "putRating",
          feedbackId: review._id,
          shopId: SHOP_ID,
          userId,
          rating,
          feedback: feedback.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update feedback");
      }

      const updated = result.data;
      setReview(updated);
      setRating(updated.rating);
      setFeedback(updated.feedback || "");
      setEditing(false);

      // Update cache
      sessionStorage.setItem(`my-feedback-${userId}`, JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("shop-feedback-updated", {
          detail: { shopId: SHOP_ID },
        }),
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (value, interactive = false) => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => setRating(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={26}
            className={
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="max-w-2xl mx-auto">
        {/* Header always visible instantly */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-700"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
          <p className="text-sm text-gray-500 mt-2">
            Your review for Zenth Salon
          </p>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

          {/* Content area */}
          {loading ? (
            <div className="mt-10 flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mb-3" />
              <p className="text-sm">Loading your feedback...</p>
            </div>
          ) : !review ? (
            <div className="text-center py-10">
              <p className="text-gray-600">
                You haven&apos;t placed an order yet. Place your first order to
                share your experience!
              </p>
            </div>
          ) : (
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Your Rating</h2>

                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600"
                  >
                    <Pencil size={16} />
                    Edit Review
                  </button>
                )}
              </div>

              <div className="mt-4">{renderStars(rating, editing)}</div>

              <h2 className="font-semibold mt-7 mb-3">Your Feedback</h2>

              {editing ? (
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Write your feedback..."
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-black"
                />
              ) : (
                <p className="text-gray-700 leading-7 bg-gray-50 rounded-xl p-4">
                  {review.feedback || "No feedback provided"}
                </p>
              )}

              {review.updatedAt && (
                <p className="text-xs text-gray-400 mt-3">
                  Last updated:{" "}
                  {new Date(review.updatedAt).toLocaleDateString("en-IN")}
                </p>
              )}

              {editing && (
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => {
                      setRating(review.rating);
                      setFeedback(review.feedback || "");
                      setEditing(false);
                      setError("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
