const { ASPECTS, EMOTIONS, REVIEW_SOURCES, ROLES } = require("../config/constants");
const { encryptSecret } = require("../services/securityService");

const organizations = [
  {
    id: "org_1",
    name: "Northstar Commerce",
    plan: "Scale",
    seats: 24,
    createdAt: "2026-01-04T10:00:00.000Z",
  },
];

const workspaces = [
  {
    id: "ws_1",
    organizationId: "org_1",
    name: "Northstar Main Workspace",
    region: "global",
    timezone: "UTC",
  },
];

const users = [
  {
    id: "user_1",
    organizationId: "org_1",
    workspaceId: "ws_1",
    email: "admin@northstar.ai",
    name: "Riya Kapoor",
    role: ROLES.ADMIN,
  },
  {
    id: "user_2",
    organizationId: "org_1",
    workspaceId: "ws_1",
    email: "analyst@northstar.ai",
    name: "Jay Patel",
    role: ROLES.ANALYST,
  },
  {
    id: "user_3",
    organizationId: "org_1",
    workspaceId: "ws_1",
    email: "viewer@northstar.ai",
    name: "Mila Chen",
    role: ROLES.VIEWER,
  },
];

const reviewTemplates = [
  "Checkout flow is smoother after update but card failures are still too high.",
  "Delivery was delayed by three days and support took too long to reply.",
  "I love the new UI, it feels much faster and cleaner than before.",
  "Pricing is getting expensive for small teams and refund process is confusing.",
  "The app crashes during payment retry and I had to contact support twice.",
  "Feature is great but onboarding for first-time users needs improvement.",
  "Please add bulk actions for order management, this is a frequent request.",
  "Support agent solved my issue quickly and was very professional.",
  "Cancellation policy is hard to find and this caused trust issues.",
  "Quality of packaging improved but international delivery still feels inconsistent.",
];

const products = ["Storefront", "Mobile App", "Checkout", "Subscriptions"];
const regions = ["India", "US", "UK", "UAE", "Germany"];
const teams = ["Support", "Product", "CX", "Operations"];
const sentiments = ["positive", "neutral", "negative"];
const intents = [
  "refund_intent",
  "cancellation_intent",
  "upgrade_intent",
  "complaint",
  "feature_request",
];

function confidenceFor(sentiment) {
  if (sentiment === "positive") return 0.88;
  if (sentiment === "negative") return 0.84;
  return 0.72;
}

function emotionSet(sentiment) {
  if (sentiment === "positive") return ["delight"];
  if (sentiment === "negative") return ["frustration", "urgency"];
  return ["confusion"];
}

function aspectScores(sentiment) {
  return ASPECTS.map((aspect, idx) => {
    const base = sentiment === "positive" ? 0.7 : sentiment === "negative" ? 0.28 : 0.52;
    return {
      aspect,
      score: Number((base + ((idx % 3) - 1) * 0.06).toFixed(2)),
    };
  });
}

function buildSeedReviews(count = 120) {
  const rows = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const sentiment = sentiments[i % sentiments.length];
    const createdAt = new Date(now - i * 6 * 60 * 60 * 1000).toISOString();
    const source = REVIEW_SOURCES[i % REVIEW_SOURCES.length];

    rows.push({
      id: `rev_${i + 1}`,
      workspaceId: "ws_1",
      organizationId: "org_1",
      text: reviewTemplates[i % reviewTemplates.length],
      source,
      sourceType: source,
      metadata: {
        ticketId: `TKT-${4100 + i}`,
        customerId: `CUST-${9000 + i}`,
        orderId: `ORD-${15000 + i}`,
      },
      product: products[i % products.length],
      region: regions[i % regions.length],
      team: teams[i % teams.length],
      sentiment,
      confidenceScore: confidenceFor(sentiment),
      emotions: emotionSet(sentiment),
      intents: [intents[i % intents.length]],
      churnRiskScore: sentiment === "negative" ? 0.86 : sentiment === "neutral" ? 0.48 : 0.14,
      urgencyScore: sentiment === "negative" ? 0.82 : 0.33,
      keyPhrases: [
        "checkout flow",
        "delivery delay",
        "support response",
        "refund process",
      ].slice(0, 2 + (i % 2)),
      topicCluster: ["payments", "shipping", "support-experience", "onboarding"][i % 4],
      aspectScores: aspectScores(sentiment),
      status: ["Open", "In Progress", "Resolved", "Ignored"][i % 4],
      assignedTo: users[(i % 2) + 1].id,
      createdAt,
    });
  }

  return rows;
}

