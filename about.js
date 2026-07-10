// "Other Data Points" dice roller. The list of facts is rendered into the page
// as data-fact attributes so the copy stays editable in the CMS.
(function () {
    const factEl = document.getElementById('random-fact');
    const rollBtn = document.getElementById('roll-dice');
    if (!factEl || !rollBtn) return;

    const facts = Array.from(document.querySelectorAll('#facts-data [data-fact]'))
        .map((el) => el.getAttribute('data-fact'));
    if (facts.length === 0) return;

    let rolling = false;
    rollBtn.addEventListener('click', () => {
        if (rolling) return;
        rolling = true;
        let ticks = 0;
        const spin = setInterval(() => {
            factEl.textContent = facts[Math.floor(Math.random() * facts.length)];
            ticks++;
            if (ticks > 12) {
                clearInterval(spin);
                let final;
                do {
                    final = facts[Math.floor(Math.random() * facts.length)];
                } while (final === factEl.textContent && facts.length > 1);
                factEl.textContent = final;
                rolling = false;
            }
        }, 60);
    });
})();
