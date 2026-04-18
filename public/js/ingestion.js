async function loadIngestion() {
  const { shell, apiPost, toast } = window.PulsePlatform;
  shell("Feedback Ingestion Hub");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="grid-2">
      <article class="panel">
        <h3>Manual Text Input</h3>
        <form id="manualForm" class="stack-form">
          <textarea id="manualText" placeholder="Paste customer feedback, ticket detail, or NPS comment..." required></textarea>
          <div class="grid-2 compact">
            <input id="manualProduct" placeholder="Product (e.g. Checkout)" value="Checkout" />
            <input id="manualRegion" placeholder="Region (e.g. India)" value="India" />
          </div>
          <button class="btn btn-primary" type="submit">Ingest Feedback</button>
        </form>
      </article>
      <article class="panel">
        <h3>Bulk CSV Upload (Simulated)</h3>
        <form id="bulkForm" class="stack-form">
          <textarea id="csvInput" placeholder="text,source,region,product\nDelivery delay issue,zendesk,India,Checkout"></textarea>
          <button class="btn btn-ghost" type="submit">Import CSV Rows</button>
        </form>
        <p class="hint">This demo parses up to 50 rows into ingestion API payload.</p>
      </article>
    </section>

    <section class="panel">
      <h3>API Ingestion Endpoint</h3>
      <pre class="code-block">POST /api/ingest
{
  "source": "zendesk",
  "metadata": { "connector": "nightly-sync" },
  "payload": [{ "text": "Customer says checkout failed" }]
}</pre>
    </section>

    <section class="panel">
      <h3>Connected Source Integrations</h3>
      <div class="chips">
        <span class="chip">Zendesk</span>
        <span class="chip">Intercom</span>
        <span class="chip">Shopify Reviews</span>
        <span class="chip">Google Reviews</span>
        <span class="chip">Play Store</span>
        <span class="chip">App Store</span>
      </div>
    </section>
  `;

  document.getElementById("manualForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await apiPost("/api/reviews/manual", {
        text: document.getElementById("manualText").value,
        product: document.getElementById("manualProduct").value,
        region: document.getElementById("manualRegion").value,
        source: "manual",
      });
      toast("Feedback ingested successfully.", "success");
      event.target.reset();
    } catch (error) {
      toast(error.message, "error");
    }
  });

  document.getElementById("bulkForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const lines = document
      .getElementById("csvInput")
      .value.split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const rows = lines.slice(1).map((line) => {
      const [text, source, region, product] = line.split(",");
      return { text, source, region, product, team: "Support" };
    });

    if (!rows.length) {
      toast("No rows found in CSV input.", "error");
      return;
    }

    try {
      const response = await apiPost("/api/reviews/bulk", { rows });
      toast(`Imported ${response.inserted} rows from CSV.`, "success");
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", loadIngestion);
