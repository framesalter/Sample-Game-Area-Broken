(function () {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let w = 0, h = 0;
  let rafId = null;
  let lastTime = 0;
  let time = 0;

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticles() {
    const count = Math.min(140, Math.max(50, Math.floor((w * h) / 16000)));
    particles = [];
    for (let i = 0; i < count; i++) {
      const big = Math.random() < 0.15;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: big ? Math.random() * 1.2 + 1.0 : Math.random() * 0.9 + 0.3,
        baseAlpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        hue: Math.random() < 0.7 ? 260 : 280,
      });
    }
  }

  function drawFrame(now) {
    const dt = lastTime ? Math.min((now - lastTime) / 16.67, 2) : 1;
    lastTime = now;
    time += dt;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      const tw = 0.6 + 0.4 * Math.sin(p.phase + time * 0.05 * p.twinkleSpeed);
      const alpha = p.baseAlpha * tw;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha * 0.15})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 85%, ${alpha})`;
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    rafId = requestAnimationFrame(drawFrame);
  }

  function drawOnce() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 85%, ${p.baseAlpha})`;
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function start() {
    stop();
    resize();
    makeParticles();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawOnce();
      return;
    }
    lastTime = 0;
    time = 0;
    rafId = requestAnimationFrame(drawFrame);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (w && h) ctx.clearRect(0, 0, w, h);
  }

  function isEnabled() {
    try {
      const raw = localStorage.getItem("sat.settings");
      const s = raw ? JSON.parse(raw) : {};
      return s.particles !== false;
    } catch (_) {
      return true;
    }
  }

  function apply() {
    if (isEnabled()) start();
    else stop();
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!rafId) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      makeParticles();
    }, 150);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (isEnabled()) start();
  });

  window.__particles = { apply, start, stop };
  apply();
})();
