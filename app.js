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
(function(){
  var PATTERNS = {
    box: {
      label: "Box breathing · 4-4-4-4",
      desc: "Inhale for 4, hold for 4, exhale for 4, hold for 4. Used by Navy SEALs and widely recommended for calming the nervous system before stressful moments.",
      phases: [
        { name: "Inhale", duration: 4, type: "expand" },
        { name: "Hold",   duration: 4, type: "hold-full" },
        { name: "Exhale", duration: 4, type: "contract" },
        { name: "Hold",   duration: 4, type: "hold-empty" }
      ]
    },
    "478": {
      label: "4-7-8 breathing",
      desc: "Inhale through the nose for 4, hold for 7, exhale slowly through the mouth for 8. Developed by Dr. Andrew Weil, often used to ease anxiety and support sleep.",
      phases: [
        { name: "Inhale", duration: 4, type: "expand" },
        { name: "Hold",   duration: 7, type: "hold-full" },
        { name: "Exhale", duration: 8, type: "contract" }
      ]
    }
  };

  var ring = document.getElementById('ring');
  if (!ring) return;

  var phaseLabel = document.getElementById('phaseLabel');
  var countdown = document.getElementById('countdown');
  var progressFill = document.getElementById('progressFill');
  var cycleCountEl = document.getElementById('cycleCount');
  var patternNameEl = document.getElementById('patternName');
  var patternDescEl = document.getElementById('patternDesc');
  var startBtn = document.getElementById('startBtn');
  var resetBtn = document.getElementById('resetBtn');
  var tabBtns = document.querySelectorAll('#regulation .pattern-tabs .tab-btn');

  var SCALE_MIN = 0.45;
  var SCALE_MAX = 1.0;

  var currentPattern = 'box';
  var phaseIndex = 0;
  var cycle = 0;
  var running = false;
  var timer = null;
  var secondsLeft = 0;

  function setPattern(key){
    currentPattern = key;
    tabBtns.forEach(function(b){
      b.classList.toggle('active', b.dataset.pattern === key);
    });
    patternNameEl.textContent = PATTERNS[key].label;
    patternDescEl.textContent = PATTERNS[key].desc;
    resetAll();
  }

  function resetAll(){
    running = false;
    clearInterval(timer);
    phaseIndex = 0;
    cycle = 0;
    ring.classList.remove('pulse');
    ring.style.transition = 'transform 0.6s ease';
    ring.style.transform = 'scale(' + SCALE_MIN + ')';
    phaseLabel.textContent = 'Ready';
    countdown.textContent = '--';
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    cycleCountEl.textContent = 'Cycle 0';
    startBtn.textContent = 'Start';
  }

  function applyPhaseVisual(phase){
    ring.classList.remove('pulse');
    if (phase.type === 'expand') {
      ring.style.transition = 'transform ' + phase.duration + 's linear';
      ring.style.transform = 'scale(' + SCALE_MAX + ')';
    } else if (phase.type === 'contract') {
      ring.style.transition = 'transform ' + phase.duration + 's linear';
      ring.style.transform = 'scale(' + SCALE_MIN + ')';
    } else if (phase.type === 'hold-full') {
      ring.style.transition = 'none';
      ring.style.transform = 'scale(' + SCALE_MAX + ')';
      ring.style.setProperty('--pulse-base', SCALE_MAX);
      requestAnimationFrame(function(){ ring.classList.add('pulse'); });
    } else if (phase.type === 'hold-empty') {
      ring.style.transition = 'none';
      ring.style.transform = 'scale(' + SCALE_MIN + ')';
      ring.style.setProperty('--pulse-base', SCALE_MIN);
      requestAnimationFrame(function(){ ring.classList.add('pulse'); });
    }
  }

  function startPhase(){
    var phases = PATTERNS[currentPattern].phases;
    var phase = phases[phaseIndex];
    secondsLeft = phase.duration;

    phaseLabel.textContent = phase.name;
    countdown.textContent = secondsLeft;

    applyPhaseVisual(phase);

    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        progressFill.style.transition = 'width ' + phase.duration + 's linear';
        progressFill.style.width = '100%';
      });
    });
  }

  function tick(){
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      var phases = PATTERNS[currentPattern].phases;
      phaseIndex = (phaseIndex + 1) % phases.length;
      if (phaseIndex === 0) {
        cycle += 1;
        cycleCountEl.textContent = 'Cycle ' + cycle;
      }
      startPhase();
    } else {
      countdown.textContent = secondsLeft;
    }
  }

  function start(){
    if (running) {
      pause();
      return;
    }
    running = true;
    startBtn.textContent = 'Pause';
    if (phaseIndex === 0 && cycle === 0 && countdown.textContent === '--') {
      startPhase();
    } else {
      ring.style.transition = 'none';
    }
    timer = setInterval(tick, 1000);
  }

  function pause(){
    running = false;
    clearInterval(timer);
    startBtn.textContent = 'Resume';
    var ringStyle = getComputedStyle(ring).transform;
    ring.style.transition = 'none';
    ring.style.transform = ringStyle;
    ring.classList.remove('pulse');
    var fillStyle = getComputedStyle(progressFill).width;
    progressFill.style.transition = 'none';
    progressFill.style.width = fillStyle;
  }

  tabBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      setPattern(btn.dataset.pattern);
    });
  });

  startBtn.addEventListener('click', start);
  resetBtn.addEventListener('click', resetAll);

  resetAll();
})();

