import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Sparkles,
  Camera,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import { TravellerReview, SentimentAnalysisResult } from '../types.ts';
import { fetchReviews, submitReview, analyzeSentiment } from '../services/api.ts';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<TravellerReview[]>([]);
  const [sentiment, setSentiment] = useState<SentimentAnalysisResult | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [destination, setDestination] = useState('Jaipur');
  const [travelType, setTravelType] = useState('Solo Explorer');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews().then((revs) => setReviews(revs));
    analyzeSentiment().then((res) => setSentiment(res));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    const newRev = await submitReview({
      userName: name || 'Apna Explorer',
      rating,
      destination,
      reviewText,
      travelType,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
    });

    if (newRev) {
      setReviews((prev) => [newRev, ...prev]);
      setShowAddReview(false);
      setReviewText('');
      // refresh sentiment
      analyzeSentiment().then((res) => setSentiment(res));
    }
    setIsSubmitting(false);
  };

  return (
    <section id="reviews-sentiment-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Traveller Reviews & AI Sentiment Intelligence
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real feedback from verified journeys, synthesized by our NLP sentiment classifier.
          </p>
        </div>

        <button
          onClick={() => setShowAddReview(!showAddReview)}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Submission Form Modal / Drawer */}
      {showAddReview && (
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950 p-6 shadow-xl animate-fadeIn">
          <h3 className="font-['Outfit'] text-base font-bold text-white mb-4">
            Share Your Travel Experience
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sanskruti T."
                  className="w-full rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Jaipur, Manali"
                  className="w-full rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                  <option value={1}>⭐ (1 - Unsafe / Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Your Detailed Feedback</label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was the route safety? Did the timing conflict alerts help? How were local verified drivers?"
                required
                className="w-full rounded-md border border-slate-800 bg-slate-900/80 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-5 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Verified Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Sentiment Analysis Result Card */}
      {sentiment && (
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-[#121212] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="font-['Outfit'] text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                AI SENTIMENT ANALYSIS OVERVIEW
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Experience Index:</span>
              <span className="font-['Outfit'] text-base sm:text-lg font-bold text-indigo-400">
                {sentiment.recentExperienceScore}/10
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score & Sentiment Bar */}
            <div className="space-y-3">
              <span className="text-xs uppercase text-slate-400 font-medium block">
                Overall Traveller Sentiment
              </span>
              <div className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white">
                {sentiment.overallScorePercent}% Positive
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${sentiment.sentimentBreakdown.positive}%` }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${sentiment.sentimentBreakdown.neutral}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${sentiment.sentimentBreakdown.negative}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive ({sentiment.sentimentBreakdown.positive}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Neutral ({sentiment.sentimentBreakdown.neutral}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative ({sentiment.sentimentBreakdown.negative}%)
                </span>
              </div>
            </div>

            {/* Highlights */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs uppercase text-indigo-400 font-semibold block mb-2 flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5" /> Key Highlights
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {sentiment.popularHighlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Concerns */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs uppercase text-amber-400 font-semibold block mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Common Advisory Concerns
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {sentiment.commonConcerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Traveller Review Cards Grid */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            id={`review-card-${rev.id}`}
            className="rounded-xl border border-slate-800/80 bg-[#121212] p-5 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-semibold text-xs text-white leading-snug">{rev.userName}</h4>
                    <span className="text-[10px] text-slate-500">{rev.travelType}</span>
                  </div>
                </div>
                {rev.verifiedVisit && (
                  <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-medium text-indigo-400">
                    VERIFIED VISIT
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">{rev.date}</span>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed italic">
                "{rev.reviewText}"
              </p>

              {rev.images && rev.images.length > 0 && (
                <div className="mt-3 rounded-lg overflow-hidden h-28 border border-slate-800">
                  <img
                    src={rev.images[0]}
                    alt="Review capture"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Destination: <strong className="text-slate-300 font-medium">{rev.destination}</strong></span>
              <span className="text-emerald-400 font-medium">Verified GPS Trip</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
