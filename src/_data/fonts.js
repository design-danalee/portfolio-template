// Curated Google Fonts offered in the CMS Design panel.
// `query` is the exact google-fonts `family=` fragment (controls which weights/
// styles load). `category` groups them in the picker.
// KEEP IN SYNC with admin/design/fonts.js (the browser copy the panel uses).
module.exports = [
  // Display / heading fonts (look good large; several are used italic)
  { name: "Instrument Serif", query: "Instrument+Serif:ital@1", category: "Display" },
  { name: "Playfair Display", query: "Playfair+Display:ital,wght@0,400;0,700;1,400", category: "Display" },
  { name: "Fraunces", query: "Fraunces:ital,wght@0,400;0,600;1,400", category: "Display" },
  { name: "Libre Baskerville", query: "Libre+Baskerville:ital@0;1", category: "Display" },
  { name: "Space Grotesk", query: "Space+Grotesk:wght@400;500;700", category: "Display" },
  // Body / UI fonts
  { name: "Schibsted Grotesk", query: "Schibsted+Grotesk:wght@400;500;700", category: "Body" },
  { name: "Inter", query: "Inter:wght@400;500;700", category: "Body" },
  { name: "Work Sans", query: "Work+Sans:wght@400;500;700", category: "Body" },
  { name: "DM Sans", query: "DM+Sans:wght@400;500;700", category: "Body" },
  { name: "IBM Plex Sans", query: "IBM+Plex+Sans:wght@400;500;700", category: "Body" },
];
