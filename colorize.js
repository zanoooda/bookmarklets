javascript:(() => {
    if (!window.randomColorToggler) {
        window.randomColorToggler = {
            running: false,
            stopping: false,
            originalStyles: new WeakMap(),
            schedule: [],
            rafId: null,
            initialized: false
        };
    }

    const state = window.randomColorToggler;

    const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
    const getRandomDelay = () => Math.floor(Math.random() * 1500) + 1; // 1 to 1500 ms

    const start = () => {
        const elements = Array.from(document.querySelectorAll('*'));
        const now = performance.now();

        if (!state.initialized) {
            elements.forEach(el => {
                state.originalStyles.set(el, el.getAttribute('style'));
            });
            state.initialized = true;
        }

        // Schedule each element to start color changes at a random staggered time
        state.schedule = elements.map(el => ({
            el,
            nextTime: now + getRandomDelay(), 
            mode: 'color' // 'color' mode means actively changing colors
        }));

        state.running = true;
        state.stopping = false;
        update(now);
    };

    const initiateStop = () => {
        // When stopping, we don't cancel immediately.
        // Instead, we schedule each element to revert after a random delay.
        const now = performance.now();
        state.stopping = true;

        state.schedule.forEach(item => {
            item.nextTime = now + getRandomDelay(); 
            item.mode = 'revert'; // 'revert' mode means waiting to revert original styles
        });
    };

    const finalizeStop = () => {
        // Once all elements have reverted, we can clean up.
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        state.running = false;
        state.stopping = false;
        state.schedule = [];
    };

    const update = timestamp => {
        if (!state.running && !state.stopping) return;

        // We will build a new schedule after processing, 
        // to remove elements that have reverted.
        let newSchedule = [];

        for (const item of state.schedule) {
            if (timestamp >= item.nextTime) {
                if (item.mode === 'color' && state.running && !state.stopping) {
                    // Change to random colors
                    item.el.style.backgroundColor = getRandomColor();
                    item.el.style.color = getRandomColor();
                    // Schedule next color change
                    item.nextTime = timestamp + getRandomDelay();
                    newSchedule.push(item);
                } else if (item.mode === 'revert') {
                    // Revert to original styles
                    const originalStyle = state.originalStyles.get(item.el);
                    if (originalStyle === null) {
                        item.el.removeAttribute('style');
                    } else {
                        item.el.setAttribute('style', originalStyle);
                    }
                    // Do not re-add this element to the schedule, it's reverted
                } else {
                    // If we are in some state that doesn't match, just keep it if needed
                    // but ideally we covered all cases.
                    newSchedule.push(item);
                }
            } else {
                // Not yet time to trigger action, keep as is
                newSchedule.push(item);
            }
        }

        state.schedule = newSchedule;

        // If stopping and no elements left, finalize stop
        if (state.stopping && state.schedule.length === 0) {
            finalizeStop();
            return;
        }

        // Continue animation if running
        if (state.running || state.stopping) {
            state.rafId = requestAnimationFrame(update);
        }
    };

    // Toggle logic:
    // If currently running but not stopping, that means we want to stop.
    // If currently stopping or running, we handle accordingly.
    if (state.running && !state.stopping) {
        // Initiate the stop process
        initiateStop();
    } else if (state.running && state.stopping) {
        // Already stopping, do nothing. Wait until it finishes.
        // (If you want to force stop immediately, you'd modify logic here.)
    } else {
        // Not running, start now
        start();
    }
})();
