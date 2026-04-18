async function initTeam() {
  const { shell, apiGet, apiPost, toast } = window.PulsePlatform;
  shell("Team Collaboration Workspace");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <section class="panel">
      <h3>Assignments and Status Workflow</h3>
      <div id="teamList" class="stack-list"></div>
    </section>
  `;

  try {
    const { items, users } = await apiGet("/api/team/items");
    const userOptions = users
      .map((user) => `<option value="${user.id}">${user.name} (${user.role})</option>`)
      .join("");

    const list = document.getElementById("teamList");
    list.innerHTML = items
      .slice(0, 12)
      .map(
        (item) => `
          <article class="list-card">
            <div>
              <h4>${item.id}</h4>
              <p>${item.text}</p>
              <small>Team: ${item.team} | Sentiment: ${item.sentiment} | Status: ${item.status} | Priority: ${item.priority}</small>
            </div>
            <form class="inline-form" data-review-id="${item.id}">
              <select name="assigneeId">${userOptions}</select>
              <select name="status">
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Ignored</option>
              </select>
              <button class="btn btn-ghost" type="submit">Assign</button>
            </form>
          </article>
        `
      )
      .join("");

    list.querySelectorAll("form[data-review-id]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const reviewId = form.dataset.reviewId;
        const assigneeId = form.querySelector("select[name='assigneeId']").value;
        const status = form.querySelector("select[name='status']").value;

        try {
          await apiPost("/api/team/assign", {
            reviewId,
            assigneeId,
            status,
            note: "Updated from Team Collaboration page",
          });
          toast(`Assignment updated for ${reviewId}.`, "success");
        } catch (error) {
          toast(error.message, "error");
        }
      });
    });
  } catch (error) {
    toast(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", initTeam);
