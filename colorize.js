javascript:(function(){
    var elements = document.querySelectorAll('*');
    
    function getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    function getRandomDelay() {
        return Math.random() < 0.2
            ? Math.floor(Math.random() * 9000) + 1000
            : Math.floor(Math.random() * 999) + 1;
    }

    function changeColors(el) {
        el.style.backgroundColor = getRandomColor();
        el.style.color = getRandomColor();
        setTimeout(function() {
            changeColors(el);
        }, getRandomDelay());
    }

    for (var i = 0; i < elements.length; i++) {
        (function(el) {
            setTimeout(function() {
                changeColors(el);
            }, getRandomDelay());
        })(elements[i]);
    }
})();
