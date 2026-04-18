async function initReports() {
  const { shell, apiGet, apiPost, toast } = window.PulsePlatform;
  shell("Reports and Executive Summaries");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="grid-2">
      <article class="panel">
        <h3>Available Reports</h3>
        <div id="reportList" class="stack-list"></div>
      </article>
      <article class="panel">
        <h3>Export Center</h3>
        <div class="stack-form">
          <button id="pdfExport" class="btn btn-primary">Export PDF Report</button>
          <button id="csvExport" class="btn btn-ghost">Download CSV Results</button>
          <button id="weeklyMail" class="btn btn-ghost">Send Weekly Executive Email</button>
          <button id="shareDashboard" class="btn btn-ghost">Create Shareable Dashboard Link</button>
        </div>
      </article>
    </section>
  `;

  try {
    const { items } = await apiGet("/api/reports");
    document.getElementById("reportList").innerHTML = items
      .map(
        (item) => `<article class="list-card"><div><h4>${item.type}</h4><p>Status: ${item.status}</p></div><span>${new Date(
          item.createdAt
        ).toLocaleString()}</span></article>`
      )
      .join("");
  } catch (error) {
    toast(error.message, "error");
  }

  function bindExportAction(id, type, message) {
    document.getElementById(id).addEventListener("click", async () => {
      try {
        const response = await apiPost("/api/reports/export", { type });
        toast(response.message || message, "success");
      } catch (error) {
        toast(error.message, "error");
      }
    });
  }

  bindExportAction("pdfExport", "pdf", "PDF export queued.");
  bindExportAction("csvExport", "csv", "CSV export queued.");
  bindExportAction("weeklyMail", "email", "Weekly executive email queued.");
  bindExportAction("shareDashboard", "share-link", "Shareable link generated.");
}

document.addEventListener("DOMContentLoaded", initReports);
