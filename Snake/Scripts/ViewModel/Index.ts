/// TODO

/// (default) level 
/// start / restart / stop
/// Leveling: niveler la difficulté pour une progression plus longue
/// Un niveau donne accès à un nouveau monde (carte à thème)
/// Niveau de difficulté
/// A partir du niveau maximum le snake continu de grandir mais sans aller plus vite
/// Ou: le snake avance plus vite après plus de proies attrapées

_.templateSettings = {
    interpolate: /\{(.+?)\}/g
};

(function () {
    var snake: Snake;

    function start() {
        snake.start();
    }

    function stop() {
        snake.stop();
    }

    $(document).ready(() => {
        snake = new Snake();
        $('#button-start').on('click', start);
        $('#button-stop').on('click', stop);
    });
})();

