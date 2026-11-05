"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Star, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");

  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // only for first load
  const [isUpdating, setIsUpdating] = useState(false); // for filter/page changes
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  // Simple cache so switching back to a previous filter is instant
  const cacheRef = useRef({});

  useEffect(() => {
    if (!shopId) {
      setError("Shop information is missing.");
      setLoading(false);
      return;
    }

    const cacheKey = `${shopId}-${page}-${sortBy}`;

    // If we already have this exact data, use it instantly
    if (cacheRef.current[cacheKey]) {
      setData(cacheRef.current[cacheKey]);
      setLoading(false);
      setIsUpdating(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        // Only full loading on first load
        if (!data) {
          setLoading(true);
        } else {
          setIsUpdating(true);
        }
        setError("");

        const response = await fetch(
          `/api/proxy?endpoint=getShopFeedback&shopId=${encodeURIComponent(
            shopId,
          )}&page=${page}&limit=10&sortBy=${sortBy}`,
          { cache: "no-store" },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load reviews");
        }

        // Save to cache
        cacheRef.current[cacheKey] = result;
        setData(result);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };

    fetchFeedback();
  }, [shopId, page, refreshKey, sortBy]);

  useEffect(() => {
    const handleFeedbackUpdate = (event) => {
      if (event.detail?.shopId === shopId) {
        setRefreshKey((current) => current + 1);
      }
    };

    window.addEventListener("shop-feedback-updated", handleFeedbackUpdate);

    return () => {
      window.removeEventListener("shop-feedback-updated", handleFeedbackUpdate);
    };
  }, [shopId]);

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={17}
          className={
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading reviews...
      </div>
    );
  }

  {
    isUpdating && (
      <p className="text-sm text-gray-500 mb-4">Updating reviews...</p>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-5 text-gray-700 hover:text-black font-semibold transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        {/* Shop Rating Summary */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Zenth Salon Reviews
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-5xl font-bold">
              {data.averageRating.toFixed(1)}
            </span>

            <div>
              {renderStars(Math.round(data.averageRating))}
              <p className="text-sm text-gray-500 mt-1">
                {data.totalReviews} reviews
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = data.ratingBreakdown[rating] || 0;

              const percentage =
                data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8">{rating} ★</span>

                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-xs text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-5">Customer Reviews</h2>

          <div className="flex items-center gap-3 mb-6">
            {[
              { label: "Newest", value: "newest" },
              { label: "Highest", value: "highest" },
              { label: "Lowest", value: "lowest" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setSortBy(filter.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  sortBy === filter.value
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading && (
            <p className="text-sm text-gray-500 mb-4">Updating reviews...</p>
          )}

          {data.reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.reviews.map((review) => (
                <article key={review._id} className="py-5 first:pt-0">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.userName}
                      </h3>
                      <div className="mt-1">{renderStars(review.rating)}</div>
                    </div>

                    <time className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  <p className="text-sm text-gray-700 mt-3 leading-6">
                    {review.feedback}
                  </p>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1 || loading}
                className="p-2 rounded-lg border disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium">
                Page {data.currentPage} of {data.totalPages}
              </span>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= data.totalPages || loading}
                className="p-2 rounded-lg border disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
