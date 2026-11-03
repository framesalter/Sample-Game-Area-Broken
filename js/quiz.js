import { QUESTION_BANK, DEFAULT_PRESET, BOUNDS } from "./questions.js";
import { sci, round2sf, parseNumber, approxEq, shuffle, renderRich } from "./utils.js";

const state = {
  phase: "setup",
  mode: "default",
  givens: null,
  settings: { hints: false },
  session: { cards: [], answers: [], current: 0, locked: false },
};

const $ = (id) => document.getElementById(id);

function loadSettings() {
  try {
    const raw = localStorage.getItem("sat.settings");
    if (raw) state.settings = { ...state.settings, ...JSON.parse(raw) };
  } catch (_) {}
}

// ---------- Rolling ----------
function rollFromBounds(b) {
  const pick = (bound) => {
    const v = bound.min + Math.random() * (bound.max - bound.min);
    return Math.round(v / bound.step) * bound.step;
  };
  let r1 = pick(b.r1);
  let r2 = pick(b.r2);
  if (r2 <= r1) r2 = r1 + 5e6;
  return { m: pick(b.m), r1, r2 };
}

function rollCurrentGivens() {
  if (state.mode === "default") return rollFromBounds(DEFAULT_PRESET.bounds);
  if (state.mode === "auto")    return rollFromBounds(BOUNDS);
  return {
    m: Number($("input-m").value),
    r1: Number($("input-r1").value),
    r2: Number($("input-r2").value),
  };
}

function validate(g) {
  const errs = [];
  if (!g) return ["Please set the givens first."];
  if (!isFinite(g.m) || g.m <= 0) errs.push("Mass must be a positive number.");
  if (!isFinite(g.r1) || g.r1 < 6.5e6) errs.push("r1 must be at least 6.5 × 10⁶ m.");
  if (!isFinite(g.r2) || g.r2 <= g.r1) errs.push("r2 must be greater than r1.");
  return errs;
}

// ---------- Setup ----------
function initSetup() {
  const byItem = {};
  let totalSubQ = 0;
  QUESTION_BANK.forEach((card) => {
    byItem[card.item] = byItem[card.item] || 0;
    byItem[card.item] += card.subQuestions.length;
    totalSubQ += card.subQuestions.length;
  });
  let html = "";
  Object.entries(byItem).forEach(([item, count]) => {
    html += `<p>Items ${item}: ${count} question${count === 1 ? "" : "s"}</p>`;
  });
  html += `<p><strong>Total: ${totalSubQ} questions across ${QUESTION_BANK.length} cards</strong></p>`;
  html += `<p class="muted">Cards appear in random order. Sub-questions stay in order within each card.</p>`;
  $("available-breakdown").innerHTML = html;

  $("input-m").value = 1000;
  $("input-r1").value = 8.0e6;
  $("input-r2").value = 1.6e7;

  document.querySelectorAll('input[name="mode"]').forEach((r) => {
    r.addEventListener("change", () => {
      state.mode = r.value;
      $("custom-panel").classList.toggle("hidden", state.mode !== "custom");
      updateSetupState();
    });
  });

  ["input-m", "input-r1", "input-r2"].forEach((id) => {
    $(id).addEventListener("input", updateSetupState);
  });

  $("start-btn").addEventListener("click", () => startSession());

  $("custom-panel").classList.add("hidden");
  updateSetupState();
}

function updateSetupState() {
  const errEl = $("setup-errors");
  if (state.mode === "custom") {
    const g = {
      m: Number($("input-m").value),
      r1: Number($("input-r1").value),
      r2: Number($("input-r2").value),
    };
    const errs = validate(g);
    if (errs.length) {
      errEl.textContent = errs.join(" ");
      errEl.classList.remove("hidden");
      $("start-btn").disabled = true;
      return;
    }
  }
  errEl.classList.add("hidden");
  errEl.textContent = "";
  $("start-btn").disabled = false;
}

// ---------- Start ----------
function startSession(fixedGivens) {
  const isGivensObject =
    fixedGivens && typeof fixedGivens === "object" &&
    "m" in fixedGivens && "r1" in fixedGivens && "r2" in fixedGivens;
  const g = isGivensObject ? fixedGivens : rollCurrentGivens();
  const errs = validate(g);
  if (errs.length) {
    const errEl = $("setup-errors");
    errEl.textContent = errs.join(" ");
    errEl.classList.remove("hidden");
    return;
  }
  state.givens = g;
  state.session.cards = shuffle(QUESTION_BANK.slice());
  state.session.answers = [];
  state.session.current = 0;
  state.session.locked = false;
  state.phase = "quiz";
  showPanel("quiz");
  renderCard();
}

