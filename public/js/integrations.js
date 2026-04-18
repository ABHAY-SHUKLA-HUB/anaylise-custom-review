async function initIntegrations() {
  const { shell, apiGet, apiPut, toast } = window.PulsePlatform;
  shell("API Integrations and Connectors");

  const ENDPOINT_STORAGE_KEY = "azure_language_endpoint";
  const API_KEY_STORAGE_KEY = "azure_language_key";

  function getSavedCredentials() {
    const endpoint = localStorage.getItem(ENDPOINT_STORAGE_KEY) || "";
    const key = localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    return {
      endpoint: endpoint.trim(),
      key: key.trim(),
    };
  }

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="panel">
      <h3>Azure Language Credentials</h3>
      <p class="hint">Set Endpoint and Key once. These values are used by review analysis requests.</p>
      <form id="azureCredentialForm" class="stack-form">
        <input id="azureEndpointInput" type="url" placeholder="https://your-language-resource.cognitiveservices.azure.com/" />
        <input id="azureKeyInput" type="password" placeholder="Azure Language Key" />
        <div class="hero-actions">
          <button class="btn btn-primary" type="submit">Save Endpoint and Key</button>
          <button class="btn btn-ghost" type="button" id="clearAzureCredentials">Clear Saved Values</button>
        </div>
      </form>
      <p id="azureCredentialStatus" class="hint"></p>
    </section>

    <section class="panel">
      <h3>Connector Settings</h3>
      <div id="integrationList" class="stack-list"></div>
    </section>
    <section class="panel">
      <h3>Security and Compliance Controls</h3>
      <ul class="list-lines">
        <li>Secrets encrypted at rest before persistence</li>
        <li>Workspace-level isolation in API responses</li>
        <li>Rate limiting enabled on all API endpoints</li>
        <li>Audit logs available for admin review</li>
        <li>GDPR-friendly delete endpoint for workspace review records</li>
      </ul>
    </section>
  `;

  const endpointInput = document.getElementById("azureEndpointInput");
  const keyInput = document.getElementById("azureKeyInput");
  const credentialStatusEl = document.getElementById("azureCredentialStatus");
  const credentialForm = document.getElementById("azureCredentialForm");
  const clearButton = document.getElementById("clearAzureCredentials");

  function renderCredentialStatus() {
    const { endpoint, key } = getSavedCredentials();
    credentialStatusEl.textContent =
      endpoint && key
        ? "Saved credentials are active and ready for Azure analysis."
        : "No saved credentials yet. You can still use server-side .env credentials.";
  }

  const savedCredentials = getSavedCredentials();
  if (savedCredentials.endpoint) endpointInput.value = savedCredentials.endpoint;
  if (savedCredentials.key) keyInput.value = savedCredentials.key;
  renderCredentialStatus();

  credentialForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const endpoint = endpointInput.value.trim();
    const key = keyInput.value.trim();

    if (!endpoint || !key) {
      credentialStatusEl.textContent = "Please provide both endpoint and key.";
      toast("Please provide both endpoint and key.", "error");
      return;
    }

    localStorage.setItem(ENDPOINT_STORAGE_KEY, endpoint);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    renderCredentialStatus();
    toast("Azure credentials saved.", "success");
  });

  clearButton.addEventListener("click", () => {
    localStorage.removeItem(ENDPOINT_STORAGE_KEY);
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    endpointInput.value = "";
    keyInput.value = "";
    renderCredentialStatus();
    toast("Saved Azure credentials cleared.", "success");
  });

  try {
    const { items } = await apiGet("/api/integrations");
    const list = document.getElementById("integrationList");
    list.innerHTML = items
      .map(
        (item) => `
        <article class="list-card">
          <div>
            <h4>${item.name}</h4>
            <p>Status: ${item.status} | Last Sync: ${item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString() : "Never"}</p>
            <small>Secret Preview: ${item.secretPreview || "Not configured"}</small>
          </div>
          <form class="inline-form" data-id="${item.id}">
            <select name="status">
              <option ${item.status === "connected" ? "selected" : ""}>connected</option>
              <option ${item.status === "disconnected" ? "selected" : ""}>disconnected</option>
            </select>
            <input name="secret" placeholder="Optional new API key" />
            <button class="btn btn-ghost" type="submit">Save</button>
          </form>
        </article>
      `
      )
      .join("");

    list.querySelectorAll("form[data-id]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          await apiPut(`/api/integrations/${form.dataset.id}`, {
            status: form.querySelector("select[name='status']").value,
            secret: form.querySelector("input[name='secret']").value,
          });
          toast("Integration updated.", "success");
          initIntegrations();
        } catch (error) {
          toast(error.message, "error");
        }
      });
    });
  } catch (error) {
    toast(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", initIntegrations);
