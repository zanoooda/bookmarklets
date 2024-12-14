javascript:(() => {
    // Polyfill for requestAnimationFrame if not available
    if (typeof requestAnimationFrame !== 'function') {
        window.requestAnimationFrame = cb => setTimeout(cb, 16);
    }
    if (typeof cancelAnimationFrame !== 'function') {
        window.cancelAnimationFrame = id => clearTimeout(id);
    }

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

    const getRandomColor = () => {
        try {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        } catch (err) {
            console.error('Error generating random color:', err);
            return '#000000';
        }
    };
    
    const getRandomDelay = () => {
        try {
            return Math.floor(Math.random() * 1500) + 1; // 1 to 1500 ms
        } catch (err) {
            console.error('Error generating random delay:', err);
            return 500; // fallback
        }
    };

    const start = () => {
        let elements;
        try {
            elements = Array.from(document.querySelectorAll('*'));
        } catch (err) {
            console.error('Error querying elements:', err);
            return;
        }

        const now = performance.now();

        // On the very first start, record original inline styles
        if (!state.initialized) {
            for (const el of elements) {
                // Ensure el is a valid node
                if (el && el.getAttribute) {
                    state.originalStyles.set(el, el.getAttribute('style'));
                }
            }
            state.initialized = true;
        }

        // Schedule each element to start at a random time
        state.schedule = elements.map(el => ({
            el,
            nextTime: now + getRandomDelay(),
            mode: 'color'
        }));

        state.running = true;
        state.stopping = false;

        update(now);
    };

    const initiateStop = () => {
        if (state.stopping) return; // Already stopping
        const now = performance.now();
        state.stopping = true;
        // Schedule revert for each element
        for (const item of state.schedule) {
            item.nextTime = now + getRandomDelay();
            item.mode = 'revert';
        }
    };

    const finalizeStop = () => {
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        state.running = false;
        state.stopping = false;
        state.schedule = [];
    };

    const restoreOriginalStyle = (el) => {
        try {
            if (!el) return;
            const originalStyle = state.originalStyles.get(el);
            if (originalStyle === null) {
                el.removeAttribute('style');
            } else {
                el.setAttribute('style', originalStyle);
            }
        } catch (err) {
            console.error('Error restoring original style:', err);
        }
    };

    const applyRandomColor = (el) => {
        try {
            if (!el) return;
            el.style.backgroundColor = getRandomColor();
            el.style.color = getRandomColor();
        } catch (err) {
            console.error('Error applying random color:', err);
        }
    };

    const update = (timestamp) => {
        if (!state.running && !state.stopping) return;

        let newSchedule = [];

        try {
            for (const item of state.schedule) {
                const el = item.el;
                // Check if element still exists in DOM
                if (!el || !el.parentNode) {
                    // Element removed from DOM, skip
                    continue;
                }

                if (timestamp >= item.nextTime) {
                    if (item.mode === 'color' && state.running && !state.stopping) {
                        // Apply color and schedule next change
                        applyRandomColor(el);
                        item.nextTime = timestamp + getRandomDelay();
                        newSchedule.push(item);
                    } else if (item.mode === 'revert') {
                        // Revert original style
                        restoreOriginalStyle(el);
                        // No re-add, this element is done
                    } else {
                        // If mode is unknown, just keep it (should not happen)
                        newSchedule.push(item);
                    }
                } else {
                    // Not time yet, just keep it
                    newSchedule.push(item);
                }
            }
        } catch (err) {
            console.error('Error during update cycle:', err);
        }

        state.schedule = newSchedule;

        // If stopping and all elements reverted, finalize
        if (state.stopping && state.schedule.length === 0) {
            finalizeStop();
            return;
        }

        if (state.running || state.stopping) {
            state.rafId = requestAnimationFrame(update);
        }
    };

    // Toggle logic
    if (state.running && !state.stopping) {
        initiateStop();
    } else if (!state.running) {
        start();
    } else {
        // If it's running and stopping, just let it finish
        // or you could force immediate stop by finalizing if needed.
    }
})();