function showPanel(id) {
  ["setup", "quiz", "results"].forEach((p) => {
    $(p).classList.toggle("hidden", p !== id);
  });
}

// ---------- Render one card ----------
function renderCard() {
  const card = state.session.cards[state.session.current];
  const g = state.givens;
  state.session.locked = false;

  $("progress-text").textContent = `Card ${state.session.current + 1} of ${state.session.cards.length}`;
  $("item-tag").textContent = `Items ${card.item}`;
  $("progress-fill").style.width =
    `${(state.session.current / state.session.cards.length) * 100}%`;

  const body = $("question-body");
  body.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = card.title;
  body.appendChild(title);

  card.subQuestions.forEach((sq) => {
    const sqEl = document.createElement("div");
    sqEl.className = "subquestion";

    if (sq.label) {
      const labelEl = document.createElement("div");
      labelEl.className = "subq-label";
      labelEl.textContent = sq.label;
      sqEl.appendChild(labelEl);
    }

    const promptEl = document.createElement("div");
    promptEl.className = "subq-prompt";
    renderRich(promptEl, sq.prompt(g));
    sqEl.appendChild(promptEl);

    const fieldsEl = document.createElement("div");
    fieldsEl.className = "subq-fields";

    sq.fields.forEach((f) => {
      const row = document.createElement("div");
      row.className = "field-row";

      const label = document.createElement("label");
      label.setAttribute("for", `field-${sq.id}-${f.id}`);
      label.textContent = f.label;
      row.appendChild(label);

      let inputEl;
      if (f.kind === "numeric") {
        inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.id = `field-${sq.id}-${f.id}`;
        inputEl.placeholder = f.placeholder || "e.g. 1.0e10";
        inputEl.autocomplete = "off";
        inputEl.inputMode = "text";
      } else if (f.kind === "dropdown") {
        inputEl = document.createElement("select");
        inputEl.id = `field-${sq.id}-${f.id}`;
        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "Select an answer";
        blank.disabled = true;
        blank.selected = true;
        inputEl.appendChild(blank);
        f.options.forEach((opt) => {
          const o = document.createElement("option");
          o.value = opt.value;
          o.textContent = opt.text;
          inputEl.appendChild(o);
        });
      }
      row.appendChild(inputEl);

      const mark = document.createElement("span");
      mark.id = `mark-${sq.id}-${f.id}`;
      mark.className = "field-mark";
      row.appendChild(mark);

      fieldsEl.appendChild(row);
    });

    sqEl.appendChild(fieldsEl);

    const solEl = document.createElement("div");
    solEl.id = `solution-${sq.id}`;
    solEl.className = "subq-solution hidden";
    sqEl.appendChild(solEl);

    body.appendChild(sqEl);
  });

  $("card-summary").classList.add("hidden");
  $("card-summary").textContent = "";
  $("check-btn").classList.remove("hidden");
  $("check-btn").disabled = false;
  $("next-btn").classList.add("hidden");

  if (state.settings.hints && card.hints && card.hints.length) {
    $("hint-btn").classList.remove("hidden");
    $("hint-btn").disabled = false;
    $("hint-btn").dataset.revealed = "0";
    $("hint-box").classList.add("hidden");
    $("hint-box").innerHTML = "";
  } else {
    $("hint-btn").classList.add("hidden");
    $("hint-box").classList.add("hidden");
  }
}

