import { STARS, TIER_LABELS, rollStar, randomReelItem } from "./stars.js";

const ITEM_WIDTH = 132;
const REEL_EXTRA = 40;
const SPIN_DURATION = 3600;
const STORAGE_KEY = "case-opener-pedia";

const $ = (id) => document.getElementById(id);

let obtainedCache = null;
function getObtained() {
  if (obtainedCache) return obtainedCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    obtainedCache = raw ? JSON.parse(raw) : [];
  } catch (_) {
    obtainedCache = [];
  }
  return obtainedCache;
}
function addObtained(id) {
  const arr = getObtained();
  if (!arr.includes(id)) {
    arr.push(id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
  }
}

function tierClass(tier) { return "tier-" + tier; }

function makeReelItem(star) {
  const el = document.createElement("div");
  el.className = "reel-item " + tierClass(star.tier);
  el.innerHTML = `
    <div class="reel-name">${star.name}</div>
    <div class="reel-class">${star.class}</div>
  `;
  return el;
}

function renderPedia() {
  const obtained = getObtained();
  const grid = $("pedia-grid");
  grid.innerHTML = "";
  STARS.forEach((star) => {
    const got = obtained.includes(star.id);
    const card = document.createElement("div");
    card.className = `pedia-card ${tierClass(star.tier)}${got ? "" : " unobtained"}${star.neutron ? " neutron" : ""}`;
    card.innerHTML = `
      <div class="pedia-name">${star.name}</div>
      <div class="pedia-class">${star.class}</div>
      <div class="pedia-tier">${TIER_LABELS[star.tier]}</div>
    `;
    grid.appendChild(card);
  });
  $("pedia-count").textContent = `${obtained.length} of ${STARS.length} collected`;
}

let spinning = false;

function spin() {
  if (spinning) return;
  spinning = true;
  $("open-btn").disabled = true;
  $("skip-btn").classList.remove("hidden");
  $("result-panel").classList.add("hidden");
  $("result-panel").className = "result-panel hidden";

  const winner = rollStar();
  const viewportWidth = $("reel-viewport").clientWidth;
  const visible = Math.ceil(viewportWidth / ITEM_WIDTH) + 2;
  const total = visible + REEL_EXTRA;
  const winnerIndex = total - 4;

  const track = $("reel-track");
  track.innerHTML = "";
  track.style.transition = "none";
  track.style.transform = "translateX(0)";

  for (let i = 0; i < total; i++) {
    const star = i === winnerIndex ? winner : randomReelItem();
    const item = makeReelItem(star);
    if (i === winnerIndex) item.id = "winner-item";
    track.appendChild(item);
  }

  requestAnimationFrame(() => {
    const stripRect = track.getBoundingClientRect();
    const winnerEl = $("winner-item");
    const winnerRect = winnerEl.getBoundingClientRect();
    const winnerCenter = winnerRect.left - stripRect.left + winnerRect.width / 2;
    const target = window.innerWidth / 2 - winnerCenter - stripRect.left;
    track.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.9, 0.25, 1)`;
    track.style.transform = `translateX(${target}px)`;
  });

  setTimeout(() => finishSpin(winner), SPIN_DURATION);
}

function skipSpin() {
  // Fast-forward: complete immediately
  const track = $("reel-track");
  if (!track) return;
  track.style.transition = "none";
  const winner = $("winner-item");
  if (!winner) return;
  const stripRect = track.getBoundingClientRect();
  const winnerRect = winner.getBoundingClientRect();
  const winnerCenter = winnerRect.left - stripRect.left + winnerRect.width / 2;
  const target = window.innerWidth / 2 - winnerCenter - stripRect.left;
  track.style.transform = `translateX(${target}px)`;
  const starId = winner.dataset.starId;
  // Find the actual star object matching this id
  const star = STARS.find((s) => s.id === starId) || rollStar();
  finishSpin(star);
}

function finishSpin(star) {
  spinning = false;
  $("skip-btn").classList.add("hidden");
  $("open-btn").disabled = false;

  const wasNew = !getObtained().includes(star.id);
  addObtained(star.id);
  renderPedia();

  const panel = $("result-panel");
  panel.className = "result-panel " + tierClass(star.tier) + (star.neutron ? " neutron" : "");
  panel.innerHTML = `
    <div class="result-glow"></div>
    <div class="result-name">${star.name}</div>
    <div class="result-class">${star.class}</div>
    <div class="result-tier">${TIER_LABELS[star.tier]}</div>
    ${wasNew ? '<div class="result-new">New discovery</div>' : ""}
  `;
  panel.classList.remove("hidden");
}

function init() {
  renderPedia();
  $("open-btn").addEventListener("click", spin);
  $("skip-btn").addEventListener("click", skipSpin);
}

init();