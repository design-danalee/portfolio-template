
let lastScroll = 0;
const header = document.getElementById("header");
const heroEl = document.querySelector(".wide-project-image, .introduction");
const heroImageHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
// Only use the white-text hero treatment when there's a dark image behind the header
const hasDarkHero = !!document.querySelector(".wide-project-image");

window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll) {
        header.classList.add("hidden-header");
    } else {
        header.classList.remove("hidden-header");
        if (currentScroll > heroImageHeight) {
            header.classList.add("scrolled-header");
            header.classList.remove("hero-header");
        } else {
            header.classList.remove("scrolled-header");
            if (hasDarkHero) {
                header.classList.add("hero-header");
            }
        }
    }
    lastScroll = currentScroll;
});
