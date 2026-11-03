export const STARS = [
  // COMMON (5 stars, 14% each)
  { id: "wise-0855", name: "WISE 0855", class: "Brown Dwarf", tier: "common" },
  { id: "proxima", name: "Proxima Centauri", class: "Red Dwarf", tier: "common" },
  { id: "alpha-cen-b", name: "Alpha Centauri B", class: "Orange Dwarf", tier: "common" },
  { id: "sol", name: "Sol", class: "Yellow Dwarf", tier: "common" },
  { id: "tau-ceti", name: "Tau Ceti", class: "Yellow Dwarf", tier: "common" },

  // RARE (4 stars, 5% each)
  { id: "sirius-b", name: "Sirius B", class: "White Dwarf", tier: "rare" },
  { id: "arcturus", name: "Arcturus", class: "Red Giant", tier: "rare" },
  { id: "aldebaran", name: "Aldebaran", class: "Red Giant", tier: "rare" },
  { id: "pollux", name: "Pollux", class: "Orange Giant", tier: "rare" },

  // LEGENDARY (5 stars, 1.6% each)
  { id: "capella-aa", name: "Capella Aa", class: "Yellow Giant", tier: "legendary" },
  { id: "spica", name: "Spica", class: "Blue Giant", tier: "legendary" },
  { id: "betelgeuse", name: "Betelgeuse", class: "Red Supergiant", tier: "legendary" },
  { id: "antares", name: "Antares", class: "Red Supergiant", tier: "legendary" },
  { id: "psr-b1919", name: "PSR B1919+21", class: "Neutron Star", tier: "legendary", neutron: true },

  // MYTHIC (4 stars, 0.5% each)
  { id: "rigel", name: "Rigel", class: "Blue Supergiant", tier: "mythic" },
  { id: "alnitak", name: "Alnitak", class: "Blue Supergiant", tier: "mythic" },
  { id: "rho-cas", name: "Rho Cassiopeiae", class: "Yellow Hypergiant", tier: "mythic" },
  { id: "psr-j0348", name: "PSR J0348+0432", class: "Neutron Star", tier: "mythic", neutron: true },
];

export const TIER_WEIGHTS = {
  common: 70,
  rare: 20,
  legendary: 8,
  mythic: 2,
};

export const TIER_LABELS = {
  common: "Common",
  rare: "Rare",
  legendary: "Legendary",
  mythic: "Mythic",
};

export function rollStar() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let pickedTier = "common";
  for (const [tier, weight] of Object.entries(TIER_WEIGHTS)) {
    cumulative += weight;
    if (roll < cumulative) { pickedTier = tier; break; }
  }
  const pool = STARS.filter((s) => s.tier === pickedTier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomReelItem() {
  return STARS[Math.floor(Math.random() * STARS.length)];
}