const reviews = buildSeedReviews();

const alerts = [
  {
    id: "alert_1",
    workspaceId: "ws_1",
    type: "sentiment_spike",
    channel: "slack",
    threshold: 18,
    enabled: true,
  },
  {
    id: "alert_2",
    workspaceId: "ws_1",
    type: "churn_risk",
    channel: "email",
    threshold: 70,
    enabled: true,
  },
];

const integrations = [
  {
    id: "int_1",
    workspaceId: "ws_1",
    name: "Zendesk",
    status: "connected",
    lastSyncAt: "2026-04-18T08:12:00.000Z",
    secretToken: encryptSecret("zendesk-key-demo"),
  },
  {
    id: "int_2",
    workspaceId: "ws_1",
    name: "Intercom",
    status: "disconnected",
    lastSyncAt: null,
    secretToken: "",
  },
  {
    id: "int_3",
    workspaceId: "ws_1",
    name: "Shopify Reviews",
    status: "connected",
    lastSyncAt: "2026-04-17T19:30:00.000Z",
    secretToken: encryptSecret("shopify-key-demo"),
  },
  {
    id: "int_4",
    workspaceId: "ws_1",
    name: "Google Reviews",
    status: "connected",
    lastSyncAt: "2026-04-18T06:15:00.000Z",
    secretToken: encryptSecret("google-reviews-token-demo"),
  },
  {
    id: "int_5",
    workspaceId: "ws_1",
    name: "Play Store",
    status: "disconnected",
    lastSyncAt: null,
    secretToken: "",
  },
  {
    id: "int_6",
    workspaceId: "ws_1",
    name: "App Store",
    status: "connected",
    lastSyncAt: "2026-04-16T13:40:00.000Z",
    secretToken: encryptSecret("app-store-token-demo"),
  },
];

const savedFilters = [
  {
    id: "filter_1",
    workspaceId: "ws_1",
    name: "High Urgency India",
    query: {
      region: "India",
      minUrgency: 0.7,
      sentiment: "negative",
    },
  },
  {
    id: "filter_2",
    workspaceId: "ws_1",
    name: "Refund Complaints",
    query: {
      intent: "refund_intent",
      sentiment: "negative",
    },
  },
];

const notes = [
  {
    id: "note_1",
    workspaceId: "ws_1",
    reviewId: "rev_4",
    userId: "user_2",
    content: "Recurring complaint from SMB customers. Add to pricing review sprint.",
    createdAt: "2026-04-17T12:20:00.000Z",
  },
];

const assignments = [
  {
    id: "assign_1",
    workspaceId: "ws_1",
    reviewId: "rev_5",
    assigneeId: "user_2",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "assign_2",
    workspaceId: "ws_1",
    reviewId: "rev_9",
    assigneeId: "user_3",
    status: "Open",
    priority: "Medium",
  },
];

const reports = [
  {
    id: "report_1",
    workspaceId: "ws_1",
    type: "weekly_executive",
    createdAt: "2026-04-15T08:00:00.000Z",
    status: "ready",
  },
  {
    id: "report_2",
    workspaceId: "ws_1",
    type: "support_ops_daily",
    createdAt: "2026-04-18T06:00:00.000Z",
    status: "ready",
  },
];

const auditLogs = [
  {
    id: "audit_1",
    workspaceId: "ws_1",
    actorId: "user_1",
    action: "integration_connected",
    details: "Connected Zendesk integration",
    createdAt: "2026-04-17T08:12:00.000Z",
  },
];

const reviewSources = REVIEW_SOURCES.map((source, idx) => ({
  id: `source_${idx + 1}`,
  workspaceId: "ws_1",
  source,
  enabled: true,
}));

const state = {
  organizations,
  workspaces,
  users,
  reviews,
  alerts,
  integrations,
  savedFilters,
  notes,
  assignments,
  reports,
  auditLogs,
  reviewSources,
};

module.exports = {
  state,
};
