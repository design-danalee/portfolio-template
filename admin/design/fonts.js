// Curated Google Fonts for the Design panel pickers.
// KEEP IN SYNC with src/_data/fonts.js (the build-time copy).
export const FONTS = [
  { name: "Instrument Serif", query: "Instrument+Serif:ital@1", category: "Display" },
  { name: "Playfair Display", query: "Playfair+Display:ital,wght@0,400;0,700;1,400", category: "Display" },
  { name: "Fraunces", query: "Fraunces:ital,wght@0,400;0,600;1,400", category: "Display" },
  { name: "Libre Baskerville", query: "Libre+Baskerville:ital@0;1", category: "Display" },
  { name: "Space Grotesk", query: "Space+Grotesk:wght@400;500;700", category: "Display" },
  { name: "Schibsted Grotesk", query: "Schibsted+Grotesk", category: "Body" },
  { name: "Inter", query: "Inter:wght@400;500;700", category: "Body" },
  { name: "Work Sans", query: "Work+Sans:wght@400;500;700", category: "Body" },
  { name: "DM Sans", query: "DM+Sans:wght@400;500;700", category: "Body" },
  { name: "IBM Plex Sans", query: "IBM+Plex+Sans:wght@400;500;700", category: "Body" },
];

export function fontByName(name) {
  return FONTS.find((f) => f.name === name);
}
