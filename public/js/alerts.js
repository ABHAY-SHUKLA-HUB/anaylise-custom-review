async function initAlerts() {
  const { shell, apiGet, apiPut, toast } = window.PulsePlatform;
  shell("Alerts and Automation");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="panel">
      <h3>Alert Rules</h3>
      <div id="alertsList" class="stack-list"></div>
    </section>
    <section class="grid-2">
      <article class="panel">
        <h3>Automation Triggers</h3>
        <ul class="list-lines">
          <li>Auto-flag urgent tickets for support managers</li>
          <li>Email alerts for churn-risk feedback spikes</li>
          <li>Slack webhooks for sentiment drop thresholds</li>
          <li>Webhooks for external escalation systems</li>
        </ul>
      </article>
      <article class="panel">
        <h3>Trigger Status</h3>
        <p>All automations are healthy. Last trigger execution: 4 minutes ago.</p>
      </article>
    </section>
  `;

  try {
    const { items } = await apiGet("/api/alerts");
    const list = document.getElementById("alertsList");
    list.innerHTML = items
      .map(
        (alert) => `
        <article class="list-card">
          <div>
            <h4>${alert.type}</h4>
            <p>Channel: ${alert.channel} | Threshold: ${alert.threshold}</p>
          </div>
          <button class="btn ${alert.enabled ? "btn-primary" : "btn-ghost"}" data-id="${alert.id}" data-enabled="${alert.enabled}">
            ${alert.enabled ? "Enabled" : "Disabled"}
          </button>
        </article>
      `
      )
      .join("");

    list.querySelectorAll("button[data-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const enabled = button.dataset.enabled === "true";

        try {
          await apiPut(`/api/alerts/${id}`, { enabled: !enabled });
          toast("Alert updated.", "success");
          initAlerts();
        } catch (error) {
          toast(error.message, "error");
        }
      });
    });
  } catch (error) {
    toast(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", initAlerts);
