const cursor = document.createElement("div");
cursor.classList.add("custom-cursor");
document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
});

/* Scale cursor on hover for interactive elements */
document.querySelectorAll("a, button, .case-study").forEach((el) => {
    el.classList.add("actionable");
    el.addEventListener("mouseenter", () => {
        cursor.style.width = "40px";
        cursor.style.height = "40px";
    });
    el.addEventListener("mouseleave", () => {
        cursor.style.width = "16px";
        cursor.style.height = "16px";
    });
});

/* Custom effect when hovering over navigation items */
document.querySelectorAll(".nav-item").forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
        cursor.style.transition = "none";  // Disable transition for instant movement
        cursor.style.top = `${e.clientY}px`;
        cursor.style.left = `${e.clientX}px`;
        cursor.style.width = "100%";
        cursor.style.height = "100%";
        cursor.style.borderRadius = "1.5rem";
        cursor.style.backgroundColor = "black";
    });

    el.addEventListener("mouseleave", () => {
        cursor.style.width = "16px";
        cursor.style.height = "16px";
        cursor.style.borderRadius = "50%";
        cursor.style.backgroundColor = "white";
    });
});