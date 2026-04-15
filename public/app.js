const analyzeForm = document.getElementById("analyzeForm");
const reviewInput = document.getElementById("reviewInput");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");
const sentimentLabelEl = document.getElementById("sentimentLabel");
const keyPhraseListEl = document.getElementById("keyPhraseList");
const apiSourceEl = document.getElementById("apiSource");

let sentimentChart;

function toPercent(value) {
  return Math.round((value || 0) * 100);
}

function createOrUpdateChart(scores) {
  const chartCanvas = document.getElementById("sentimentChart");
  const data = [
    toPercent(scores.positive),
    toPercent(scores.neutral),
    toPercent(scores.negative),
  ];

  if (sentimentChart) {
    sentimentChart.data.datasets[0].data = data;
    sentimentChart.update();
    return;
  }

  sentimentChart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data,
          backgroundColor: ["#43d9a3", "#6ec3ff", "#f28482"],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#f7fbff",
          },
        },
      },
    },
  });
}

function applySentimentStyle(sentiment) {
  sentimentLabelEl.textContent = sentiment;

  const colors = {
    positive: "rgba(67, 217, 163, 0.2)",
    neutral: "rgba(110, 195, 255, 0.2)",
    negative: "rgba(242, 132, 130, 0.2)",
    mixed: "rgba(255, 209, 102, 0.2)",
  };

  sentimentLabelEl.style.background = colors[sentiment] || "rgba(255, 255, 255, 0.1)";
}

function renderKeyPhrases(phrases) {
  keyPhraseListEl.innerHTML = "";

  if (!phrases || !phrases.length) {
    keyPhraseListEl.innerHTML = '<span class="chip">No key phrases found</span>';
    return;
  }

  phrases.forEach((phrase) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = phrase;
    keyPhraseListEl.appendChild(chip);
  });
}

analyzeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = reviewInput.value.trim();
  if (!text) return;

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultsEl.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Analysis request failed.");
    }

    applySentimentStyle(payload.sentiment);
    createOrUpdateChart(payload.confidenceScores);
    renderKeyPhrases(payload.keyPhrases);
    apiSourceEl.textContent =
      payload.source === "azure"
        ? "Connected to Azure Text Analytics"
        : "Demo mode: add Azure credentials in .env for live cloud analysis";

    resultsEl.classList.remove("hidden");
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove("hidden");
  } finally {
    loadingEl.classList.add("hidden");
  }
});
