function getRandomColor() {
    let color;
    let r, g, b, luminance;
    do {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
        luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        color = `rgb(${r},${g},${b})`;
    } while (luminance < 0.58); // Ensures sufficient contrast against black text

    return color;
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#more-work, #about, #contact").forEach((el) => {
        el.style.backgroundColor = getRandomColor();
    });
});