const FEED_OBJECTS = [
  { id: "asteroid", name: "Asteroid", points: 1, art: " . * .\n * * *\n . * ." },
  { id: "moon", name: "Moon", points: 2, art: " .---.\n(  o  )\n '---'" },
  { id: "planet", name: "Planet", points: 5, art: "  .---.\n (  o  )\n  '---'" },
  { id: "gas-giant", name: "Gas Giant", points: 10, art: "  .----.\n (  =  )\n--(    )--\n (  =  )\n  '----'" },
  { id: "star", name: "Star", points: 20, art: "  \\ | /\n   \\|/\n --***--\n   /|\\\n  / | \\" },
  { id: "supergiant", name: "Supergiant", points: 50, art: " \\ \\ | / /\n  \\ \\|/ /\n---*****---\n  / /|\\ \\\n / / | \\ \\" },
];

const DIMINISH_RATE = 0.06;
const DIMINISH_FLOOR = 0.2;

const state = {
  totalPoints: 0,
  objectsFed: 0,
  totalMass: 0,
  usage: {},
  whitehole: false,
};

const $ = (id) => document.getElementById(id);

function updateCounters() {
  $("stat-points").textContent = state.totalPoints.toFixed(1);
  $("stat-fed").textContent = state.objectsFed;
  $("stat-mass").textContent = state.totalMass.toFixed(1);
}

function gainFor(obj) {
  const count = state.usage[obj.id] || 0;
  const mult = Math.max(DIMINISH_FLOOR, 1 - count * DIMINISH_RATE);
  return Math.round(obj.points * mult * 10) / 10;
}

function animateFeed(art, fromX, fromY, rejected) {
  const el = document.createElement("pre");
  el.className = "feeding-art";
  el.textContent = art;
  el.style.left = fromX + "px";
  el.style.top = fromY + "px";
  document.body.appendChild(el);

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const dx = centerX - fromX;
  const dy = centerY - fromY;

  if (rejected) {
    el.classList.add("rejected");
    requestAnimationFrame(() => {
      el.style.transform = `translate(${-dx * 0.35}px, ${-dy * 0.35}px) scale(1.3) rotate(-30deg)`;
      el.style.opacity = "0";
    });
  } else {
    requestAnimationFrame(() => {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(0.1) rotate(540deg)`;
      el.style.opacity = "0";
    });
  }
  setTimeout(() => el.remove(), 1600);
}

function feed(obj, event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const fromX = rect.left + rect.width / 2;
  const fromY = rect.top + rect.height / 2;

  if (state.whitehole) {
    animateFeed(obj.art, fromX, fromY, true);
    showEjectMessage();
    return;
  }

  const gain = gainFor(obj);
  state.usage[obj.id] = (state.usage[obj.id] || 0) + 1;
  state.totalPoints += gain;
  state.objectsFed += 1;
  state.totalMass += obj.points;
  updateCounters();
  animateFeed(obj.art, fromX, fromY, false);
  flashGain(gain, fromX, fromY);
}

function flashGain(gain, x, y) {
  const el = document.createElement("span");
  el.className = "gain-pop";
  el.textContent = "+" + gain;
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

let ejectMessageTimer = null;
function showEjectMessage() {
  const el = $("eject-msg");
  el.classList.remove("hidden");
  el.textContent = "The white hole ejects matter. Feeding is impossible.";
  clearTimeout(ejectMessageTimer);
  ejectMessageTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

function toggleHole() {
  state.whitehole = !state.whitehole;
  document.body.classList.toggle("whitehole-mode", state.whitehole);
  const btn = $("easteregg-btn");
  btn.classList.toggle("white", state.whitehole);
  btn.setAttribute(
    "aria-label",
    state.whitehole ? "Turn back into a black hole" : "Mystery control"
  );
}

function buildFeedButtons() {
  const row = $("feed-row");
  row.innerHTML = "";
  FEED_OBJECTS.forEach((obj) => {
    const btn = document.createElement("button");
    btn.className = "feed-btn";
    btn.type = "button";
    const pre = document.createElement("pre");
    pre.className = "feed-art";
    pre.textContent = obj.art;
    const name = document.createElement("span");
    name.className = "feed-name";
    name.textContent = obj.name;
    btn.appendChild(pre);
    btn.appendChild(name);
    btn.addEventListener("click", (e) => feed(obj, e));
    row.appendChild(btn);
  });
}

function init() {
  updateCounters();
  buildFeedButtons();
  $("easteregg-btn").addEventListener("click", toggleHole);
}

init();