// ---------- Check one card ----------
function checkCard() {
  if (state.session.locked) return;
  const card = state.session.cards[state.session.current];
  const g = state.givens;

  const results = {};
  card.subQuestions.forEach((sq) => {
    results[sq.id] = {};
    sq.fields.forEach((f) => {
      const el = $(`field-${sq.id}-${f.id}`);
      let correct = false;
      if (f.kind === "numeric") {
        const parsed = parseNumber(el.value);
        if (!isNaN(parsed)) {
          correct = approxEq(round2sf(parsed), round2sf(f.expected(g)));
        }
      } else if (f.kind === "dropdown") {
        correct = el.value === f.correct;
      }
      results[sq.id][f.id] = correct;
    });
  });

  let bForcedWrong = false;
  if (card.id === "card-9") {
    const aAllCorrect = Object.values(results.a || {}).every((v) => v === true);
    if (!aAllCorrect) {
      Object.keys(results.b || {}).forEach((k) => { results.b[k] = false; });
      bForcedWrong = true;
    }
  }

  let totalFields = 0;
  let correctFields = 0;

  card.subQuestions.forEach((sq) => {
    sq.fields.forEach((f) => {
      const el = $(`field-${sq.id}-${f.id}`);
      const mark = $(`mark-${sq.id}-${f.id}`);
      totalFields += 1;
      if (results[sq.id][f.id]) {
        correctFields += 1;
        el.classList.add("field-correct");
        el.classList.remove("field-wrong");
        mark.textContent = "Correct";
        mark.className = "field-mark ok";
      } else {
        el.classList.add("field-wrong");
        el.classList.remove("field-correct");
        mark.textContent = "Wrong";
        mark.className = "field-mark bad";
      }
      el.disabled = true;
    });
  });

  card.subQuestions.forEach((sq) => {
    const solEl = $(`solution-${sq.id}`);
    solEl.classList.remove("hidden");
    const sol = sq.solution(g);

    let noteHtml = "";
    if (bForcedWrong && sq.id === "b" && card.id === "card-9") {
      noteHtml = `<p class="dep-note">Because at least one field in (a) is not correct, every field in (b) is marked wrong.</p>`;
    }

    solEl.innerHTML = `
      ${noteHtml}
      <h4>Solution${sq.label ? " " + sq.label : ""}</h4>
      <p><strong>Given:</strong> ${sol.given}</p>
      <p><strong>Required:</strong> ${sol.required}</p>
      <p><strong>Equation:</strong> ${sol.equation}</p>
      <p><strong>Substitution:</strong> ${sol.substitution}</p>
      <p><strong>Solution:</strong> ${sol.solution}</p>
      <p><strong>Answer:</strong> ${sol.answer}</p>
    `;

    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(solEl, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
      }
    } else {
      console.warn("renderMathInElement is not available");
    }
  });

  const summary = $("card-summary");
  summary.textContent = `You got ${correctFields} of ${totalFields} fields correct in this card.`;
  summary.classList.remove("hidden");

  state.session.answers.push({
    cardId: card.id,
    item: card.item,
    totalFields,
    correctFields,
    fullyCorrect: correctFields === totalFields,
  });

  state.session.locked = true;
  $("check-btn").disabled = true;
  $("check-btn").classList.add("hidden");
  $("next-btn").classList.remove("hidden");
}

function nextCard() {
  state.session.current += 1;
  if (state.session.current >= state.session.cards.length) {
    endSession();
  } else {
    renderCard();
  }
}

// ---------- Results ----------
function endSession() {
  state.phase = "results";
  showPanel("results");

  const totalFields = state.session.answers.reduce((s, a) => s + a.totalFields, 0);
  const correctFields = state.session.answers.reduce((s, a) => s + a.correctFields, 0);
  const totalCards = state.session.answers.length;
  const perfectCards = state.session.answers.filter((a) => a.fullyCorrect).length;

  $("score-line").textContent =
    `You correctly answered ${correctFields} of ${totalFields} fields across ${totalCards} cards. ${perfectCards} of ${totalCards} cards were fully correct.`;

  const bd = $("breakdown");
  bd.innerHTML = "";
  state.session.answers.forEach((a) => {
    const p = document.createElement("p");
    p.textContent = `Items ${a.item}: ${a.correctFields} of ${a.totalFields} fields correct`;
    bd.appendChild(p);
  });
}

// ---------- Wire ----------
function wire() {
  $("check-btn").addEventListener("click", checkCard);
  $("next-btn").addEventListener("click", nextCard);

  $("hint-btn").addEventListener("click", () => {
    const card = state.session.cards[state.session.current];
    if (!card || !card.hints) return;
    const revealed = Number($("hint-btn").dataset.revealed || 0);
    const box = $("hint-box");
    if (revealed >= card.hints.length) {
      $("hint-btn").disabled = true;
      return;
    }
    box.classList.remove("hidden");
    const p = document.createElement("p");
    p.textContent = `Hint ${revealed + 1}: ${card.hints[revealed]}`;
    box.appendChild(p);
    $("hint-btn").dataset.revealed = String(revealed + 1);
  });

  $("new-session").addEventListener("click", () => startSession());
  $("retake-same").addEventListener("click", () => {
    const fixed = { ...state.givens };
    state.session.cards = shuffle(QUESTION_BANK.slice());
    state.session.answers = [];
    state.session.current = 0;
    state.session.locked = false;
    state.phase = "quiz";
    showPanel("quiz");
    renderCard();
  });
}

// ---------- Boot with diagnostics ----------
loadSettings();
initSetup();

try {
  wire();
  console.log("wire ok");
} catch (e) {
  console.error("wire failed:", e);
}

const required = ["setup", "quiz", "results", "start-btn", "available-breakdown",
  "question-body", "check-btn", "next-btn", "card-summary"];
const missing = required.filter((id) => !document.getElementById(id));
if (missing.length) console.error("Missing elements:", missing);

["startSession", "renderCard", "checkCard", "nextCard", "endSession", "wire"].forEach((name) => {
  if (typeof window[name] === "function") return;
  // Module-scoped functions are not on window; check via eval to avoid ReferenceError
});
