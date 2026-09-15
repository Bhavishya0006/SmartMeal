import React, { useState, useEffect } from "react";
import { feedbackApi } from "../../services/api";
import { MealFeedback } from "../../types";
import {
  MessageSquare,
  Star,
  Calendar,
  Utensils,
  User,
  Heart,
  TrendingUp,
} from "lucide-react";

interface FeedbackPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onShowToast }) => {
  const [feedbacks, setFeedbacks] = useState<MealFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const data = await feedbackApi.getAll();
        setFeedbacks(data);
      } catch (err) {
        console.error(err);
        onShowToast("Failed to fetch feedback logs", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const total = feedbacks.length;
  const avgTaste =
    total > 0
      ? (feedbacks.reduce((a, b) => a + b.tasteRating, 0) / total).toFixed(1)
      : "0.0";
  const avgQuality =
    total > 0
      ? (feedbacks.reduce((a, b) => a + b.qualityRating, 0) / total).toFixed(1)
      : "0.0";
  const avgServing =
    total > 0
      ? (feedbacks.reduce((a, b) => a + b.quantityRating, 0) / total).toFixed(1)
      : "0.0";
  const avgVariety =
    total > 0
      ? (feedbacks.reduce((a, b) => a + b.varietyRating, 0) / total).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Resident Feedback & Ratings</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Mess Quality Audits
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review resident satisfaction regarding meal flavor, cleanliness, serving portion, and dish variety.
        </p>
      </div>

      {/* Average Rating Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Taste & Flavor
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgTaste}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quality & Freshness
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgQuality}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Serving Size Satisfaction
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgServing}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Weekly Dish Variety
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgVariety}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5</span>
          </div>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Recent Resident Reviews ({feedbacks.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No feedback entries logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {f.residentId.slice(-3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {f.residentId}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{f.date} • {f.mealType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{((f.tasteRating + f.qualityRating) / 2).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 my-3 text-[11px] bg-slate-50 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="text-slate-400 block">Taste</span>
                      <span className="font-bold text-slate-800">{f.tasteRating}/5</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Quality</span>
                      <span className="font-bold text-slate-800">{f.qualityRating}/5</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Portion</span>
                      <span className="font-bold text-slate-800">{f.quantityRating}/5</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Variety</span>
                      <span className="font-bold text-slate-800">{f.varietyRating}/5</span>
                    </div>
                  </div>

                  {f.comment && (
                    <p className="text-xs text-slate-700 italic bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      "{f.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
