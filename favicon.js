/* Pick a random food emoji as the favicon on each page load. */
const faviconEmojis = [
    "🍕", "🍝", "🍜", "🍣", "🍱", "🍔", "🌮", "🌯",
    "🥗", "🍤", "🥐", "🧀", "🍩", "🍪", "🍰", "🧁",
    "🍦", "🍓", "🍇", "🥑", "🍋", "🍑", "🍷", "🍸"
];

const emoji = faviconEmojis[Math.floor(Math.random() * faviconEmojis.length)];
const href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;

let link = document.querySelector("link[rel='icon']");
if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
}
link.href = href;