(function(){
  var ctx = null;
  var masterGain = null;
  var activeNodes = [];
  var chirpTimeout = null;
  var currentSound = null;

  var toggleBtn = document.getElementById('ambientToggle');
  var panel = document.getElementById('ambientPanel');
  var optionBtns = document.querySelectorAll('.ambient-option');
  var stopBtn = document.getElementById('ambientStop');
  var volumeSlider = document.getElementById('ambientVolume');

  if (!toggleBtn) return;

  function getCtx(){
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = volumeSlider.value / 100;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function makeNoiseBuffer(type, duration){
    var c = getCtx();
    var len = Math.floor(c.sampleRate * duration);
    var buffer = c.createBuffer(1, len, c.sampleRate);
    var data = buffer.getChannelData(0);

    if (type === 'white') {
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      var last = 0;
      for (var i = 0; i < len; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    } else if (type === 'pink') {
      var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (var i = 0; i < len; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + white*0.0555179;
        b1 = 0.99332*b1 + white*0.0750759;
        b2 = 0.96900*b2 + white*0.1538520;
        b3 = 0.86650*b3 + white*0.3104856;
        b4 = 0.55000*b4 + white*0.5329522;
        b5 = -0.7616*b5 - white*0.0168980;
        var pink = b0+b1+b2+b3+b4+b5+b6+white*0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11;
      }
    }

    var fade = Math.floor(c.sampleRate * 0.05);
    for (var i = 0; i < fade; i++) {
      var f = i / fade;
      data[i] *= f;
      data[len - 1 - i] *= f;
    }

    return buffer;
  }

  function stopCurrent(){
    activeNodes.forEach(function(node){
      try { node.stop ? node.stop() : node.disconnect(); } catch(e){}
      try { node.disconnect(); } catch(e){}
    });
    activeNodes = [];
    if (chirpTimeout) {
      clearTimeout(chirpTimeout);
      chirpTimeout = null;
    }
    currentSound = null;
    optionBtns.forEach(function(b){ b.classList.remove('playing'); });
    toggleBtn.classList.remove('active');
  }

  function playRain(){
    var c = getCtx();
    var src = c.createBufferSource();
    src.buffer = makeNoiseBuffer('white', 4);
    src.loop = true;

    var hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1000;

    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 7000;

    src.connect(hp);
    hp.connect(lp);
    lp.connect(masterGain);
    src.start();

    activeNodes = [src, hp, lp];
  }

  function playBrown(){
    var c = getCtx();
    var src = c.createBufferSource();
    src.buffer = makeNoiseBuffer('brown', 4);
    src.loop = true;

    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;

    src.connect(lp);
    lp.connect(masterGain);
    src.start();

    activeNodes = [src, lp];
  }

  function playOcean(){
    var c = getCtx();
    var src = c.createBufferSource();
    src.buffer = makeNoiseBuffer('brown', 4);
    src.loop = true;

    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 350;

    var lfo = c.createOscillator();
    lfo.frequency.value = 0.08;

    var lfoGain = c.createGain();
    lfoGain.gain.value = 250;

    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    src.connect(lp);
    lp.connect(masterGain);
    src.start();
    lfo.start();

    activeNodes = [src, lp, lfo, lfoGain];
  }

  function playForest(){
    var c = getCtx();
    var src = c.createBufferSource();
    src.buffer = makeNoiseBuffer('pink', 4);
    src.loop = true;

    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 0.5;

    var bedGain = c.createGain();
    bedGain.gain.value = 0.4;

    src.connect(bp);
    bp.connect(bedGain);
    bedGain.connect(masterGain);
    src.start();

    activeNodes = [src, bp, bedGain];

    function scheduleChirp(){
      var delay = 1500 + Math.random() * 4000;
      chirpTimeout = setTimeout(function(){
        if (currentSound !== 'forest') return;
        var c2 = getCtx();
        var osc = c2.createOscillator();
        osc.type = 'sine';
        var startFreq = 1800 + Math.random() * 1200;
        osc.frequency.setValueAtTime(startFreq, c2.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.3, c2.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.9, c2.currentTime + 0.18);

        var chirpGain = c2.createGain();
        chirpGain.gain.setValueAtTime(0, c2.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.15, c2.currentTime + 0.01);
        chirpGain.gain.linearRampToValueAtTime(0, c2.currentTime + 0.2);

        osc.connect(chirpGain);
        chirpGain.connect(masterGain);
        osc.start();
        osc.stop(c2.currentTime + 0.25);

        scheduleChirp();
      }, delay);
    }

    scheduleChirp();
  }

  var SOUND_FNS = {
    rain: playRain,
    brown: playBrown,
    ocean: playOcean,
    forest: playForest
  };

  toggleBtn.addEventListener('click', function(){
    panel.classList.toggle('open');
  });

  optionBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var sound = btn.dataset.sound;
      if (currentSound === sound) {
        stopCurrent();
        return;
      }
      stopCurrent();
      currentSound = sound;
      SOUND_FNS[sound]();
      optionBtns.forEach(function(b){ b.classList.toggle('playing', b === btn); });
      toggleBtn.classList.add('active');
    });
  });

  stopBtn.addEventListener('click', stopCurrent);

  volumeSlider.addEventListener('input', function(){
    if (masterGain) masterGain.gain.value = volumeSlider.value / 100;
  });

  document.addEventListener('click', function(e){
    if (!document.getElementById('ambientWidget').contains(e.target)) {
      panel.classList.remove('open');
    }
  });
})();

let journalEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];

function saveJournal() {
  localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
}

(function(){
  const toggleBtn = document.getElementById('journalToggle');
  const modal = document.getElementById('journalModal');
  const closeBtn = document.getElementById('journalClose');
  const saveBtn = document.getElementById('journalSave');
  const entryText = document.getElementById('journalEntryText');
  const entriesContainer = document.getElementById('journalEntries');
  const searchInput = document.getElementById('journalSearch');
  const jTabs = document.querySelectorAll('.journal-tabs .tab-btn');
  const writeTab = document.getElementById('journalWrite');
  const historyTab = document.getElementById('journalHistory');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    modal.classList.add('open');
    renderJournalEntries();
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  jTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      jTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.jtab;
      writeTab.classList.toggle('active', target === 'write');
      historyTab.classList.toggle('active', target === 'history');
      if (target === 'history') renderJournalEntries();
    });
  });

  saveBtn.addEventListener('click', () => {
    const text = entryText.value.trim();
    if (!text) {
      alert("Please write something before saving.");
      return;
    }

    const now = new Date();
    journalEntries.push({
      id: Date.now(),
      text: text,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    saveJournal();
    entryText.value = "";
    alert("Entry saved.");
  });

  searchInput.addEventListener('input', renderJournalEntries);

  function deleteJournalEntry(id) {
    journalEntries = journalEntries.filter(e => e.id !== id);
    saveJournal();
    renderJournalEntries();
  }
  window.deleteJournalEntry = deleteJournalEntry;

  function renderJournalEntries() {
    const searchText = (searchInput.value || "").toLowerCase();

    const filtered = journalEntries
      .filter(e =>
        e.text.toLowerCase().includes(searchText) ||
        e.date.toLowerCase().includes(searchText)
      )
      .slice()
      .reverse();

    if (filtered.length === 0) {
      entriesContainer.innerHTML = '<p class="small-text">No entries found.</p>';
      return;
    }

    entriesContainer.innerHTML = filtered.map(entry => `
      <div class="journal-entry-card">
        <div class="journal-entry-date">${entry.date} · ${entry.time}</div>
        <p class="journal-entry-text">${entry.text.replace(/</g, "&lt;")}</p>
        <div class="journal-entry-actions">
          <button class="danger" onclick="deleteJournalEntry(${entry.id})">Delete</button>
        </div>
      </div>
    `).join("");
  }
})();




























































































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
