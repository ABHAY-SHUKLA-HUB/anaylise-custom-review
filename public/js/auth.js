async function initAuth() {
  const { toast } = window.PulsePlatform;

  async function post(path, payload) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");
      return data;
    }

    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(`Authentication failed with status ${response.status}`);
    }

    return { raw: bodyText };
  }

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
      const data = await post("/api/auth/login", { email: form.email.value });
      localStorage.setItem("pulse_workspace_id", data.workspaceId);
      toast("Login successful. Redirecting to dashboard...", "success");
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", initAuth);
