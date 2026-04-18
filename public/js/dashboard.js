async function loadDashboard() {
  const { shell, apiGet, skeleton, toast } = window.PulsePlatform;
  shell("Executive Intelligence Dashboard");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="kpi-grid" id="kpiGrid">${skeleton(6)}</section>
    <section class="grid-2">
      <article class="panel"><h3>Sentiment Trend</h3><canvas id="sentimentTrendChart" height="110"></canvas></article>
      <article class="panel"><h3>Review Volume by Channel</h3><canvas id="channelChart" height="110"></canvas></article>
    </section>
    <section class="grid-3">
      <article class="panel"><h3>Complaints by Category</h3><canvas id="complaintChart" height="130"></canvas></article>
      <article class="panel"><h3>Emotion Distribution</h3><canvas id="emotionChart" height="130"></canvas></article>
      <article class="panel"><h3>Region-wise Analysis</h3><canvas id="regionChart" height="130"></canvas></article>
    </section>
    <section class="panel">
      <h3>Latest Review Drill-down</h3>
      <div class="table-wrap"><table id="reviewTable"><thead><tr><th>Text</th><th>Source</th><th>Sentiment</th><th>Region</th><th>Team</th><th>Status</th></tr></thead><tbody></tbody></table></div>
    </section>
    <section class="panel" id="insightCards">
      <h3>AI Insights Layer</h3>
      <div class="insight-grid"></div>
    </section>
  `;

  try {
    const [{ dashboard }, { items }, { insights }] = await Promise.all([
      apiGet("/api/dashboard"),
      apiGet("/api/reviews"),
      apiGet("/api/insights"),
    ]);

    const kpiGrid = document.getElementById("kpiGrid");
    kpiGrid.innerHTML = `
      <article class="kpi"><h4>Total Reviews</h4><p>${dashboard.kpis.totalReviews}</p></article>
      <article class="kpi"><h4>Negative Sentiment</h4><p>${dashboard.kpis.negativePct}%</p></article>
      <article class="kpi"><h4>Positive Sentiment</h4><p>${dashboard.kpis.positivePct}%</p></article>
      <article class="kpi"><h4>Churn Risk Count</h4><p>${dashboard.kpis.churnRiskCount}</p></article>
      <article class="kpi"><h4>Urgent Issues</h4><p>${dashboard.kpis.urgentIssueCount}</p></article>
      <article class="kpi"><h4>Avg Confidence</h4><p>${dashboard.kpis.avgConfidenceScore}</p></article>
    `;

    const body = document.querySelector("#reviewTable tbody");
    body.innerHTML = items
      .slice(0, 12)
      .map(
        (item) =>
          `<tr><td>${item.text}</td><td>${item.source}</td><td><span class="pill ${item.sentiment}">${item.sentiment}</span></td><td>${item.region}</td><td>${item.team}</td><td>${item.status}</td></tr>`
      )
      .join("");

    const insightGrid = document.querySelector("#insightCards .insight-grid");
    insightGrid.innerHTML = `
      <article class="insight-card"><h4>Top Retention Issues</h4><p>${insights.topIssuesImpactingRetention
        .map((x) => `${x.name} (${x.value})`)
        .join(", ")}</p></article>
      <article class="insight-card"><h4>Most Frequent Complaint</h4><p>${insights.mostFrequentComplaintThisWeek.name}</p></article>
      <article class="insight-card"><h4>Fastest Growing Negative Theme</h4><p>${insights.fastestGrowingNegativeTheme.name}</p></article>
      <article class="insight-card"><h4>Fix Priorities</h4><p>${insights.suggestedFixPriorities.join(" | ")}</p></article>
      <article class="insight-card"><h4>Weekly AI Summary</h4><p>${insights.weeklySummary}</p></article>
      <article class="insight-card"><h4>Daily Ops Summary</h4><p>${insights.dailyOpsSummary}</p></article>
    `;

    new Chart(document.getElementById("sentimentTrendChart"), {
      type: "line",
      data: {
        labels: dashboard.sentimentTrend.map((d) => d.date),
        datasets: [
          { label: "Positive", data: dashboard.sentimentTrend.map((d) => d.positive), borderColor: "#16a34a", tension: 0.25 },
          { label: "Neutral", data: dashboard.sentimentTrend.map((d) => d.neutral), borderColor: "#0284c7", tension: 0.25 },
          { label: "Negative", data: dashboard.sentimentTrend.map((d) => d.negative), borderColor: "#ef4444", tension: 0.25 },
        ],
      },
      options: { responsive: true, plugins: { legend: { labels: { color: "#dbe4f5" } } } },
    });

    function barChart(id, source, color) {
      return new Chart(document.getElementById(id), {
        type: "bar",
        data: {
          labels: source.map((d) => d.name),
          datasets: [{ data: source.map((d) => d.value), backgroundColor: color }],
        },
        options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#cfd9ea" } }, y: { ticks: { color: "#cfd9ea" } } } },
      });
    }

    barChart("channelChart", dashboard.reviewVolumeByChannel, "#f59e0b");
    barChart("complaintChart", dashboard.complaintsByCategory, "#ef4444");
    barChart("emotionChart", dashboard.emotionDistribution, "#8b5cf6");
    barChart("regionChart", dashboard.regionAnalysis, "#06b6d4");
  } catch (error) {
    toast(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
