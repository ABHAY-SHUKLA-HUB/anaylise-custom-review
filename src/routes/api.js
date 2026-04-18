const express = require("express");

const { state } = require("../data/seed");
const {
  applyFilters,
  buildDashboardPayload,
  buildInsights,
} = require("../services/analyticsService");
const { askCopilot } = require("../services/copilotService");
const { decryptSecret, encryptSecret, maskSecret } = require("../services/securityService");

const router = express.Router();

function getWorkspaceId(req) {
  return req.query.workspaceId || req.body.workspaceId || "ws_1";
}

function logAudit(action, details, workspaceId = "ws_1", actorId = "system") {
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    workspaceId,
    actorId,
    action,
    details,
    createdAt: new Date().toISOString(),
  });
}

router.get("/auth/me", (req, res) => {
  const user = state.users[0];
  return res.json({ user, workspace: state.workspaces[0], organization: state.organizations[0] });
});

router.post("/auth/signup", (req, res) => {
  const { name, email, role = "viewer", workspaceId = "ws_1" } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const user = {
    id: `user_${state.users.length + 1}`,
    organizationId: "org_1",
    workspaceId,
    email,
    name,
    role,
  };
  state.users.push(user);
  logAudit("user_signup", `User ${email} created`, workspaceId, user.id);

  return res.status(201).json({ user, message: "Account created." });
});

router.post("/auth/login", (req, res) => {
  const { email } = req.body;
  const user = state.users.find((item) => item.email === email) || state.users[0];
  return res.json({
    user,
    token: "demo-jwt-token",
    workspaceId: user.workspaceId,
  });
});

router.post("/auth/google", (_req, res) => {
  return res.json({
    message: "Google OAuth exchange simulated.",
    user: state.users[0],
  });
});

router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  return res.json({
    message: `Reset link sent to ${email || "your email"}.`,
  });
});

router.post("/auth/reset-password", (_req, res) => {
  return res.json({ message: "Password has been reset." });
});

router.get("/dashboard", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const filtered = applyFilters(state.reviews, { ...req.query, workspaceId });

  return res.json({
    filters: req.query,
    dashboard: buildDashboardPayload(filtered),
  });
});

router.get("/insights", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const filtered = applyFilters(state.reviews, { ...req.query, workspaceId });
  return res.json({ insights: buildInsights(filtered) });
});

router.get("/reviews", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const filtered = applyFilters(state.reviews, { ...req.query, workspaceId });
  return res.json({
    total: filtered.length,
    items: filtered.slice(0, 120),
  });
});

router.post("/reviews/manual", (req, res) => {
  const {
    workspaceId = "ws_1",
    text,
    source = "manual",
    product = "Storefront",
    region = "US",
    team = "Support",
  } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Feedback text is required." });
  }

  const newReview = {
    id: `rev_${state.reviews.length + 1}`,
    workspaceId,
    organizationId: "org_1",
    text: text.trim(),
    source,
    sourceType: source,
    metadata: {},
    product,
    region,
    team,
    sentiment: "neutral",
    confidenceScore: 0.69,
    emotions: ["confusion"],
    intents: ["feature_request"],
    churnRiskScore: 0.36,
    urgencyScore: 0.22,
    keyPhrases: ["new feedback"],
    topicCluster: "incoming",
    aspectScores: [],
    status: "Open",
    assignedTo: "user_2",
    createdAt: new Date().toISOString(),
  };

  state.reviews.unshift(newReview);
  logAudit("review_manual_ingested", `Manual feedback added ${newReview.id}`, workspaceId);

  return res.status(201).json({ item: newReview });
});

router.post("/reviews/bulk", (req, res) => {
  const { workspaceId = "ws_1", rows = [] } = req.body;
  if (!Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ error: "rows array is required." });
  }

  const inserted = rows.slice(0, 50).map((row, idx) => {
    const item = {
      id: `rev_${state.reviews.length + idx + 1}`,
      workspaceId,
      organizationId: "org_1",
      text: row.text || "Bulk imported feedback",
      source: row.source || "api",
      sourceType: row.source || "api",
      metadata: row.metadata || {},
      product: row.product || "Storefront",
      region: row.region || "US",
      team: row.team || "Support",
      sentiment: row.sentiment || "neutral",
      confidenceScore: row.confidenceScore || 0.7,
      emotions: row.emotions || ["confusion"],
      intents: row.intents || ["complaint"],
      churnRiskScore: row.churnRiskScore || 0.5,
      urgencyScore: row.urgencyScore || 0.4,
      keyPhrases: row.keyPhrases || ["bulk import"],
      topicCluster: row.topicCluster || "general",
      aspectScores: row.aspectScores || [],
      status: "Open",
      assignedTo: "user_2",
      createdAt: new Date().toISOString(),
    };
    return item;
  });

  state.reviews.unshift(...inserted);
  logAudit("review_bulk_ingested", `${inserted.length} bulk rows added`, workspaceId);

  return res.status(201).json({ inserted: inserted.length });
});

