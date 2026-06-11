let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let updates = JSON.parse(localStorage.getItem("updates")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("updates", JSON.stringify(updates));
}
function getSortedTasks() {
  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  return [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority || "Low"];
    const priorityB = priorityOrder[b.priority || "Low"];

    return priorityA - priorityB;
  });
}
function isOverdue(task) {
  if (!task.deadline || task.status === "Completed") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);

  return deadline < today;
}
function openTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");

  renderAll();
}

function renderTasks() {
  const taskTable = document.getElementById("taskTable");
  taskTable.innerHTML = "";

  const taskSearchInput = document.getElementById("taskSearch");

  const searchText = taskSearchInput
    ? taskSearchInput.value.toLowerCase()
    : "";

  const sortedTasks = getSortedTasks();

  const filteredTasks = sortedTasks.filter(task => {
    const priority = task.priority || "Low";

    return (
      (task.name || "").toLowerCase().includes(searchText) ||
      (task.description || "").toLowerCase().includes(searchText) ||
      (task.owner || "").toLowerCase().includes(searchText) ||
      (task.deadline || "").toLowerCase().includes(searchText) ||
      (task.status || "").toLowerCase().includes(searchText) ||
      priority.toLowerCase().includes(searchText)
    );
  });

  filteredTasks.forEach(task => {
    const priority = task.priority || "Low";
    const taskHistory = getTaskProgressHistory(task.id);

    taskTable.innerHTML += `
      <tr class="${
        isOverdue(task)
          ? priority === "High"
            ? "overdue-high-row"
            : "overdue-row"
          : ""
      }">
        <td>
          <strong>${task.name}</strong>

          ${
            taskHistory.length > 0
              ? `
                <div class="progress-history">
                  <div class="progress-history-title">
                    Progress History
                  </div>

                  ${taskHistory
                    .map(update => `
                      <div class="progress-history-item">
                        <span class="progress-history-date">
                          ${update.date}
                        </span>
                        -
                        <span class="progress-history-percent">
                          ${update.percent}%
                        </span>
                        <br>
                        ${update.notes || "-"}
                      </div>
                    `)
                    .join("")}
                </div>
              `
              : ""
          }

          ${
            task.aiBreakdown
              ? `
                <div class="ai-breakdown">
                  <div class="ai-breakdown-title">
                    AI Task Breakdown
                  </div>

                  <pre>${task.aiBreakdown}</pre>
                </div>
              `
              : ""
          }
        </td>

        <td>${task.description || "-"}</td>
        <td>${task.owner || "-"}</td>
        <td>${task.deadline || "-"}</td>
        <td>${task.status || "-"}</td>

        <td>
          <span class="priority ${priority.toLowerCase()}">
            ${priority}
          </span>

          ${
            isOverdue(task)
              ? '<span class="overdue-badge">OVERDUE</span>'
              : ""
          }
        </td>

        <td>
          <button class="edit" onclick="editTask(${task.id})">
            Edit
          </button>

          <button class="danger" onclick="deleteTask(${task.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  updates = updates.filter(update => update.taskId !== id);

  saveData();
  renderAll();
}
function editTask(id) {
  const task = tasks.find(task => task.id === id);

  if (!task) {
    return;
  }

  document.getElementById("taskName").value = task.name;
  document.getElementById("taskDescription").value = task.description;
  document.getElementById("taskOwner").value = task.owner;
  document.getElementById("taskDeadline").value = task.deadline;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority || "Low";

  deleteTask(id);

  openTab("tasks");
}
function addGoal() {
  const goal = document.getElementById("goalText").value.trim();

  if (!goal) {
    alert("Please enter a goal.");
    return;
  }

  goals.push({
    id: Date.now(),
    text: goal,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("goalText").value = "";

  saveData();
  renderAll();
}

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);

  saveData();
  renderAll();
}

function addUpdate() {
  const taskId = Number(document.getElementById("updateTask").value);
  const percent = Number(document.getElementById("updatePercent").value);
  const notes = document.getElementById("updateNotes").value.trim();

  if (!taskId) {
    alert("Please select a task.");
    return;
  }

  if (percent < 0 || percent > 100 || isNaN(percent)) {
    alert("Please enter a percentage from 0 to 100.");
    return;
  }

  const task = tasks.find(task => task.id === taskId);

  task.completion = percent;
  task.status = percent === 100 ? "Completed" : "In Progress";

  updates.push({
    id: Date.now(),
    taskId: taskId,
    taskName: task.name,
    percent: percent,
    notes: notes,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("updatePercent").value = "";
  document.getElementById("updateNotes").value = "";

  saveData();
  renderAll();
}

function renderDashboard() {
  const dashboardTable =
    document.getElementById("dashboardTable");

  dashboardTable.innerHTML = "";

  const sortedTasks = getSortedTasks();

  sortedTasks.forEach(task => {
    const priority = task.priority || "Low";

    dashboardTable.innerHTML += `
      <tr class="${
  isOverdue(task)
    ? priority === "High"
      ? "overdue-high-row"
      : "overdue-row"
    : ""
}">
        <td>${task.name}</td>
        <td>${task.owner || "-"}</td>
        <td>${task.deadline || "-"}</td>
        <td>${task.status}</td>
        <td>
          <span class="priority ${priority.toLowerCase()}">
  ${priority}
</span>

${
  isOverdue(task)
    ? '<span class="overdue-badge">OVERDUE</span>'
    : ""
}
        </td>
        <td>
  <div class="progress-bar">
    <div class="progress-fill"
         style="width:${task.completion}%">
    </div>

    <div class="progress-label">
      ${task.completion}%
    </div>
  </div>
</td>
      </tr>
    `;
  });

  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("totalGoals").innerText = goals.length;
  const highPriorityCount =
  tasks.filter(task =>
    task.priority === "High" &&
    task.status !== "Completed"
  ).length;

document.getElementById(
  "highPriorityCount"
).innerText = highPriorityCount;
  const average = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + Number(task.completion), 0) / tasks.length)
    : 0;

  document.getElementById("averageCompletion").innerText = average + "%";
}
function getTaskProgressHistory(taskId) {
  return updates
    .filter(update => update.taskId === taskId)
    .slice()
    .reverse();
}
function generateTaskBreakdown(taskName, priority) {
  return [
    `Clarify the final outcome for "${taskName}".`,
    "List all information, tools, or people needed.",
    "Break the task into smaller actions.",
    "Start with the easiest action to build momentum.",
    "Work on the most important part of the task.",
    priority === "High"
      ? "Handle this task early because it is high priority."
      : "Schedule a suitable time to continue this task.",
    "Review the completed work and update the progress percentage."
  ];
}

async function addTask() {
  const name = document.getElementById("taskName").value.trim();

  if (!name) {
    alert("Please enter a task name.");
    return;
  }

  const description = document.getElementById("taskDescription").value.trim();
  const owner = document.getElementById("taskOwner").value.trim();
  const deadline = document.getElementById("taskDeadline").value;
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;

  const newTask = {
    id: Date.now(),
    name: name,
    description: description,
    owner: owner,
    deadline: deadline,
    status: status,
    priority: priority,
    completion: 0,
    aiBreakdown: "Generating AI task breakdown..."
  };

  tasks.push(newTask);
  saveData();
  renderAll();

  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskOwner").value = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskStatus").value = "Not Started";
  document.getElementById("taskPriority").value = "Low";

  try {
    const response = await fetch("http://localhost:3000/generate-task-breakdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskName: name,
        taskDescription: description,
        priority: priority,
        deadline: deadline
      })
    });

    const data = await response.json();

    const task = tasks.find(task => task.id === newTask.id);

    if (task) {
      task.aiBreakdown = data.breakdown || "AI breakdown could not be generated.";
      saveData();
      renderAll();
    }

  } catch (error) {
    console.error("AI generation failed:", error);

    const task = tasks.find(task => task.id === newTask.id);

    if (task) {
      task.aiBreakdown = "AI breakdown failed. Please check if backend server is running.";
      saveData();
      renderAll();
    }
  }
}
function renderGoals() {
  const goalTable = document.getElementById("goalTable");
  goalTable.innerHTML = "";

  const goalSearchInput = document.getElementById("goalSearch");

  const searchText = goalSearchInput
    ? goalSearchInput.value.toLowerCase()
    : "";

  const filteredGoals = goals.filter(goal => {
    return (
      goal.text.toLowerCase().includes(searchText) ||
      goal.date.toLowerCase().includes(searchText)
    );
  });

  filteredGoals.forEach(goal => {
    goalTable.innerHTML += `
      <tr>
        <td>${goal.text}</td>
        <td>${goal.date}</td>
        <td>
          <button class="danger" onclick="deleteGoal(${goal.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}
function renderUpdates() {
  const updateTask = document.getElementById("updateTask");
  updateTask.innerHTML = '<option value="">Select task</option>';

  const sortedTasks = getSortedTasks();

sortedTasks.forEach(task => {
  updateTask.innerHTML += `
    <option value="${task.id}">
      [${task.priority}] ${task.name}
    </option>
  `;
});

  const updateTable = document.getElementById("updateTable");
  updateTable.innerHTML = "";

  updates.slice().reverse().forEach(update => {
    updateTable.innerHTML += `
      <tr>
        <td>${update.date}</td>
        <td>${update.taskName}</td>
        <td>${update.percent}%</td>
        <td>${update.notes || "-"}</td>
      </tr>
    `;
  });
}

function renderAll() {
  renderDashboard();
  renderTasks();
  renderGoals();
  renderUpdates();
}

renderAll();































































































/* let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
 let goals = JSON.parse(localStorage.getItem("goals")) || [];
let updates = JSON.parse(localStorage.getItem("updates")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("updates", JSON.stringify(updates));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openTab(tabId, clickedButton) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  clickedButton.classList.add("active");
  renderAll();
}

function addTask() {
  const name = document.getElementById("taskName").value.trim();
  if (!name) {
    alert("Please enter a task name.");
    return;
  }

  tasks.push({
    id: Date.now(),
    name,
    description: document.getElementById("taskDescription").value.trim(),
    owner: document.getElementById("taskOwner").value.trim(),
    deadline: document.getElementById("taskDeadline").value,
    status: document.getElementById("taskStatus").value,
    completion: document.getElementById("taskStatus").value === "Completed" ? 100 : 0
  });

  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskOwner").value = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskStatus").value = "Not Started";

  saveData();
  renderAll();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  updates = updates.filter(update => update.taskId !== id);
  saveData();
  renderAll();
}

function addGoal() {
  const goal = document.getElementById("goalText").value.trim();
  if (!goal) {
    alert("Please enter a goal.");
    return;
  }

  goals.push({
    id: Date.now(),
    text: goal,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("goalText").value = "";
  saveData();
  renderAll();
}

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  saveData();
  renderAll();
}

function addUpdate() {
  const taskId = Number(document.getElementById("updateTask").value);
  const percent = Number(document.getElementById("updatePercent").value);
  const notes = document.getElementById("updateNotes").value.trim();

  if (!taskId) {
    alert("Please select a task.");
    return;
  }

  if (percent < 0 || percent > 100 || Number.isNaN(percent)) {
    alert("Please enter a percentage from 0 to 100.");
    return;
  }

  const task = tasks.find(item => item.id === taskId);
  if (!task) return;

  task.completion = percent;
  task.status = percent === 100 ? "Completed" : "In Progress";

  updates.push({
    id: Date.now(),
    taskId,
    taskName: task.name,
    percent,
    notes,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("updatePercent").value = "";
  document.getElementById("updateNotes").value = "";

  saveData();
  renderAll();
}

function renderDashboard() {
  const dashboardTable = document.getElementById("dashboardTable");
  dashboardTable.innerHTML = "";

  if (tasks.length === 0) {
    dashboardTable.innerHTML = '<tr><td colspan="5" class="empty-row">No tasks added yet.</td></tr>';
  } else {
    tasks.forEach(task => {
      dashboardTable.innerHTML += `
        <tr>
          <td>${escapeHtml(task.name)}</td>
          <td>${escapeHtml(task.owner || "-")}</td>
          <td>${escapeHtml(task.deadline || "-")}</td>
          <td>${escapeHtml(task.status)}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Number(task.completion)}%">${Number(task.completion)}%</div>
            </div>
          </td>
        </tr>
      `;
    });
  }

  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("totalGoals").innerText = goals.length;

  const average = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + Number(task.completion), 0) / tasks.length)
    : 0;

  document.getElementById("averageCompletion").innerText = average + "%";
}

function renderTasks() {
  const taskTable = document.getElementById("taskTable");
  taskTable.innerHTML = "";

  if (tasks.length === 0) {
    taskTable.innerHTML = '<tr><td colspan="6" class="empty-row">No tasks added yet.</td></tr>';
    return;
  }

  tasks.forEach(task => {
    taskTable.innerHTML += `
      <tr>
        <td>${escapeHtml(task.name)}</td>
        <td>${escapeHtml(task.description || "-")}</td>
        <td>${escapeHtml(task.owner || "-")}</td>
        <td>${escapeHtml(task.deadline || "-")}</td>
        <td>${escapeHtml(task.status)}</td>
        <td><button class="danger" onclick="deleteTask(${task.id})">Delete</button></td>
      </tr>
    `;
  });
}

function renderGoals() {
  const goalTable = document.getElementById("goalTable");
  goalTable.innerHTML = "";

  if (goals.length === 0) {
    goalTable.innerHTML = '<tr><td colspan="3" class="empty-row">No goals added yet.</td></tr>';
    return;
  }

  goals.forEach(goal => {
    goalTable.innerHTML += `
      <tr>
        <td>${escapeHtml(goal.text)}</td>
        <td>${escapeHtml(goal.date)}</td>
        <td><button class="danger" onclick="deleteGoal(${goal.id})">Delete</button></td>
      </tr>
    `;
  });
}

function renderUpdates() {
  const updateTask = document.getElementById("updateTask");
  updateTask.innerHTML = '<option value="">Select task</option>';

  tasks.forEach(task => {
    updateTask.innerHTML += `<option value="${task.id}">${escapeHtml(task.name)}</option>`;
  });

  const updateTable = document.getElementById("updateTable");
  updateTable.innerHTML = "";

  if (updates.length === 0) {
    updateTable.innerHTML = '<tr><td colspan="4" class="empty-row">No work updates added yet.</td></tr>';
    return;
  }

  updates.slice().reverse().forEach(update => {
    updateTable.innerHTML += `
      <tr>
        <td>${escapeHtml(update.date)}</td>
        <td>${escapeHtml(update.taskName)}</td>
        <td>${Number(update.percent)}%</td>
        <td>${escapeHtml(update.notes || "-")}</td>
      </tr>
    `;
  });
}

function renderAll() {
  renderDashboard();
  renderTasks();
  renderGoals();
  renderUpdates();
}

document.querySelectorAll(".tab-btn").forEach(button => {
  button.addEventListener("click", () => openTab(button.dataset.tab, button));
});

document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("addGoalBtn").addEventListener("click", addGoal);
document.getElementById("saveUpdateBtn").addEventListener("click", addUpdate);

renderAll(); **/
