import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchReviews, submitReview, deleteReview } from "../../api/reviews";
import useAuthStore from "../../store/authStore";

const StarInput = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            size={20}
            className={
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
};

const Reviews = ({ slug }) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => fetchReviews(slug),
  });

  const reviews = data?.data?.reviews || [];
  const stats = data?.data?.stats || {};
  const average = parseFloat(stats.average || 0).toFixed(1);
  const total = parseInt(stats.total || 0);

  const submitMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", slug]);
      queryClient.invalidateQueries(["product", slug]);
      queryClient.invalidateQueries(["products"]);
      toast.success("Review submitted");
      setRating(0);
      setComment("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", slug]);
      queryClient.invalidateQueries(["product", slug]);
      toast.success("Review deleted");
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    submitMutation.mutate({ slug, rating, comment });
  };

  const ratingBars = [5, 4, 3, 2, 1];

  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Reviews {total > 0 && `(${total})`}
      </h2>

      {total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{average}</p>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(parseFloat(average))
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">{total} reviews</p>
            </div>

            <div className="flex-1 space-y-1.5">
              {ratingBars.map((star) => {
                const count = parseInt(
                  stats[["", "one", "two", "three", "four", "five"][star]] || 0,
                );
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Write a review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Your rating
              </label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No reviews yet. Be the first to review this product.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {review.userName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {user?.userId === review.userId && (
                    <button
                      onClick={() =>
                        deleteMutation.mutate({ slug, id: review.id })
                      }
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
