/**
 * India-ready construction material categories for BuildMart AI.
 * Structure: primary categories with optional subcategories (parentId).
 */

export interface SeedCategory {
  name: string;
  description?: string;
  parentName?: string; // if set, resolved to parentId after parents are created
}

export const INDIA_SEED_CATEGORIES: SeedCategory[] = [
  // Primary
  { name: "Cement", description: "OPC, PPC, PSC – brands like UltraTech, ACC, Ambuja" },
  { name: "Steel", description: "TMT bars, structural steel, MS pipes & sheets" },
  { name: "Aggregates", description: "M-sand, river sand, jelly, crushed stone" },
  { name: "Bricks & Blocks", description: "Red bricks, fly ash bricks, AAC blocks" },
  { name: "Cement Products", description: "Pavers, pipes, precast slabs" },
  { name: "Hardware", description: "Nails, binding wire, shuttering, cutting & safety tools" },
  { name: "Electrical", description: "Wires, conduits, switches, fixtures" },
  { name: "Plumbing & Sanitary", description: "Pipes, fittings, sanitaryware" },
  { name: "Paints & Chemicals", description: "Paints, primers, adhesives, chemicals" },
  { name: "Roofing & Sheets", description: "Roofing sheets, cladding" },
  { name: "Finishing Materials", description: "Tiles, laminates, finishing products" },
  // Sub: Cement
  { name: "OPC", description: "Ordinary Portland Cement", parentName: "Cement" },
  { name: "PPC", description: "Portland Pozzolana Cement", parentName: "Cement" },
  { name: "PSC", description: "Portland Slag Cement", parentName: "Cement" },
  // Sub: Steel
  { name: "TMT Bars", description: "Thermo-mechanically treated bars", parentName: "Steel" },
  { name: "Structural Steel", description: "Angles, channels, beams", parentName: "Steel" },
  { name: "MS Pipes & Sheets", description: "Mild steel pipes and sheets", parentName: "Steel" },
  // Sub: Aggregates
  { name: "Sand", description: "M-sand, river sand", parentName: "Aggregates" },
  { name: "Jelly / Crushed Stone", description: "Coarse aggregate", parentName: "Aggregates" },
  // Sub: Bricks & Blocks
  { name: "Red Bricks", description: "Clay bricks", parentName: "Bricks & Blocks" },
  { name: "Fly Ash Bricks", description: "Fly ash bricks", parentName: "Bricks & Blocks" },
  { name: "AAC Blocks", description: "Autoclaved aerated concrete blocks", parentName: "Bricks & Blocks" },
];
