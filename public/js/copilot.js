async function initCopilot() {
  const { shell, apiPost, toast } = window.PulsePlatform;
  shell("Ask PulseReview AI");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="panel">
      <h3>AI Copilot Assistant</h3>
      <p>Ask product and support intelligence questions directly over your workspace data.</p>
      <form id="copilotForm" class="stack-form">
        <textarea id="questionInput" required placeholder="Why are customers unhappy this week?"></textarea>
        <button class="btn btn-primary" type="submit">Ask PulseReview AI</button>
      </form>
      <div id="copilotAnswer" class="copilot-answer empty-state">No question asked yet.</div>
    </section>
    <section class="panel">
      <h3>Prompt Shortcuts</h3>
      <div class="chips" id="promptChips"></div>
    </section>
  `;

  const prompts = [
    "Why are customers unhappy this week?",
    "What should we fix first?",
    "Show refund-related complaints from India",
    "Summarize delivery complaints in last 30 days",
  ];

  document.getElementById("promptChips").innerHTML = prompts
    .map((prompt) => `<button class="chip actionable" data-prompt="${prompt}">${prompt}</button>`)
    .join("");

  document.querySelectorAll("[data-prompt]").forEach((el) => {
    el.addEventListener("click", () => {
      document.getElementById("questionInput").value = el.dataset.prompt;
    });
  });

  document.getElementById("copilotForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = document.getElementById("questionInput").value;

    try {
      const response = await apiPost("/api/copilot/ask", { question });
      const answerEl = document.getElementById("copilotAnswer");
      answerEl.classList.remove("empty-state");
      answerEl.innerHTML = `
        <h4>Answer</h4>
        <p>${response.answer}</p>
        <h4>Evidence</h4>
        <ul>${response.references.map((r) => `<li>${r.id}: ${r.text}</li>`).join("")}</ul>
      `;
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", initCopilot);
