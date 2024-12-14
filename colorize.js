javascript:(() => {
    // Polyfill for requestAnimationFrame and cancelAnimationFrame if not available
    if (typeof requestAnimationFrame !== 'function') {
        window.requestAnimationFrame = cb => setTimeout(cb, 16);
    }
    if (typeof cancelAnimationFrame !== 'function') {
        window.cancelAnimationFrame = id => clearTimeout(id);
    }

    // Initialize global state if not already present
    if (!window.randomColorToggler) {
        window.randomColorToggler = {
            running: false,
            stopping: false,
            originalStyles: new Map(),
            schedule: [],
            rafId: null,
            initialized: false
        };
    }

    const state = window.randomColorToggler;

    // Function to generate a random color in hex format
    const getRandomColor = () => {
        try {
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            return color;
        } catch (e) {
            forceStop();
            return '#000000'; // Fallback color
        }
    };

    // Function to generate a random delay between 1ms and 1500ms
    const getRandomDelay = () => {
        try {
            return Math.floor(Math.random() * 1500) + 1; // 1 to 1500 ms
        } catch (e) {
            forceStop();
            return 500; // Fallback delay
        }
    };

    // Function to start the color animation
    const start = () => {
        try {
            const elements = Array.from(document.querySelectorAll('*'));
            const now = performance.now();

            // Store original inline styles if not already done
            if (!state.initialized) {
                for (const el of elements) {
                    if (el && el.getAttribute) {
                        state.originalStyles.set(el, el.getAttribute('style'));
                    }
                }
                state.initialized = true;
            }

            // Initialize schedule with a random start delay for each element
            state.schedule = elements.map(el => ({
                el,
                nextTime: now + getRandomDelay(),
                mode: 'color' // Mode can be 'color' or 'revert'
            }));

            state.running = true;
            state.stopping = false;

            update(now);
        } catch (e) {
            forceStop();
        }
    };

    // Function to initiate stopping the color animation
    const initiateStop = () => {
        if (state.stopping) return; // Prevent multiple stop initiations
        try {
            const now = performance.now();
            state.stopping = true;

            // Schedule each element to revert styles after a random delay
            for (const item of state.schedule) {
                item.nextTime = now + getRandomDelay();
                item.mode = 'revert';
            }
        } catch (e) {
            forceStop();
        }
    };

    // Function to finalize stopping and clean up state
    const finalizeStop = () => {
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        state.running = false;
        state.stopping = false;
        state.schedule = [];
    };

    // Function to restore the original inline style of an element
    const restoreOriginalStyle = (el) => {
        try {
            if (!el) return;
            const originalStyle = state.originalStyles.get(el);
            if (originalStyle === null) {
                el.removeAttribute('style');
            } else {
                el.setAttribute('style', originalStyle);
            }
        } catch (e) {
            // Silently handle errors
        }
    };

    // Function to apply random colors to an element
    const applyRandomColor = (el) => {
        try {
            if (!el) return;
            el.style.backgroundColor = getRandomColor();
            el.style.color = getRandomColor();
        } catch (e) {
            forceStop();
        }
    };

    // Function to forcefully stop animations and restore all styles
    const forceStop = () => {
        try {
            if (state.rafId) {
                cancelAnimationFrame(state.rafId);
                state.rafId = null;
            }

            // Restore all original styles
            for (const [el, originalStyle] of state.originalStyles.entries()) {
                if (originalStyle === null) {
                    el.removeAttribute('style');
                } else {
                    el.setAttribute('style', originalStyle);
                }
            }

            state.running = false;
            state.stopping = false;
            state.schedule = [];
        } catch (e) {
            // Silently handle errors
        }
    };

    // Update loop function
    const update = (timestamp) => {
        if (!state.running && !state.stopping) return;

        let newSchedule = [];

        try {
            for (const item of state.schedule) {
                const el = item.el;
                // Check if the element still exists in the DOM
                if (!el || !el.parentNode) {
                    continue;
                }

                if (timestamp >= item.nextTime) {
                    if (item.mode === 'color' && state.running && !state.stopping) {
                        // Apply random color and schedule next change
                        applyRandomColor(el);
                        item.nextTime = timestamp + getRandomDelay();
                        newSchedule.push(item);
                    } else if (item.mode === 'revert') {
                        // Restore original style
                        restoreOriginalStyle(el);
                        // Do not re-add to schedule, as it's reverted
                    } else {
                        // Unknown mode, keep in schedule
                        newSchedule.push(item);
                    }
                } else {
                    // Not time yet, keep in schedule
                    newSchedule.push(item);
                }
            }
        } catch (e) {
            forceStop();
        }

        state.schedule = newSchedule;

        // If stopping and all elements have reverted, finalize stop
        if (state.stopping && state.schedule.length === 0) {
            finalizeStop();
            return;
        }

        // Continue the animation loop if running or stopping
        if (state.running || state.stopping) {
            state.rafId = requestAnimationFrame(update);
        }
    };

    // Toggle logic: start or initiate stop
    if (state.running && !state.stopping) {
        initiateStop();
    } else if (!state.running) {
        start();
    }
})();
