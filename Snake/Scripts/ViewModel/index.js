/// TODO
/// Le serpent ne doit pas se mordre la queue
/// Une proie ne doit pas être générée sur le serpent
/// Classement par niveau
/// Coefficient de vitesse
/// Affichage d'un bouton retry
/// Niveau de difficulté
/// Un niveau donne accès à un nouveau monde (carte à thème)
/// Correction du bug de direction
/// Bug d'ecran ou de coordonnées en Y
_.templateSettings = {
    interpolate: /\{(.+?)\}/g
};

window.onload = function () {
    var snake = new Snake();
    snake.start();
};
//# sourceMappingURL=Index.js.map
