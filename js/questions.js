import { sci } from "./utils.js";

export const CONSTANTS = {
  G: 6.67e-11,
  ME: 5.97e24,
};

export const DEFAULT_PRESET = {
  label: "Default",
  bounds: {
    m:  { min: 500, max: 2000, step: 100 },
    r1: { min: 7.0e6, max: 9.0e6, step: 1e5 },
    r2: { min: 1.2e7, max: 2.0e7, step: 1e5 },
  },
};

export const BOUNDS = {
  m:  { min: 100, max: 5000, step: 50 },
  r1: { min: 6.6e6, max: 2.0e7, step: 1e5 },
  r2: { min: 8.0e6, max: 5.0e7, step: 1e5 },
};

const GMm = (g) => CONSTANTS.G * CONSTANTS.ME * g.m;

export const QUESTION_BANK = [
  // ================================================================
  // CARD 1: Items 7-8
  // ================================================================
  {
    id: "card-7-8",
    item: "7-8",
    title: "Items 7-8: Energy Changes Between Orbits",
    hints: [
      "The total mechanical energy of a circular orbit is U = -GMm/(2r).",
      "As r increases, KE decreases and the magnitude of PE decreases.",
    ],
    subQuestions: [
      {
        id: "a",
        label: "(a)",
        prompt: (g) =>
          `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is in a circular parking orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ from Earth's center and is moved to a higher circular orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Using $G = ${sci(CONSTANTS.G)}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$ and $M_E = ${sci(CONSTANTS.ME)}\\ \\text{kg}$, calculate the total mechanical energy $U_1$ in the initial orbit and $U_2$ in the higher orbit. Give each answer in joules to two significant figures.`,
        fields: [
          {
            id: "u1",
            kind: "numeric",
            label: "U1 (J)",
            placeholder: "e.g. -2.5e10",
            expected: (g) => -GMm(g) / (2 * g.r1),
          },
          {
            id: "u2",
            kind: "numeric",
            label: "U2 (J)",
            placeholder: "e.g. -1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2),
          },
        ],
        solution: (g) => {
          const U1 = -GMm(g) / (2 * g.r1);
          const U2 = -GMm(g) / (2 * g.r2);
          return {
            given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
            required: `$U_1$ and $U_2$`,
            equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
            substitution: `$U_1 = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r1)})}$, $U_2 = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r2)})}$`,
            solution: `$U_1 = ${sci(U1)}\\ \\text{J}$, $U_2 = ${sci(U2)}\\ \\text{J}$`,
            answer: `$U_1 = ${sci(U1)}\\ \\text{J}$ and $U_2 = ${sci(U2)}\\ \\text{J}$.`,
          };
        },
      },
      {
        id: "b",
        label: "(b)",
        prompt: () =>
          `Find the change in total energy $\\Delta U = U_2 - U_1$ in joules to two significant figures, then select whether energy was added to or removed from the satellite.`,
        fields: [
          {
            id: "du",
            kind: "numeric",
            label: "ΔU (J)",
            placeholder: "e.g. 1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2) - -GMm(g) / (2 * g.r1),
          },
          {
            id: "added",
            kind: "dropdown",
            label: "Is energy added or removed?",
            options: [
              { value: "added", text: "Energy is added" },
              { value: "removed", text: "Energy is removed" },
            ],
            correct: "added",
          },
        ],
        solution: (g) => {
          const U1 = -GMm(g) / (2 * g.r1);
          const U2 = -GMm(g) / (2 * g.r2);
          const dU = U2 - U1;
          return {
            given: `$U_1 = ${sci(U1)}\\ \\text{J}$, $U_2 = ${sci(U2)}\\ \\text{J}$`,
            required: `$\\Delta U$ and whether energy is added or removed`,
            equation: `$\\Delta U = U_2 - U_1$`,
            substitution: `$\\Delta U = (${sci(U2)}) - (${sci(U1)})$`,
            solution: `$\\Delta U = ${sci(dU)}\\ \\text{J}$. Since this is positive, energy is added.`,
            answer: `$\\Delta U = ${sci(dU)}\\ \\text{J}$. Energy is added to the satellite.`,
          };
        },
      },
      {
        id: "c",
        label: "(c)",
        prompt: (g) =>
          `As the satellite moves from $r_1 = ${sci(g.r1)}\\ \\text{m}$ to $r_2 = ${sci(g.r2)}\\ \\text{m}$, select what happens to its kinetic energy and to its gravitational potential energy. (This is a conceptual question, not a calculation.)`,
        fields: [
          {
            id: "ke",
            kind: "dropdown",
            label: "Kinetic energy",
            options: [
              { value: "increases", text: "Kinetic energy increases" },
              { value: "decreases", text: "Kinetic energy decreases" },
            ],
            correct: "decreases",
          },
          {
            id: "gpe",
            kind: "dropdown",
            label: "Gravitational potential energy",
            options: [
              { value: "increases", text: "Gravitational potential energy increases" },
              { value: "decreases", text: "Gravitational potential energy decreases" },
            ],
            correct: "increases",
          },
        ],
        solution: () => ({
          given: `The satellite moves from a smaller radius to a larger radius.`,
          required: `Direction of change of KE and GPE`,
          equation: `$KE = \\dfrac{G M_E m}{2 r}$, $PE = -\\dfrac{G M_E m}{r}$`,
          solution: `At larger $r$, $KE$ is smaller because the satellite moves more slowly. $PE$ becomes less negative, so it increases.`,
          answer: `Kinetic energy decreases and gravitational potential energy increases (becomes less negative).`,
        }),
      },
    ],
  },

  // ================================================================
  // CARD 2: Item 9
  // ================================================================
  {
    id: "card-9",
    item: "9",
    title: "Item 9: Mathematical Analysis",
    hints: [
      "The relationship U1 × r1 = U2 × r2 lets you solve for U2 once U1 is known.",
      "Keep extra digits during intermediate steps. Round only the final answer.",
    ],
    subQuestions: [
      {
        id: "a",
        label: "(a)",
        prompt: (g) =>
          `Use the relationship $U_1 r_1 = U_2 r_2$ to find the total mechanical energy $U_2$ at the higher radius $r_2 = ${sci(g.r2)}\\ \\text{m}$. First compute $U_1$ for $r_1 = ${sci(g.r1)}\\ \\text{m}$ with $U_1 = -GM_E m/(2r_1)$, then apply the relationship. Give each answer to two significant figures. *Hint: keep extra digits during intermediate calculations and round only the final answers.*`,
        fields: [
          {
            id: "u1",
            kind: "numeric",
            label: "U1 (J)",
            placeholder: "e.g. -2.5e10",
            expected: (g) => -GMm(g) / (2 * g.r1),
          },
          {
            id: "u2",
            kind: "numeric",
            label: "U2 (J)",
            placeholder: "e.g. -1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2),
          },
        ],
        solution: (g) => {
          const U1 = -GMm(g) / (2 * g.r1);
          const U2 = U1 * g.r1 / g.r2;
          return {
            given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
            required: `$U_1$ and $U_2$`,
            equation: `$U_1 = -\\dfrac{G M_E m}{2 r_1}$, then $U_2 = U_1 \\cdot \\dfrac{r_1}{r_2}$`,
            substitution: `$U_1 = ${sci(U1)}\\ \\text{J}$, $U_2 = (${sci(U1)})\\left(\\dfrac{${sci(g.r1)}}{${sci(g.r2)}}\\right)$`,
            solution: `$U_2 = ${sci(U2)}\\ \\text{J}$`,
            answer: `$U_1 = ${sci(U1)}\\ \\text{J}$ and $U_2 = ${sci(U2)}\\ \\text{J}$.`,
          };
        },
      },
      {
        id: "b",
        label: "(b)",
        prompt: (g) =>
          `Verify $U_2$ using $U = -GM_E m/(2r)$ with $r = r_2 = ${sci(g.r2)}\\ \\text{m}$. Then select whether the verification matches your value in (a) and what happens to the total mechanical energy as the radius increases.`,
        fields: [
          {
            id: "u2_verify",
            kind: "numeric",
            label: "U2 verified (J)",
            placeholder: "e.g. -1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2),
          },
          {
            id: "matches",
            kind: "dropdown",
            label: "Does it match (a)?",
            options: [
              { value: "matches", text: "Matches the value in (a)" },
              { value: "no", text: "Does not match the value in (a)" },
            ],
            correct: "matches",
          },
          {
            id: "trend",
            kind: "dropdown",
            label: "Total energy trend",
            options: [
              { value: "increases", text: "Total energy increases as r increases" },
              { value: "decreases", text: "Total energy decreases as r increases" },
            ],
            correct: "increases",
          },
        ],
        solution: (g) => {
          const U2 = -GMm(g) / (2 * g.r2);
          return {
            given: `$m = ${g.m}\\ \\text{kg}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
            required: `Verification of $U_2$, match status, and trend`,
            equation: `$U = -\\dfrac{G M_E m}{2 r}$`,
            substitution: `$U_2 = -\\dfrac{(${sci(CONSTANTS.G)})(${sci(CONSTANTS.ME)})(${g.m})}{2(${sci(g.r2)})}$`,
            solution: `$U_2 = ${sci(U2)}\\ \\text{J}$, which matches (a). As $r$ increases, $U$ becomes less negative, so it increases.`,
            answer: `The verification matches. As the radius increases, the total mechanical energy increases (becomes less negative).`,
          };
        },
      },
    ],
  },

  // ================================================================
  // CARD 3: Item 10
  // ================================================================
  {
    id: "card-10",
    item: "10",
    title: "Item 10: Satellite Mission Problem",
    hints: [
      "Use the same energy formulas from earlier items.",
      "KE in a circular orbit equals the magnitude of U in that same orbit.",
    ],
    subQuestions: [
      {
        id: "main",
        label: "",
        prompt: (g) =>
          `A satellite of mass $m = ${g.m}\\ \\text{kg}$ is in a parking orbit at $r_1 = ${sci(g.r1)}\\ \\text{m}$ and must be moved to an operational orbit at $r_2 = ${sci(g.r2)}\\ \\text{m}$. Determine the total mechanical energy in each orbit, the energy $\\Delta U$ that must be added, and the initial kinetic energy $KE_1$. Then compare $\\Delta U$ with $KE_1$. Give all numeric answers to two significant figures.`,
        fields: [
          {
            id: "u1",
            kind: "numeric",
            label: "U1 (J)",
            placeholder: "e.g. -2.5e10",
            expected: (g) => -GMm(g) / (2 * g.r1),
          },
          {
            id: "u2",
            kind: "numeric",
            label: "U2 (J)",
            placeholder: "e.g. -1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2),
          },
          {
            id: "du",
            kind: "numeric",
            label: "ΔU (J)",
            placeholder: "e.g. 1.2e10",
            expected: (g) => -GMm(g) / (2 * g.r2) - -GMm(g) / (2 * g.r1),
          },
          {
            id: "ke1",
            kind: "numeric",
            label: "KE1 (J)",
            placeholder: "e.g. 2.5e10",
            expected: (g) => GMm(g) / (2 * g.r1),
          },
          {
            id: "cmp",
            kind: "dropdown",
            label: "ΔU compared with KE1",
            options: [
              { value: "gt", text: "ΔU is greater than KE1" },
              { value: "lt", text: "ΔU is less than KE1" },
            ],
            correct: "lt",
          },
        ],
        solution: (g) => {
          const U1 = -GMm(g) / (2 * g.r1);
          const U2 = -GMm(g) / (2 * g.r2);
          const dU = U2 - U1;
          const KE1 = GMm(g) / (2 * g.r1);
          return {
            given: `$m = ${g.m}\\ \\text{kg}$, $r_1 = ${sci(g.r1)}\\ \\text{m}$, $r_2 = ${sci(g.r2)}\\ \\text{m}$`,
            required: `$U_1$, $U_2$, $\\Delta U$, $KE_1$, and the comparison`,
            equation: `$U = -\\dfrac{G M_E m}{2 r}$, $\\Delta U = U_2 - U_1$, $KE_1 = \\dfrac{G M_E m}{2 r_1}$`,
            substitution: `$U_1 = ${sci(U1)}\\ \\text{J}$, $U_2 = ${sci(U2)}\\ \\text{J}$, $\\Delta U = ${sci(dU)}\\ \\text{J}$, $KE_1 = ${sci(KE1)}\\ \\text{J}$`,
            solution: `Comparing the magnitudes, $\\Delta U = ${sci(dU)}\\ \\text{J}$ and $KE_1 = ${sci(KE1)}\\ \\text{J}$, so $\\Delta U < KE_1$.`,
            answer: `$U_1 = ${sci(U1)}\\ \\text{J}$, $U_2 = ${sci(U2)}\\ \\text{J}$, $\\Delta U = ${sci(dU)}\\ \\text{J}$, $KE_1 = ${sci(KE1)}\\ \\text{J}$. The added energy is less than the initial kinetic energy.`,
          };
        },
      },
    ],
  },
];
