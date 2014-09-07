/// TODO

/// Classement par niveau
/// Coefficient de vitesse
/// Affichage d'un bouton retry
/// Un niveau donne accès à un nouveau monde (carte à thème)
/// Niveau de difficulté

_.templateSettings = {
    interpolate: /\{(.+?)\}/g
};

window.onload = () => {
    var snake = new Snake();
    snake.start();
};