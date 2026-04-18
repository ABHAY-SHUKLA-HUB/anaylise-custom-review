function applyFilters(reviews, filters = {}) {
  const {
    startDate,
    endDate,
    product,
    region,
    source,
    team,
    sentiment,
    intent,
    workspaceId,
  } = filters;

  return reviews.filter((item) => {
    if (workspaceId && item.workspaceId !== workspaceId) return false;
    if (product && item.product !== product) return false;
    if (region && item.region !== region) return false;
    if (source && item.source !== source) return false;
    if (team && item.team !== team) return false;
    if (sentiment && item.sentiment !== sentiment) return false;
    if (intent && !item.intents.includes(intent)) return false;

    if (startDate && new Date(item.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(item.createdAt) > new Date(endDate)) return false;

    return true;
  });
}

function summarizeKpis(reviews) {
  const total = reviews.length;
  if (!total) {
    return {
      totalReviews: 0,
      negativePct: 0,
      positivePct: 0,
      churnRiskCount: 0,
      urgentIssueCount: 0,
      avgConfidenceScore: 0,
    };
  }

  const negativeCount = reviews.filter((r) => r.sentiment === "negative").length;
  const positiveCount = reviews.filter((r) => r.sentiment === "positive").length;
  const churnRiskCount = reviews.filter((r) => r.churnRiskScore >= 0.7).length;
  const urgentIssueCount = reviews.filter((r) => r.urgencyScore >= 0.7).length;
  const avgConfidenceScore =
    reviews.reduce((sum, r) => sum + r.confidenceScore, 0) / total;

  return {
    totalReviews: total,
    negativePct: Number(((negativeCount / total) * 100).toFixed(1)),
    positivePct: Number(((positiveCount / total) * 100).toFixed(1)),
    churnRiskCount,
    urgentIssueCount,
    avgConfidenceScore: Number(avgConfidenceScore.toFixed(2)),
  };
}

function aggregateBy(reviews, key) {
  const map = new Map();
  reviews.forEach((item) => {
    const bucket = item[key] || "unknown";
    map.set(bucket, (map.get(bucket) || 0) + 1);
  });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function sentimentTrend(reviews) {
  const daily = new Map();

  reviews.forEach((item) => {
    const day = item.createdAt.slice(0, 10);
    if (!daily.has(day)) {
      daily.set(day, { date: day, positive: 0, neutral: 0, negative: 0 });
    }
    daily.get(day)[item.sentiment] += 1;
  });

  return Array.from(daily.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
}

function emotionDistribution(reviews) {
  const map = new Map();
  reviews.forEach((item) => {
    (item.emotions || []).forEach((emotion) => {
      map.set(emotion, (map.get(emotion) || 0) + 1);
    });
  });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function complaintCategories(reviews) {
  return aggregateBy(
    reviews.filter((r) => r.sentiment === "negative"),
    "topicCluster"
  );
}

function buildDashboardPayload(filtered) {
  return {
    kpis: summarizeKpis(filtered),
    sentimentTrend: sentimentTrend(filtered),
    reviewVolumeByChannel: aggregateBy(filtered, "source"),
    complaintsByCategory: complaintCategories(filtered),
    emotionDistribution: emotionDistribution(filtered),
    topicClusters: aggregateBy(filtered, "topicCluster"),
    regionAnalysis: aggregateBy(filtered, "region"),
  };
}

function buildInsights(filtered) {
  const negative = filtered.filter((r) => r.sentiment === "negative");
  const categoryCounts = complaintCategories(filtered).sort((a, b) => b.value - a.value);
  const urgentCount = filtered.filter((r) => r.urgencyScore >= 0.7).length;

  return {
    topIssuesImpactingRetention: categoryCounts.slice(0, 3),
    mostFrequentComplaintThisWeek: categoryCounts[0] || { name: "none", value: 0 },
    fastestGrowingNegativeTheme: categoryCounts[1] || { name: "shipping", value: 0 },
    suggestedFixPriorities: [
      "Reduce payment retry failures for mobile checkout",
      "Improve first-response SLA for delivery delay tickets",
      "Clarify refund policy in help center and checkout emails",
    ],
    featureRequestsMentionedMost: [
      "Bulk order actions",
      "Faster support callback",
      "Granular subscription controls",
    ],
    weeklySummary:
      "Negative sentiment stayed elevated in delivery and payment-related feedback. Teams should prioritize checkout reliability and support response improvements.",
    dailyOpsSummary: `Support teams should triage ${urgentCount} urgent items and focus on high churn-risk customers first.`,
    negativeCount: negative.length,
  };
}

module.exports = {
  applyFilters,
  buildDashboardPayload,
  buildInsights,
};
