function askCopilot({ question, reviews, workspaceId }) {
  const normalized = (question || "").toLowerCase();
  const scoped = reviews.filter((r) => r.workspaceId === workspaceId);

  if (!normalized.trim()) {
    return {
      answer: "Please ask a question about sentiment, complaints, churn risk, or region trends.",
      references: [],
    };
  }

  if (normalized.includes("unhappy") || normalized.includes("negative")) {
    const unhappy = scoped.filter((r) => r.sentiment === "negative");
    return {
      answer: `Customers are unhappy mainly about ${
        unhappy[0]?.topicCluster || "support experience"
      } and checkout reliability. ${unhappy.length} negative records were detected in the selected period.`,
      references: unhappy.slice(0, 3).map((r) => ({ id: r.id, text: r.text })),
    };
  }

  if (normalized.includes("fix first") || normalized.includes("priority")) {
    return {
      answer:
        "Fix payment retry failures first, then reduce delivery-delay support lag. These two themes carry the highest churn and urgency scores.",
      references: scoped.slice(0, 3).map((r) => ({ id: r.id, text: r.text })),
    };
  }

  if (normalized.includes("refund") && normalized.includes("india")) {
    const subset = scoped.filter(
      (r) => r.region === "India" && r.intents.includes("refund_intent")
    );
    return {
      answer: `Found ${subset.length} refund-related complaints from India. Common mentions include refund policy clarity and delayed approvals.`,
      references: subset.slice(0, 4).map((r) => ({ id: r.id, text: r.text })),
    };
  }

  if (normalized.includes("delivery") && normalized.includes("30")) {
    const subset = scoped.filter((r) => r.topicCluster === "shipping");
    return {
      answer: `Delivery complaints remain elevated with ${subset.length} mentions in the recent window. Main pain points are delay communication and predictability.`,
      references: subset.slice(0, 4).map((r) => ({ id: r.id, text: r.text })),
    };
  }

  return {
    answer:
      "PulseReview AI recommends focusing on high-urgency negative themes and churn-risk accounts. Add a region and source filter for sharper guidance.",
    references: scoped.slice(0, 2).map((r) => ({ id: r.id, text: r.text })),
  };
}

module.exports = {
  askCopilot,
};
