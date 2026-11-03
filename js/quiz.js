import { QUESTION_BANK, PRESETS, BOUNDS, CONSTANTS } from "./questions.js";
import { sci, round2sf, parseNumber, approxEq, shuffle, renderRich } from "./utils.js";

const state = {
  phase: "setup",
  mode: "preset",
  givens: { ...PRESETS["standard-leo-meo"].givens },
  settings: { hints: false },
  session: { questions: [], answers: [], current: 0, locked: false },
};

const $ = (id) => document.getElementById(id);

function loadSettings() {
  try {
    const raw = localStorage.getItem("sat.settings");
    if (raw) state.settings = { ...state.settings, ...JSON.parse(raw) };
  } catch (_) {}
}

function saveSettings() {
  try { localStorage.setItem("sat.settings", JSON.stringify(state.settings)); } catch (_) {}
}

// ---------- Setup ----------
function initSetup() {
  const sel = $("preset-select");
  for (const [k, v] of Object.entries(PRESETS)) {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = v.label;
    sel.appendChild(o);
  }
  sel.value = "standard-leo-meo";
  sel.addEventListener("change", () => {
    state.givens = { ...PRESETS[sel.value].givens };
    updatePreview();
  });

  $("input-m").value = state.givens.m;
  $("input-r1").value = state.givens.r1;
  $("input-r2").value = state.givens.r2;

  ["input-m", "input-r1", "input-r2"].forEach((id) => {
    $(id).addEventListener("input", () => {
      state.givens = {
        m: Number($("input-m").value),
        r1: Number($("input-r1").value),
        r2: Number($("input-r2").value),
      };
      updatePreview();
    });
  });

  document.querySelectorAll('input[name="mode"]').forEach((r) => {
    r.addEventListener("change", () => {
      state.mode = r.value;
      $("preset-panel").classList.toggle("hidden", state.mode !== "preset");
      $("custom-panel").classList.toggle("hidden", state.mode !== "custom");
      $("auto-panel").classList.toggle("hidden", state.mode !== "auto");
      if (state.mode === "preset") state.givens = { ...PRESETS[$("preset-select").value].givens };
      if (state.mode === "custom") {
        state.givens = {
          m: Number($("input-m").value),
          r1: Number($("input-r1").value),
          r2: Number($("input-r2").value),
        };
      }
      if (state.mode === "auto") state.givens = randomGivens();
      updatePreview();
    });
  });

  $("auto-reroll").addEventListener("click", () => {
    state.givens = randomGivens();
    updatePreview();
    $("auto-preview").textContent = previewText();
  });

  $("start-btn").addEventListener("click", startSession);
  updatePreview();
}

function randomGivens() {
  const r = (b) => {
    const v = b.min + Math.random() * (b.max - b.min);
    return Math.round(v / b.step) * b.step;
  };
  let r1 = r(BOUNDS.r1);
  let r2 = r(BOUNDS.r2);
  if (r2 <= r1) r2 = r1 + 5e6;
  return { m: r(BOUNDS.m), r1, r2 };
}

function validate(g) {
  const errs = [];
  if (!isFinite(g.m) || g.m <= 0) errs.push("Mass must be positive.");
  if (!isFinite(g.r1) || g.r1 < 6.5e6) errs.push("r1 must be at least 6.5e6 m.");
  if (!isFinite(g.r2) || g.r2 <= g.r1) errs.push("r2 must be greater than r1.");
  return errs;
}

function previewText() {
  return `m = ${state.givens.m} kg, r1 = ${sci(state.givens.r1)} m, r2 = ${sci(state.givens.r2)} m`;
}

function updatePreview() {
  $("preview-givens").textContent = previewText();
  const errs = validate(state.givens);
  $("preview-check").textContent = errs.length ? errs.join(" ") : "Givens look valid.";
  $("start-btn").disabled = errs.length > 0;
}

// ---------- Session draw ----------
function drawSession(bank, count) {
  const byItem = {};
  bank.forEach((q) => {
    (byItem[q.item] = byItem[q.item] || []).push(q);
  });
  const items = shuffle(Object.keys(byItem));
  const per = Math.max(1, Math.round(count / items.length));
  const picked = [];
  for (const k of items) {
    const pool = shuffle(byItem[k]);
    picked.push(...pool.slice(0, Math.min(per, pool.length)));
  }
  while (picked.length > count) picked.pop();
  if (picked.length < count) {
    const remaining = shuffle(bank.filter((q) => !picked.includes(q)));
    picked.push(...remaining.slice(0, count - picked.length));
  }
  return shuffle(picked);
}

