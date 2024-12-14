javascript: (() => {
    document.querySelectorAll('*').forEach(el => {
        setTimeout(function () {
            el.style.backgroundColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
            el.style.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
            setTimeout(arguments.callee, Math.random() < 0.2 ? Math.floor(Math.random() * 9000) + 1000 : Math.floor(Math.random() * 999) + 1);
        }, Math.random() < 0.2 ? Math.floor(Math.random() * 9000) + 1000 : Math.floor(Math.random() * 999) + 1);
    });
})();