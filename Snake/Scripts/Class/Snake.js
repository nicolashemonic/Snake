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

var Orientation;
(function (Orientation) {
    Orientation[Orientation["None"] = 0] = "None";
    Orientation[Orientation["Horizontal"] = 1] = "Horizontal";
    Orientation[Orientation["Vertical"] = 2] = "Vertical";
})(Orientation || (Orientation = {}));

var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Left"] = 1] = "Left";
    Direction[Direction["Top"] = 2] = "Top";
    Direction[Direction["Right"] = 3] = "Right";
    Direction[Direction["Bottom"] = 4] = "Bottom";
})(Direction || (Direction = {}));

var Snake = (function () {
    function Snake() {
        var _this = this;
        this.orientation = 1 /* Horizontal */;
        this.direction = 3 /* Right */;
        this.defineOrientation = function (event) {
            var direction;

            if (_this.isGameOver) {
                return;
            }

            switch (event.which) {
                case 37:
                    direction = 1 /* Left */;
                    break;
                case 38:
                    direction = 2 /* Top */;
                    break;
                case 39:
                    direction = 3 /* Right */;
                    break;
                case 40:
                    direction = 4 /* Bottom */;
                    break;
            }

            if (_this.orientation == 2 /* Vertical */ && (direction == 1 /* Left */ || direction == 3 /* Right */)) {
                _this.orientation = 1 /* Horizontal */;
                if (direction == 1 /* Left */) {
                    _this.direction = 1 /* Left */;
                }
                if (direction == 3 /* Right */) {
                    _this.direction = 3 /* Right */;
                }
            }
            if (_this.orientation == 1 /* Horizontal */ && (direction == 2 /* Top */ || direction == 4 /* Bottom */)) {
                _this.orientation = 2 /* Vertical */;
                if (direction == 2 /* Top */) {
                    _this.direction = 2 /* Top */;
                }
                if (direction == 4 /* Bottom */) {
                    _this.direction = 4 /* Bottom */;
                }
            }

            _this.moveLimb();
        };
        this.createSnake = function () {
            var currentLeft = _this.leftDefault;
            var currentLimb;
            var limbTemplate;

            for (var i = 0; i <= _this.limbNumber; i++) {
                currentLimb = new Limb();
                currentLeft = currentLimb.width + currentLeft;
                limbTemplate = _.template('<div id="current-limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: _this.topDefault, left: currentLeft }).toString();
                _this.sandbox.append(limbTemplate);

                currentLimb.element = _this.sandbox.find("#current-limb");
                currentLimb.element.removeAttr("id");
                currentLimb.isFirst = i === _this.limbNumber;
                _this.limbs.push(currentLimb);
            }
        };
        this.createLimb = function (coordinate) {
            var limbTemplate;
            var limb = new Limb();

            limb.left = coordinate.left;
            limb.top = coordinate.top;
            limbTemplate = _.template('<div id="current-limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: limb.top, left: limb.left }).toString();
            _this.sandbox.append(limbTemplate);
            limb.element = _this.sandbox.find("#current-limb");
            limb.element.removeAttr("id");
            _this.limbs.push(limb);
        };
        this.createPrey = function () {
            var preyTemplate;
            var prey = new Prey();

            prey.left = Math.round(_.random(20, 470) / 10) * 10;
            prey.top = Math.round(_.random(20, 470) / 10) * 10;
            preyTemplate = _.template('<div id="current-prey" class="prey" style="top: { top }px; left: { left }px;"></div>', { top: prey.top, left: prey.left }).toString();
            _this.sandbox.append(preyTemplate);
            prey.element = _this.sandbox.find("#current-prey");
            prey.element.removeAttr("id");
            _this.prey = prey;
        };
        this.getLimbPosition = function (firstLimb) {
            var left = 0;
            var top = 0;

            if (_this.orientation == 1 /* Horizontal */) {
                if (_this.direction == 1 /* Left */) {
                    left = firstLimb.element.position().left - firstLimb.width;
                    top = firstLimb.element.position().top;
                }
                if (_this.direction == 3 /* Right */) {
                    left = firstLimb.element.position().left + firstLimb.width;
                    top = firstLimb.element.position().top;
                }
            }

            if (_this.orientation == 2 /* Vertical */) {
                if (_this.direction == 2 /* Top */) {
                    left = firstLimb.element.position().left;
                    top = firstLimb.element.position().top - firstLimb.width;
                }
                if (_this.direction == 4 /* Bottom */) {
                    left = firstLimb.element.position().left;
                    top = firstLimb.element.position().top + firstLimb.width;
                }
            }

            return {
                left: left,
                top: top
            };
        };
        this.limbIsOutside = function (moveLimbCoordinate) {
            return moveLimbCoordinate.left < _this.sandboxLeftBorder || moveLimbCoordinate.left >= _this.sandboxRightBorder || moveLimbCoordinate.top < _this.sandboxTopBorder || moveLimbCoordinate.top >= _this.sandboxBottomBorder;
        };
        this.LimbCatchPrey = function (moveLimbCoordinate) {
            return moveLimbCoordinate.left == _this.prey.left && moveLimbCoordinate.top == _this.prey.top;
        };
        this.buildLevel = function () {
            _this.catchedPreys++;
            if (_this.catchedPreys === 5) {
                _this.catchedPreys = 0;
                _this.level++;
                $('#value-level').text(_this.level);

                if (_this.level == _this.maxLevel) {
                    _this.stop();
                    alert('Bravo vous avez atteint le niveau maximum !');
                    return;
                }

                _this.speed = _this.speed - _this.speedDecrement;
                _this.stop();
                _this.start();
            }
        };
        this.isGameOver = false;
        this.minSpeed = 40;
        this.maxSpeed = 15;
        this.speed = this.minSpeed;
        this.speedDelta = this.minSpeed - this.maxSpeed;
        this.speedDecrement = 1;
        this.preysPerLevel = 5;
        this.maxLevel = this.speedDelta / this.speedDecrement;
        this.catchedPreys = 0;
        this.level = 1;
        $('#value-level').text(this.level);

        this.snakeWidth = 10;
        this.moveLimbCurrentIndex = 0;
        this.limbNumber = 5;
        this.topDefault = 250;
        this.leftDefault = 0;
        this.sandboxLeftBorder = 0;
        this.sandboxTopBorder = 0;
        this.sandboxRightBorder = 500;
        this.sandboxBottomBorder = 500;
        this.sandbox = $("#sandbox");
        this.limbs = [];
        this.createSnake();
        this.createPrey();
        $(document).keydown(this.defineOrientation);
    }
    Snake.prototype.moveLimb = function () {
        var firstLimb;
        var moveLimb = this.limbs[this.moveLimbCurrentIndex];
        var moveLimbCoordinate;

        firstLimb = _.find(this.limbs, function (limb) {
            return limb.isFirst;
        });

        moveLimbCoordinate = this.getLimbPosition(firstLimb);

        if (this.limbIsOutside(moveLimbCoordinate)) {
            this.stop();
            this.isGameOver = true;
            return alert('Game Over ;-(');
        }

        if (this.LimbCatchPrey(moveLimbCoordinate)) {
            this.prey.element.remove();
            this.createPrey();
            this.createLimb(moveLimbCoordinate);
            this.buildLevel();
        }

        moveLimb.element.css({ left: moveLimbCoordinate.left, top: moveLimbCoordinate.top });

        firstLimb.isFirst = false;
        moveLimb.isFirst = true;

        if (this.moveLimbCurrentIndex >= this.limbs.length - 1) {
            this.moveLimbCurrentIndex = 0;
        } else {
            this.moveLimbCurrentIndex++;
        }
    };

    Snake.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () {
            _this.moveLimb();
        }, this.speed);
    };

    Snake.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Snake;
})();
//# sourceMappingURL=Snake.js.map
