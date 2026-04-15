const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const {
  AzureKeyCredential,
  TextAnalyticsClient,
} = require("@azure/ai-text-analytics");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function buildMockAnalysis(text) {
  const cleaned = text.toLowerCase();
  const positiveWords = ["great", "excellent", "awesome", "fast", "love", "perfect"];
  const negativeWords = ["bad", "late", "poor", "broken", "hate", "worst"];

  let positiveHits = 0;
  let negativeHits = 0;

  positiveWords.forEach((word) => {
    if (cleaned.includes(word)) positiveHits += 1;
  });

  negativeWords.forEach((word) => {
    if (cleaned.includes(word)) negativeHits += 1;
  });

  let sentiment = "neutral";
  if (positiveHits > negativeHits) sentiment = "positive";
  if (negativeHits > positiveHits) sentiment = "negative";

  const keyPhrases = text
    .split(/[,.!?;:\n]/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 4)
    .slice(0, 7);

  const base = 0.34;
  const swing = Math.min(Math.abs(positiveHits - negativeHits) * 0.12, 0.45);

  const confidenceScores = {
    positive: sentiment === "positive" ? base + swing : base - swing / 2,
    neutral: sentiment === "neutral" ? 0.68 : 0.22,
    negative: sentiment === "negative" ? base + swing : base - swing / 2,
  };

  return {
    source: "mock",
    sentiment,
    confidenceScores,
    keyPhrases: keyPhrases.length ? keyPhrases : ["general customer feedback"],
  };
}

function getAzureClient() {
  const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
  const key = process.env.AZURE_LANGUAGE_KEY;

  if (!endpoint || !key) return null;

  return new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please provide valid review text." });
    }

    const client = getAzureClient();

    if (!client) {
      return res.json(buildMockAnalysis(text));
    }

    const [sentimentResult] = await client.analyzeSentiment([text]);
    const [keyPhraseResult] = await client.extractKeyPhrases([text]);

    if (sentimentResult.isError) {
      return res.status(502).json({
        error: `Azure sentiment error: ${sentimentResult.error.message}`,
      });
    }

    if (keyPhraseResult.isError) {
      return res.status(502).json({
        error: `Azure key phrase error: ${keyPhraseResult.error.message}`,
      });
    }

    return res.json({
      source: "azure",
      sentiment: sentimentResult.sentiment,
      confidenceScores: sentimentResult.confidenceScores,
      keyPhrases: keyPhraseResult.keyPhrases,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Analysis failed. Please verify Azure credentials and try again.",
      detail: error.message,
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "review-intelligence" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
