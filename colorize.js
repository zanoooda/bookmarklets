javascript: (() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
    const getRandomDelay = () =>
        Math.random() < 0.2
            ? Math.floor(Math.random() * 9000) + 1000
            : Math.floor(Math.random() * 999) + 1;

    const now = performance.now();
    const schedule = elements.map(el => ({ el, nextTime: now + getRandomDelay() }));

    const update = timestamp => {
        schedule.forEach(item => {
            if (timestamp >= item.nextTime) {
                item.el.style.backgroundColor = getRandomColor();
                item.el.style.color = getRandomColor();
                item.nextTime = timestamp + getRandomDelay();
            }
        });
        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
})();
