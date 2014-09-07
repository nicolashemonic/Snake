/// TODO

/// Une proie ne doit pas être générée sur le serpent
/// Classement par niveau
/// Coefficient de vitesse
/// Affichage d'un bouton retry
/// Niveau de difficulté
/// Un niveau donne accès à un nouveau monde (carte à thème)

_.templateSettings = {
    interpolate: /\{(.+?)\}/g
};

window.onload = () => {
    var snake = new Snake();
    snake.start();
};