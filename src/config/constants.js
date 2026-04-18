const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

const REVIEW_SOURCES = [
  "manual",
  "zendesk",
  "intercom",
  "shopify",
  "google-reviews",
  "play-store",
  "app-store",
  "api",
];

const EMOTIONS = ["frustration", "delight", "anger", "confusion", "urgency"];

const ASPECTS = [
  "pricing",
  "delivery",
  "support",
  "product_quality",
  "ux_ui",
  "checkout_payments",
];

module.exports = {
  ROLES,
  REVIEW_SOURCES,
  EMOTIONS,
  ASPECTS,
};
