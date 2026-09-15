import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { feedbackApi } from "../../services/api";
import { MealType } from "../../types";
import {
  MessageSquareQuote,
  Star,
  Send,
  Info,
  CheckCircle,
  AlertCircle,
  Utensils,
} from "lucide-react";

interface ResidentFeedbackPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ResidentFeedbackPage: React.FC<ResidentFeedbackPageProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const residentId = user?.residentId || "RES-101";

  const [mealType, setMealType] = useState<MealType>("LUNCH");
  const [tasteRating, setTasteRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [quantityRating, setQuantityRating] = useState(4); // refers to serving size satisfaction
  const [varietyRating, setVarietyRating] = useState(4);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        residentId,
        mealType,
        tasteRating,
        qualityRating,
        quantityRating,
        varietyRating,
        comment,
      });
      setSubmitted(true);
      onShowToast("Thank you! Your feedback has been sent to the mess supervisor.", "success");
      setComment("");
    } catch (err: any) {
      onShowToast("Failed to submit feedback. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    label: string,
    value: number,
    setter: (val: number) => void,
    hint?: string
  ) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
      <div>
        <span className="text-xs font-bold text-slate-800">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-slate-700 w-6">
          {value}/5
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Meal Feedback & Rating</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Share your dining experience directly with the PG administration.
        </p>
      </div>

      {/* Clarification banner per requirement */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Note on Serving Satisfaction:</strong> The "Quantity / Serving
          Size" rating below measures whether portion sizes served at the counter
          were satisfying. (It does not affect your Yes/No booking count).
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Feedback Received!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for helping us maintain high food standards and reduce waste.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
            >
              Submit another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Meal Reviewed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["BREAKFAST", "LUNCH", "DINNER"] as MealType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      mealType === type
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {renderStars("Taste & Flavor", tasteRating, setTasteRating, "Seasoning, temperature, and spice level")}
              {renderStars("Food Quality & Freshness", qualityRating, setQualityRating, "Ingredients freshness and hygiene")}
              {renderStars("Serving Size & Portion", quantityRating, setQuantityRating, "Was the standard counter serving satisfying?")}
              {renderStars("Menu Variety", varietyRating, setVarietyRating, "Dishes combination and rotational diversity")}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Comments & Suggestions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share specific suggestions, praise, or dish requests..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting..." : "Submit Meal Feedback"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
