let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let updates = JSON.parse(localStorage.getItem("updates")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("updates", JSON.stringify(updates));
}

function openTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");

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
    name: name,
    description: document.getElementById("taskDescription").value.trim(),
    owner: document.getElementById("taskOwner").value.trim(),
    deadline: document.getElementById("taskDeadline").value,
    status: document.getElementById("taskStatus").value,
    priority: document.getElementById("taskPriority").value,
    completion: 0
  });

  document.getElementById("taskName").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskOwner").value = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskStatus").value = "Not Started";
  document.getElementById("taskPriority").value = "Low";

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
  const dashboardTable = document.getElementById("dashboardTable");
  dashboardTable.innerHTML = "";

  tasks.forEach(task => {
    const priority = task.priority || "Low";

    dashboardTable.innerHTML += `
      <tr>
        <td>${task.name}</td>
        <td>${task.owner || "-"}</td>
        <td>${task.deadline || "-"}</td>
        <td>${task.status}</td>
        <td>
          <span class="priority ${priority.toLowerCase()}">
            ${priority}
          </span>
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

  const average = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + Number(task.completion), 0) / tasks.length)
    : 0;

  document.getElementById("averageCompletion").innerText = average + "%";
}

function renderTasks() {
  const taskTable = document.getElementById("taskTable");
  taskTable.innerHTML = "";

  tasks.forEach(task => {
    const priority = task.priority || "Low";

    taskTable.innerHTML += `
      <tr>
        <td>${task.name}</td>
        <td>${task.description || "-"}</td>
        <td>${task.owner || "-"}</td>
        <td>${task.deadline || "-"}</td>
        <td>${task.status}</td>
        <td>
          <span class="priority ${priority.toLowerCase()}">
            ${priority}
          </span>
        </td>
        <td>
          <button class="danger" onclick="deleteTask(${task.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function renderGoals() {
  const goalTable = document.getElementById("goalTable");
  goalTable.innerHTML = "";

  goals.forEach(goal => {
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

  tasks.forEach(task => {
    updateTask.innerHTML += `
      <option value="${task.id}">
        ${task.name}
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