function startSession() {
  const errs = validate(state.givens);
  if (errs.length) return;
  const count = Number($("session-count").value);
  state.session.questions = drawSession(QUESTION_BANK, count);
  state.session.answers = [];
  state.session.current = 0;
  state.phase = "quiz";
  showPanel("quiz");
  renderQuestion();
}

// ---------- Rendering ----------
function showPanel(id) {
  ["setup", "quiz", "results"].forEach((p) => $(p).classList.toggle("hidden", p !== id));
}

function renderQuestion() {
  const q = state.session.questions[state.session.current];
  const g = state.givens;
  state.session.locked = false;

  $("progress-text").textContent = `Question ${state.session.current + 1} of ${state.session.questions.length}`;
  $("item-tag").textContent = `Items ${q.item}`;
  $("progress-fill").style.width = `${((state.session.current) / state.session.questions.length) * 100}%`;

  const body = $("question-body");
  body.innerHTML = "";
  const promptEl = document.createElement("div");
  promptEl.className = "prompt";
  renderRich(promptEl, q.prompt(g));
  body.appendChild(promptEl);

  if (q.format === "numeric") {
    const row = document.createElement("div");
    row.className = "answer-row";
    row.innerHTML = `<input id="answer-input" type="text" placeholder="e.g. -2.5e10 or -2.5 x 10^10" autocomplete="off"> <span class="unit">J or m</span>`;
    body.appendChild(row);
  } else if (q.format === "essay") {
    const ta = document.createElement("textarea");
    ta.id = "answer-input";
    ta.rows = 4;
    ta.placeholder = "Write your answer in one or two sentences.";
    body.appendChild(ta);
  } else if (q.format === "comparison") {
    const list = document.createElement("div");
    list.className = "options";
    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "choice";
      input.value = String(i);
      label.appendChild(input);
      const span = document.createElement("span");
      renderRich(span, opt);
      label.appendChild(span);
      list.appendChild(label);
    });
    body.appendChild(list);
  }

  $("feedback").classList.add("hidden");
  $("feedback").textContent = "";
  $("solution-box").classList.add("hidden");
  $("solution-box").innerHTML = "";
  $("check-btn").classList.remove("hidden");
  $("check-btn").disabled = false;
  $("next-btn").classList.add("hidden");

  if (state.settings.hints && q.hints && q.hints.length) {
    $("hint-btn").classList.remove("hidden");
    $("hint-btn").disabled = false;
    $("hint-btn").dataset.revealed = "0";
    $("hint-box").classList.add("hidden");
    $("hint-box").innerHTML = "";
  } else {
    $("hint-btn").classList.add("hidden");
  }
}

// ---------- Checking ----------
function checkAnswer() {
  if (state.session.locked) return;
  const q = state.session.questions[state.session.current];
  const g = state.givens;

  let correct = false;
  let userRecord = { qid: q.id, item: q.item, userAnswer: null, correct: false };

  if (q.format === "numeric") {
    const raw = $("answer-input").value;
    const parsed = parseNumber(raw);
    if (isNaN(parsed)) {
      showFeedback("invalid", "Could not read your answer. Use a number like -2.5e10 or -2.5 x 10^10.");
      return;
    }
    const expected = q.expected(g);
    correct = approxEq(round2sf(parsed), round2sf(expected));
    userRecord.userAnswer = parsed;
    userRecord.correct = correct;
  } else if (q.format === "comparison") {
    const sel = document.querySelector('input[name="choice"]:checked');
    if (!sel) {
      showFeedback("invalid", "Pick one option before checking.");
      return;
    }
    const idx = Number(sel.value);
    correct = idx === q.correctIndex;
    userRecord.userAnswer = idx;
    userRecord.correct = correct;
  } else if (q.format === "essay") {
    // Essay: reveal model answer and let user self assess.
    const model = q.modelAnswer;
    const fb = $("feedback");
    fb.classList.remove("hidden");
    fb.className = "feedback info";
    fb.innerHTML = `<strong>Model answer:</strong> ${model}`;
    const selfAssess = document.createElement("div");
    selfAssess.className = "self-assess";
    selfAssess.innerHTML = `
      <p>Did your answer match the model?</p>
      <button type="button" id="self-yes" class="primary">Yes, I got it</button>
      <button type="button" id="self-no" class="ghost">I need more practice</button>
    `;
    fb.appendChild(selfAssess);
    $("self-yes").addEventListener("click", () => {
      userRecord.userAnswer = "self-yes";
      userRecord.correct = true;
      finishQuestion(q, userRecord, true);
    });
    $("self-no").addEventListener("click", () => {
      userRecord.userAnswer = "self-no";
      userRecord.correct = false;
      finishQuestion(q, userRecord, false);
    });
    $("check-btn").disabled = true;
    return;
  }

  userRecord.correct = correct;
  finishQuestion(q, userRecord, correct);
}

