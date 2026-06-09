import React from 'react';
import { Star } from 'lucide-react';

const ReviewSummary = ({ rating, totalReviews, reviews }) => {
  const stats = [
    { label: 'Excellent', stars: 5 },
    { label: 'VeryGood', stars: 4 },
    { label: 'Average', stars: 3 },
    { label: 'Poor', stars: 2 },
    { label: 'Terrible', stars: 1 },
  ];
  const reviewsArray = Array.isArray(reviews) ? reviews : [];

  const breakdown = stats.map(stat => {
    const count = reviewsArray.filter(r => Math.round(r.rating) === stat.stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { ...stat, count, percentage };
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 space-y-8 border border-gray-100 shadow-sm">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-6">
        <div className="flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={32} />
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {Number(rating || 0).toFixed(1)}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{totalReviews} Ratings</p>
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((stat, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="w-20 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-bold text-gray-400">
              {stat.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary;
