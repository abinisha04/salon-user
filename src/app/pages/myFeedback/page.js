"use client";

import { useEffect, useState } from "react";
import { Star, ArrowLeft, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

const SHOP_ID = "6ae7c9ff38c6f355726abd90";

export default function MyFeedbackPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      router.replace("/");
      return;
    }

    try {
      const user = JSON.parse(stored);
      const id = user._id || user.id;

      if (!id) {
        setError("User information is missing.");
        setLoading(false);
        return;
      }

      setUserId(id);
      fetchMyFeedback(id);
      // console.log("User ID:", id);
    } catch {
      setError("Unable to read user information.");
      setLoading(false);
    }
  }, [router]);

  const fetchMyFeedback = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/proxy?endpoint=getRating&shopId=${SHOP_ID}&userId=${id}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      // console.log("GET API Full Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load feedback");
      }

      const myReview = result.data || null;

      setReview(myReview);

      // console.log(" Feedback Response:", myReview);

      if (myReview) {
        setRating(myReview.rating);
        setFeedback(myReview.feedback || "");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

      // console.log("GET Feedback Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update feedback");
      }

      setReview(result.data);
      setRating(result.data.rating);
      setFeedback(result.data.feedback || "");
      setEditing(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your feedback...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="max-w-2xl mx-auto">
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

          {!review ? (
            <div className="text-center py-10">
              <p className="text-gray-600">
                You haven't submitted a review yet.
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
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
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