function finishQuestion(q, record, correct) {
  state.session.locked = true;
  state.session.answers.push(record);
  $("check-btn").disabled = true;
  $("next-btn").classList.remove("hidden");
  if (correct) showFeedback("correct", "Correct.");
  else showFeedback("incorrect", "Not quite. Review the solution below.");

  const sol = q.solution(state.givens);
  const box = $("solution-box");
  box.classList.remove("hidden");
  box.innerHTML = `
    <h3>Solution</h3>
    <p><strong>Given:</strong> ${sol.given}</p>
    <p><strong>Required:</strong> ${sol.required}</p>
    <p><strong>Equation:</strong> ${sol.equation}</p>
    <p><strong>Substitution:</strong> ${sol.substitution}</p>
    <p><strong>Solution:</strong> ${sol.solution}</p>
    <p><strong>Answer:</strong> ${sol.answer}</p>
  `;
  renderRich(box, box.innerHTML);
}

function showFeedback(kind, msg) {
  const fb = $("feedback");
  fb.classList.remove("hidden");
  fb.className = `feedback ${kind}`;
  fb.textContent = msg;
}

function nextQuestion() {
  state.session.current += 1;
  if (state.session.current >= state.session.questions.length) {
    endSession();
  } else {
    renderQuestion();
  }
}

// ---------- Results ----------
function endSession() {
  state.phase = "results";
  showPanel("results");
  const total = state.session.questions.length;
  const correctCount = state.session.answers.filter((a) => a.correct).length;
  $("score-line").textContent = `You answered ${correctCount} of ${total} correctly.`;

  const byItem = {};
  state.session.answers.forEach((a) => {
    byItem[a.item] = byItem[a.item] || { correct: 0, total: 0 };
    byItem[a.item].total += 1;
    if (a.correct) byItem[a.item].correct += 1;
  });
  const bd = $("breakdown");
  bd.innerHTML = "";
  Object.entries(byItem).forEach(([k, v]) => {
    const p = document.createElement("p");
    p.textContent = `Items ${k}: ${v.correct} of ${v.total}`;
    bd.appendChild(p);
  });

  const review = $("review");
  review.innerHTML = "";
  state.session.answers.forEach((a, i) => {
    if (a.correct) return;
    const q = state.session.questions.find((x) => x.id === a.qid);
    const div = document.createElement("div");
    div.className = "review-card";
    const p = document.createElement("div");
    renderRich(p, q.prompt(state.givens));
    div.appendChild(p);
    const sol = document.createElement("div");
    const s = q.solution(state.givens);
    sol.innerHTML = `<p><strong>Answer:</strong> ${s.answer}</p>`;
    renderRich(sol, sol.innerHTML);
    div.appendChild(sol);
    review.appendChild(div);
  });
}

// ---------- Wire up ----------
function wire() {
  $("check-btn").addEventListener("click", checkAnswer);
  $("next-btn").addEventListener("click", nextQuestion);
  $("hint-btn").addEventListener("click", () => {
    const q = state.session.questions[state.session.current];
    const revealed = Number($("hint-btn").dataset.revealed || 0);
    const box = $("hint-box");
    if (revealed >= q.hints.length) {
      $("hint-btn").disabled = true;
      return;
    }
    box.classList.remove("hidden");
    const div = document.createElement("p");
    div.textContent = `Hint ${revealed + 1}: ${q.hints[revealed]}`;
    box.appendChild(div);
    $("hint-btn").dataset.revealed = String(revealed + 1);
  });
  $("retake-same").addEventListener("click", () => {
    state.session.questions = drawSession(QUESTION_BANK, state.session.questions.length);
    state.session.answers = [];
    state.session.current = 0;
    showPanel("quiz");
    renderQuestion();
  });
  $("retake-new").addEventListener("click", () => {
    if (state.mode === "auto") state.givens = randomGivens();
    state.session.questions = drawSession(QUESTION_BANK, state.session.questions.length);
    state.session.answers = [];
    state.session.current = 0;
    showPanel("quiz");
    renderQuestion();
  });
}

// ---------- Boot ----------
loadSettings();
initSetup();
wire();
