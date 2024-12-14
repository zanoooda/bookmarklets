javascript:(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
    const getRandomDelay = () => Math.random() < 0.2 
        ? Math.floor(Math.random() * 9000) + 1000 
        : Math.floor(Math.random() * 999) + 1;

    // For each element, store when its next color change should occur
    const now = performance.now();
    const schedule = elements.map(el => ({ el, nextTime: now + getRandomDelay() }));

    function update(timestamp) {
        // Check if any element is due for a color change
        for (let i = 0; i < schedule.length; i++) {
            const item = schedule[i];
            if (timestamp >= item.nextTime) {
                // Change the colors
                item.el.style.backgroundColor = getRandomColor();
                item.el.style.color = getRandomColor();
                // Schedule the next color change
                item.nextTime = timestamp + getRandomDelay();
            }
        }

        // Keep the animation loop running
        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
})();
