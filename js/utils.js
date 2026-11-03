export function sci(x, sig = 2) {
  if (x === 0) return "0";
  const sign = x < 0 ? "-" : "";
  let abs = Math.abs(x);
  let exp = Math.floor(Math.log10(abs));
  let mant = abs / Math.pow(10, exp);
  let s = mant.toPrecision(sig);
  if (parseFloat(s) >= 10) {
    exp += 1;
    mant /= 10;
    s = mant.toPrecision(sig);
  }
  return `${sign}${s} \\times 10^{${exp}}`;
}

export function round2sf(x) {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const exp = Math.floor(Math.log10(abs));
  const factor = Math.pow(10, 1 - exp);
  return sign * Math.round(abs * factor) / factor;
}

export function parseNumber(str) {
  if (str == null) return NaN;
  let s = String(str)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[×xX*]/g, "*")
    .replace(/\^/g, "^");
  let m = s.match(/^(-?\d+\.?\d*)\*10\^(-?\d+)$/);
  if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
  m = s.match(/^(-?\d+\.?\d*)[eE](-?\d+)$/);
  if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
  const v = parseFloat(s);
  return isFinite(v) ? v : NaN;
}

export function approxEq(a, b) {
  if (!isFinite(a) || !isFinite(b)) return false;
  if (a === 0 && b === 0) return true;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) < 1e-9;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderRich(el, text) {
  el.innerHTML = window.marked ? window.marked.parse(text) : text;
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
}
