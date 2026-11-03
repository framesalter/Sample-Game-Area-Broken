import { sci } from "./utils.js";

export const CONSTANTS = {
  G: 6.67e-11,
  ME: 5.97e24,
};

export const PRESETS = {
  "small-leo-meo": {
    label: "Small satellite, LEO to MEO",
    givens: { m: 500, r1: 7.0e6, r2: 1.2e7 },
  },
  "standard-leo-meo": {
    label: "Standard satellite, LEO to MEO",
    givens: { m: 1000, r1: 8.0e6, r2: 1.6e7 },
  },
  "heavy-leo": {
    label: "Heavy satellite, LEO to MEO",
    givens: { m: 2500, r1: 7.0e6, r2: 2.0e7 },
  },
};

export const BOUNDS = {
  m: { min: 100, max: 5000, step: 50 },
  r1: { min: 6.6e6, max: 2.0e7, step: 1e5 },
  r2: { min: 8.0e6, max: 5.0e7, step: 1e5 },
};

const GMm = (g) => CONSTANTS.G * CONSTANTS.ME * g.m;

export const QUESTION_BANK = [
  // ---------- Item 7-8 ----------
  {
    id: "i78-u1",
    item: "7-8",
    format: "numeric",
    difficulty: 1,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is in a circular parking orbit of radius $r_1 = ${sci(g.r1)}\\ \\text{m}$ from Earth's center. Using $G = ${sci(CONSTANTS.G)}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$ and $M_E = ${sci(CONSTANTS.ME)}\\ \\text{kg}$, calculate the total mechanical energy $U_1$ of the satellite. Give your answer in joules to two significant figures.`,
    expected: (g) => -GMm(g) / (2 * g.r1),
    solution: (g) => {
      const U1 = -GMm(g) / (2 * g.r1);
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$`,
        required: `$U_1$`,
        equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
        substitution: `$U_1 = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r1)})}$`,
        solution: `$U_1 = ${sci(U1)}\\ \\text{J}$`,
        answer: `$U_1 = ${sci(U1)}\\ \\text{J}$`,
      };
    },
    hints: [
      "The total mechanical energy of a circular orbit is U = -GMm/(2r).",
      "Substitute the given mass and parking radius into the formula.",
    ],
  },
  {
    id: "i78-u2",
    item: "7-8",
    format: "numeric",
    difficulty: 1,
    prompt: (g) =>
      `The same satellite of mass $m = ${g.m}\\ \\text{kg}$ is moved to a higher circular orbit of radius $r_2 = ${sci(g.r2)}\\ \\text{m}$. Calculate its total mechanical energy $U_2$ in this orbit, in joules to two significant figures.`,
    expected: (g) => -GMm(g) / (2 * g.r2),
    solution: (g) => {
      const U2 = -GMm(g) / (2 * g.r2);
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
        required: `$U_2$`,
        equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
        substitution: `$U_2 = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r2)})}$`,
        solution: `$U_2 = ${sci(U2)}\\ \\text{J}$`,
        answer: `$U_2 = ${sci(U2)}\\ \\text{J}$`,
      };
    },
    hints: ["Use the same formula as before, but replace r1 with r2."],
  },
  {
    id: "i78-du",
    item: "7-8",
    format: "numeric",
    difficulty: 2,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ moves from a circular parking orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ to a higher circular orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Calculate the change in total mechanical energy $\\Delta U = U_2 - U_1$, in joules to two significant figures.`,
    expected: (g) => -GMm(g) / (2 * g.r2) - -GMm(g) / (2 * g.r1),
    solution: (g) => {
      const U1 = -GMm(g) / (2 * g.r1);
      const U2 = -GMm(g) / (2 * g.r2);
      const dU = U2 - U1;
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
        required: `$\\Delta U$`,
        equation: `$\\Delta U = U_2 - U_1$`,
        substitution: `$\\Delta U = (-${sci(Math.abs(U2)).replace("-", "")}) - (-${sci(Math.abs(U1)).replace("-", "")})$`,
        solution: `$\\Delta U = ${sci(dU)}\\ \\text{J}$`,
        answer: `$\\Delta U = ${sci(dU)}\\ \\text{J}$. Since this is positive, energy is added.`,
      };
    },
    hints: [
      "Compute U1 and U2 separately, then subtract U1 from U2.",
      "A positive result means energy is added to the satellite.",
    ],
  },
  {
    id: "i78-essay-kepe",
    item: "7-8",
    format: "essay",
    difficulty: 2,
    prompt: (g) =>
      `A satellite moves from a circular orbit of radius $r_1 = ${sci(g.r1)}\\ \\text{m}$ to a higher circular orbit of radius $r_2 = ${sci(g.r2)}\\ \\text{m}$. In one or two sentences, describe what happens to the satellite's kinetic energy and gravitational potential energy as it moves to the higher orbit.`,
    modelAnswer:
      "The kinetic energy decreases because the satellite moves more slowly at larger radius. The gravitational potential energy increases, that is, it becomes less negative, because the satellite is farther from Earth.",
    solution: (g) => ({
      given: `$r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
      required: `Describe the changes in KE and PE.`,
      equation: `$KE = \\dfrac{G M_E m}{2 r}$, $PE = -\\dfrac{G M_E m}{r}$`,
      substitution: `Both quantities depend on $1/r$. Since $r_2 > r_1$, $KE$ decreases and $PE$ becomes less negative.`,
      solution: `Kinetic energy decreases; gravitational potential energy increases.`,
      answer: `Kinetic energy decreases and gravitational potential energy increases (becomes less negative) when the satellite moves to the higher orbit.`,
    }),
    hints: [
      "Remember that orbital speed v = sqrt(GM/r) decreases as r increases.",
      "Potential energy is -GMm/r, which becomes less negative at larger r.",
    ],
  },

  // ---------- Item 9 ----------
  {
    id: "i9-direct",
    item: "9",
    format: "numeric",
    difficulty: 1,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is placed in a circular orbit of radius $r = ${sci(g.r1)}\\ \\text{m}$. Using $U = -G M_E m / (2r)$, calculate the total mechanical energy $U$ of the satellite, in joules to two significant figures.`,
    expected: (g) => -GMm(g) / (2 * g.r1),
    solution: (g) => {
      const U = -GMm(g) / (2 * g.r1);
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r = ${sci(g.r1)}\\ \\text{m}$`,
        required: `$U$`,
        equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
        substitution: `$U = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r1)})}$`,
        solution: `$U = ${sci(U)}\\ \\text{J}$`,
        answer: `$U = ${sci(U)}\\ \\text{J}$`,
      };
    },
    hints: ["Substitute m and r into U = -GMm/(2r)."],
  },
  {
    id: "i9-invert",
    item: "9",
    format: "numeric",
    difficulty: 2,
    prompt: (g) => {
      const U = -GMm(g) / (2 * g.r1);
      return `A satellite of mass $m = ${g.m}\\ \\text{kg}$ has a total mechanical energy $U = ${sci(U)}\\ \\text{J}$ in a circular orbit. Rearrange $U = -G M_E m / (2r)$ to find the orbital radius $r$, in metres to two significant figures.`;
    },
    expected: (g) => {
      const U = -GMm(g) / (2 * g.r1);
      return -GMm(g) / (2 * U);
    },
    solution: (g) => {
      const U = -GMm(g) / (2 * g.r1);
      const r = -GMm(g) / (2 * U);
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $U = ${sci(U)}\\ \\text{J}$`,
        required: `$r$`,
        equation: `$U = -\\dfrac{G M_E m}{2 r}$ so $r = -\\dfrac{G M_E m}{2 U}$`,
        substitution: `$r = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(U)})}$`,
        solution: `$r = ${sci(r)}\\ \\text{m}$`,
        answer: `$r = ${sci(r)}\\ \\text{m}$`,
      };
    },
    hints: [
      "Multiply both sides by 2r and divide by U to isolate r.",
      "Note that U is negative, so the two minus signs cancel.",
    ],
  },
  {
    id: "i9-ratio",
    item: "9",
    format: "numeric",
    difficulty: 2,
    prompt: (g) =>
      `A satellite is moved from a circular orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ to a higher circular orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Using $U = -G M_E m / (2r)$, calculate the ratio $U_2 / U_1$ to two significant figures.`,
    expected: (g) => g.r1 / g.r2,
    solution: (g) => {
      const ratio = g.r1 / g.r2;
      return {
        given: `$r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
        required: `$U_2 / U_1$`,
        equation: `$U_2 / U_1 = \\dfrac{-GMm/(2 r_2)}{-GMm/(2 r_1)} = \\dfrac{r_1}{r_2}$`,
        substitution: `$U_2 / U_1 = \\dfrac{${sci(g.r1)}}{${sci(g.r2)}}$`,
        solution: `$U_2 / U_1 = ${sci(ratio)}$`,
        answer: `$U_2 / U_1 = ${sci(ratio)}$`,
      };
    },
    hints: [
      "Write U1 and U2 using the formula and divide.",
      "The masses, G, M_E and the factor of 2 all cancel.",
    ],
  },
  {
    id: "i9-compare",
    item: "9",
    format: "comparison",
    difficulty: 1,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is placed at four different circular radii. The table shows the total mechanical energy at each radius.

| $r$ (m) | $U$ (J) |
|---|---|
| $1.0 \\times 10^7$ | $-1.99 \\times 10^{10}$ |
| $1.4 \\times 10^7$ | $-1.42 \\times 10^{10}$ |
| $2.0 \\times 10^7$ | $-9.96 \\times 10^9$ |
| $2.8 \\times 10^7$ | $-7.12 \\times 10^9$ |

Which statement correctly compares the total energy at the smallest and largest radii in the table?`,
    options: [
      "The total energy is more negative at the largest radius.",
      "The total energy is less negative (larger) at the largest radius.",
      "The total energy is the same at both radii.",
      "The comparison cannot be determined from the table.",
    ],
    correctIndex: 1,
    solution: () => ({
      given: "The table of r and U values.",
      required: "Compare U at the smallest and largest radii.",
      equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
      substitution: `At $r = 2.8 \\times 10^7$ m, $U = -7.12 \\times 10^9$ J, which is closer to zero than $-1.99 \\times 10^{10}$ J.`,
      solution: "U becomes less negative at larger radius, so it is larger.",
      answer: "The total energy is less negative (larger) at the largest radius.",
    }),
    hints: [
      "Compare how far each value is from zero.",
      "-7.12 times 10 to the 9 is closer to zero than -1.99 times 10 to the 10.",
    ],
  },

  // ---------- Item 10 ----------
  {
    id: "i10-du",
    item: "10",
    format: "numeric",
    difficulty: 2,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is moved from a parking orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ to an operational orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Calculate the total energy that must be added, $\\Delta U = U_2 - U_1$, in joules to two significant figures.`,
    expected: (g) => -GMm(g) / (2 * g.r2) - -GMm(g) / (2 * g.r1),
    solution: (g) => {
      const U1 = -GMm(g) / (2 * g.r1);
      const U2 = -GMm(g) / (2 * g.r2);
      const dU = U2 - U1;
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
        required: `$\\Delta U$`,
        equation: `$\\Delta U = U_2 - U_1 = -\\dfrac{G M_E m}{2}\\left(\\dfrac{1}{r_2} - \\dfrac{1}{r_1}\\right)$`,
        substitution: `$\\Delta U = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2}\\left(\\dfrac{1}{${sci(g.r2)}} - \\dfrac{1}{${sci(g.r1)}}\\right)$`,
        solution: `$\\Delta U = ${sci(dU)}\\ \\text{J}$`,
        answer: `$\\Delta U = ${sci(dU)}\\ \\text{J}$. This energy must be added.`,
      };
    },
    hints: [
      "Compute U1 and U2 first, then subtract.",
      "The engine burns in a real mission supply this energy.",
    ],
  },
  {
    id: "i10-ratio",
    item: "10",
    format: "numeric",
    difficulty: 2,
    prompt: (g) =>
      `A satellite of mass $m = ${g.m}\\ \\text{kg}$ starts in a circular orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ and is moved to a circular orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Calculate the ratio $KE_1 / \\Delta U$ of the initial kinetic energy to the total added energy, to two significant figures.`,
    expected: (g) => {
      const KE1 = GMm(g) / (2 * g.r1);
      const dU = -GMm(g) / (2 * g.r2) - -GMm(g) / (2 * g.r1);
      return KE1 / dU;
    },
    solution: (g) => {
      const KE1 = GMm(g) / (2 * g.r1);
      const U1 = -GMm(g) / (2 * g.r1);
      const U2 = -GMm(g) / (2 * g.r2);
      const dU = U2 - U1;
      const ratio = KE1 / dU;
      return {
        given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
        required: `$KE_1 / \\Delta U$`,
        equation: `$KE_1 = \\dfrac{G M_E m}{2 r_1}$, $\\Delta U = -\\dfrac{G M_E m}{2}\\left(\\dfrac{1}{r_2} - \\dfrac{1}{r_1}\\right)$`,
        substitution: `$KE_1 = ${sci(KE1)}\\ \\text{J}$, $\\Delta U = ${sci(dU)}\\ \\text{J}$`,
        solution: `$KE_1 / \\Delta U = ${sci(ratio)}$`,
        answer: `$KE_1 / \\Delta U = ${sci(ratio)}$. The added energy is about $1/${sci(ratio)}$ of the initial kinetic energy.`,
      };
    },
    hints: [
      "KE1 uses the same formula as |U1| in a circular orbit.",
      "Divide the initial kinetic energy by the total energy added.",
    ],
  },
  {
    id: "i10-essay",
    item: "10",
    format: "essay",
    difficulty: 2,
    prompt: (g) =>
      `A mission moves a satellite of mass $m = ${g.m}\\ \\text{kg}$ from $r_1 = ${sci(g.r1)}\\ \\text{m}$ to $r_2 = ${sci(g.r2)}\\ \\text{m}$. In one or two sentences, explain why the total energy added $\\Delta U$ is smaller than the satellite's initial kinetic energy $KE_1$.`,
    modelAnswer:
      "The initial kinetic energy is the full kinetic energy of the satellite in the parking orbit. The added energy only needs to cover the difference between the total energies of the two circular orbits, and the final kinetic energy is smaller than the initial kinetic energy. Therefore the added energy equals the increase in potential energy minus the decrease in kinetic energy, which is less than the initial kinetic energy.",
    solution: (g) => ({
      given: `$r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
      required: "Explain why the added energy is less than the initial kinetic energy.",
      equation: `$\\Delta U = U_2 - U_1$, $KE_1 = |U_1|$`,
      substitution: `Since the satellite ends up moving slower, some of the initial kinetic energy is released and offsets part of the added energy.`,
      solution: `The net energy added is the increase in potential energy minus the decrease in kinetic energy.`,
      answer: "The engine only supplies the net change in total energy. Because the satellite loses kinetic energy when it moves to the higher orbit, the net energy added is less than the initial kinetic energy.",
    }),
    hints: [
      "Think about what happens to KE as the satellite moves outward.",
      "The net energy supplied equals the difference between the two total energies.",
    ],
  },
  {
    id: "i10-compare",
    item: "10",
    format: "comparison",
    difficulty: 2,
    prompt: (g) =>
      `Two missions use satellites of the same mass $m = ${g.m}\\ \\text{kg}$ and start from the same parking orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$.

| Mission | Final radius $r_2$ (m) |
|---|---|
| A | $${sci(g.r2)}$ |
| B | $${sci(1.5 * g.r2)}$ |

Which mission requires more added energy $\\Delta U$?`,
    options: [
      "Mission A requires more added energy.",
      "Mission B requires more added energy.",
      "Both missions require the same added energy.",
      "The comparison cannot be determined without the satellite mass.",
    ],
    correctIndex: 1,
    solution: (g) => ({
      given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$`,
      required: "Compare the added energy for the two missions.",
      equation: `$\\Delta U = -\\dfrac{G M_E m}{2}\\left(\\dfrac{1}{r_2} - \\dfrac{1}{r_1}\\right)$`,
      substitution: `For a fixed $r_1$, larger $r_2$ gives a larger $\\Delta U$. Mission B has the larger final radius.`,
      solution: "Mission B requires more added energy.",
      answer: "Mission B requires more added energy because its final radius is larger.",
    }),
    hints: [
      "For the same starting orbit, a larger final radius means a bigger change in total energy.",
      "Compare the r2 values in the table.",
    ],
  },
];
