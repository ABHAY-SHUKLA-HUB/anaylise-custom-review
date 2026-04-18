(function () {
  const app = {
    workspaceId: localStorage.getItem("pulse_workspace_id") || "ws_1",
    theme: localStorage.getItem("pulse_theme") || "dark",
  };

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pulse_theme", theme);
    app.theme = theme;
  }

  function toggleTheme() {
    setTheme(app.theme === "dark" ? "light" : "dark");
  }

  async function parseResponse(response, fallbackMessage) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || fallbackMessage || "Request failed");
      return data;
    }

    const bodyText = (await response.text()) || "";
    if (!response.ok) {
      throw new Error(fallbackMessage || `Request failed with status ${response.status}`);
    }

    return { raw: bodyText };
  }

  async function apiGet(path) {
    const response = await fetch(`${path}${path.includes("?") ? "&" : "?"}workspaceId=${app.workspaceId}`);
    return parseResponse(response, "GET request failed");
  }

  async function apiPost(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: app.workspaceId, ...body }),
    });
    return parseResponse(response, "POST request failed");
  }

  async function apiPut(path, body) {
    const response = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: app.workspaceId, ...body }),
    });
    return parseResponse(response, "PUT request failed");
  }

  function toast(message, type = "info") {
    const root = document.getElementById("toastRoot");
    if (!root) return;

    const item = document.createElement("div");
    item.className = `toast toast-${type}`;
    item.textContent = message;
    root.appendChild(item);

    window.setTimeout(() => {
      item.classList.add("exit");
      window.setTimeout(() => item.remove(), 250);
    }, 2600);
  }

  function skeleton(rows = 3) {
    return Array.from({ length: rows })
      .map(() => '<div class="skeleton-line"></div>')
      .join("");
  }

  function shell(pageTitle) {
    const root = document.getElementById("appShell");
    if (!root) return;

    const links = [
      ["Dashboard", "dashboard.html"],
      ["Ingestion", "ingestion.html"],
      ["AI Copilot", "copilot.html"],
      ["Alerts", "alerts.html"],
      ["Reports", "reports.html"],
      ["Team", "team.html"],
      ["Integrations", "integrations.html"],
    ];

    const current = window.location.pathname.split("/").pop();

    root.innerHTML = `
      <aside class="sidebar">
        <a href="index.html" class="brand large">PulseReview AI</a>
        <p class="workspace-name">Workspace: Northstar Main</p>
        <nav class="side-nav">
          ${links
            .map(
              ([name, href]) => `<a class="${current === href ? "active" : ""}" href="${href}">${name}</a>`
            )
            .join("")}
        </nav>
      </aside>
      <div class="content-area">
        <header class="topbar">
          <div>
            <h1>${pageTitle}</h1>
            <p>Operational intelligence for product, CX, and support teams.</p>
          </div>
          <div class="topbar-actions">
            <button id="themeToggle" class="btn btn-ghost">Toggle Theme</button>
            <a href="auth.html" class="btn btn-primary">Workspace Admin</a>
          </div>
        </header>
        <main id="pageContent"></main>
      </div>
    `;

    const toggle = document.getElementById("themeToggle");
    toggle?.addEventListener("click", () => {
      toggleTheme();
      toast(`Theme switched to ${app.theme}.`);
    });
  }

  setTheme(app.theme);

  window.PulsePlatform = {
    app,
    shell,
    apiGet,
    apiPost,
    apiPut,
    toast,
    skeleton,
  };
})();