router.post("/ingest", (req, res) => {
  const { source, metadata = {}, payload = [], workspaceId = "ws_1" } = req.body;

  if (!source || !Array.isArray(payload)) {
    return res.status(400).json({ error: "source and payload array are required" });
  }

  logAudit(
    "api_ingestion",
    `Ingestion endpoint accepted ${payload.length} records from ${source}`,
    workspaceId
  );

  return res.status(202).json({
    message: "Ingestion accepted",
    source,
    recordsReceived: payload.length,
    metadata,
  });
});

router.get("/alerts", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const items = state.alerts.filter((a) => a.workspaceId === workspaceId);
  return res.json({ items });
});

router.put("/alerts/:id", (req, res) => {
  const alert = state.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  Object.assign(alert, req.body);
  logAudit("alert_updated", `Alert ${alert.id} updated`, alert.workspaceId);

  return res.json({ item: alert });
});

router.get("/team/items", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const items = state.reviews
    .filter((r) => r.workspaceId === workspaceId)
    .slice(0, 25)
    .map((review) => ({
      id: review.id,
      text: review.text,
      status: review.status,
      assignedTo: state.users.find((u) => u.id === review.assignedTo)?.name || "Unassigned",
      team: review.team,
      sentiment: review.sentiment,
      priority: review.urgencyScore >= 0.7 ? "High" : "Normal",
    }));

  return res.json({ items, users: state.users });
});

router.post("/team/assign", (req, res) => {
  const { reviewId, assigneeId, status = "In Progress", note } = req.body;
  const review = state.reviews.find((r) => r.id === reviewId);

  if (!review) return res.status(404).json({ error: "Review not found" });

  review.assignedTo = assigneeId;
  review.status = status;

  if (note) {
    state.notes.unshift({
      id: `note_${Date.now()}`,
      workspaceId: review.workspaceId,
      reviewId,
      userId: assigneeId,
      content: note,
      createdAt: new Date().toISOString(),
    });
  }

  logAudit("feedback_assigned", `Review ${reviewId} assigned to ${assigneeId}`, review.workspaceId);

  return res.json({ message: "Assignment updated", item: review });
});

router.get("/reports", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  return res.json({
    items: state.reports.filter((r) => r.workspaceId === workspaceId),
    savedFilters: state.savedFilters.filter((f) => f.workspaceId === workspaceId),
  });
});

router.post("/reports/export", (req, res) => {
  const { type = "pdf" } = req.body;
  return res.json({
    message: `${type.toUpperCase()} report generation queued`,
    status: "queued",
    generatedAt: new Date().toISOString(),
  });
});

router.get("/integrations", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const items = state.integrations
    .filter((i) => i.workspaceId === workspaceId)
    .map((item) => ({
      ...item,
      secretPreview: maskSecret(decryptSecret(item.secretToken)),
      secretToken: undefined,
    }));

  return res.json({ items });
});

router.put("/integrations/:id", (req, res) => {
  const integration = state.integrations.find((i) => i.id === req.params.id);
  if (!integration) return res.status(404).json({ error: "Integration not found" });

  const { status, secret } = req.body;
  if (status) integration.status = status;
  if (secret) integration.secretToken = encryptSecret(secret);
  integration.lastSyncAt = new Date().toISOString();

  logAudit(
    "integration_updated",
    `${integration.name} moved to ${integration.status}`,
    integration.workspaceId
  );

  return res.json({ message: "Integration updated" });
});

router.post("/copilot/ask", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const { question = "" } = req.body;

  const answer = askCopilot({
    question,
    reviews: state.reviews,
    workspaceId,
  });

  logAudit("copilot_asked", question.slice(0, 80), workspaceId, "user_2");

  return res.json(answer);
});

router.get("/audit-logs", (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const items = state.auditLogs.filter((log) => log.workspaceId === workspaceId).slice(0, 50);
  return res.json({ items });
});

router.delete("/gdpr/workspace/:workspaceId", (req, res) => {
  const { workspaceId } = req.params;
  const before = state.reviews.length;
  state.reviews = state.reviews.filter((r) => r.workspaceId !== workspaceId);
  const removed = before - state.reviews.length;

  logAudit("gdpr_workspace_delete", `Removed ${removed} review records`, workspaceId);

  return res.json({
    workspaceId,
    removed,
    message: "Workspace review data deleted for GDPR request.",
  });
});

router.use((req, res) => {
  return res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
