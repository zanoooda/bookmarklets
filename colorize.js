javascript:(() => {
    const elements = document.querySelectorAll('*');
    const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
    const getRandomDelay = () => Math.random() < 0.2 
        ? Math.floor(Math.random() * 9000) + 1000 
        : Math.floor(Math.random() * 999) + 1;

    const changeColors = el => {
        el.style.backgroundColor = getRandomColor();
        el.style.color = getRandomColor();
        setTimeout(() => changeColors(el), getRandomDelay());
    };

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        setTimeout(() => changeColors(el), getRandomDelay());
    }
})();
