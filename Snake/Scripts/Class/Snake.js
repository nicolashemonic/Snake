var Snake = (function () {
    //#endregion
    //#region constructor
    function Snake() {
        var _this = this;
        //#region properties
        // constant values
        this.defaultTopPosition = 250;
        this.defaultLeftPosition = 0;
        this.defaultLimbNumber = 5;
        this.minSpeed = 40;
        this.maxSpeed = 15;
        this.speedDecrement = 1;
        this.preysPerLevel = 5;
        this.sandboxLeftBorderPosition = 0;
        this.sandboxTopBorderPosition = 0;
        this.sandboxRightBorderPosition = 500;
        this.sandboxBottomBorderPosition = 500;
        this.sandbox = $("#sandbox");
        this.maxLevel = (this.minSpeed - this.maxSpeed) / this.speedDecrement;
        // current values
        this.speed = this.minSpeed;
        this.isGameOver = false;
        this.catchedPreys = 0;
        this.level = 1;
        this.moveLimbCurrentIndex = 0;
        this.limbs = [];
        this.orientation = 1 /* Horizontal */;
        this.direction = 3 /* Right */;
        this.previousKeydown = 0;
        //#endregion
        //#region keydownHandler
        this.keydownHandler = function (event) {
            var direction;

            if (_this.previousKeydown == event.which || _this.isGameOver) {
                return;
            }
            _this.previousKeydown = event.which;

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

            _this.defineOrientationDirection(direction);
            _this.moveLimb();
        };
        //#endregion
        //#region defineOrientation
        this.defineOrientationDirection = function (direction) {
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
        };
        //#endregion
        //#region createSnake
        this.createSnake = function () {
            var currentLeft = _this.defaultLeftPosition;
            var currentLimb;
            var limbTemplate;

            for (var i = 0; i <= _this.defaultLimbNumber; i++) {
                currentLimb = new Limb();
                currentLeft = currentLimb.width + currentLeft;
                limbTemplate = _.template('<div id="limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: _this.defaultTopPosition, left: currentLeft }).toString();
                _this.sandbox.append(limbTemplate);
                currentLimb.element = _this.sandbox.find("#limb");
                currentLimb.element.removeAttr("id");
                currentLimb.isFirst = i === _this.defaultLimbNumber;
                currentLimb.left = currentLeft;
                currentLimb.top = _this.defaultTopPosition;
                _this.limbs.push(currentLimb);
            }
        };
        //#endregion
        //#region createLimb
        this.createLimb = function (coordinate) {
            var limbTemplate;
            var limb = new Limb();

            limb.left = coordinate.left;
            limb.top = coordinate.top;
            limbTemplate = _.template('<div id="limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: limb.top, left: limb.left }).toString();
            _this.sandbox.append(limbTemplate);
            limb.element = _this.sandbox.find("#limb");
            limb.element.removeAttr("id");
            _this.limbs.push(limb);
        };
        //#endregion
        //#region createPrey
        this.createPrey = function () {
            var preyTemplate;
            var prey = new Prey();
            var position = _this.getPreyPosition();

            prey.left = position.left;
            prey.top = position.top;
            preyTemplate = _.template('<div id="prey" class="prey" style="top: { top }px; left: { left }px;"></div>', { top: prey.top, left: prey.left }).toString();
            _this.sandbox.append(preyTemplate);
            prey.element = _this.sandbox.find("#prey");
            prey.element.removeAttr("id");
            _this.prey = prey;
        };
        //#endregion
        //#region getLimbPosition
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
        //#endregion
        //#region limbIsOutside
        this.limbIsOutside = function (moveLimbCoordinate) {
            return moveLimbCoordinate.left < _this.sandboxLeftBorderPosition || moveLimbCoordinate.left >= _this.sandboxRightBorderPosition || moveLimbCoordinate.top < _this.sandboxTopBorderPosition || moveLimbCoordinate.top >= _this.sandboxBottomBorderPosition;
        };
        //#endregion
        //#region limbCatchPrey
        this.limbCatchPrey = function (moveLimbCoordinate) {
            return moveLimbCoordinate.left == _this.prey.left && moveLimbCoordinate.top == _this.prey.top;
        };
        //#endregion
        //#region buildLevel
        this.buildLevel = function () {
            _this.catchedPreys++;
            if (_this.catchedPreys === _this.preysPerLevel) {
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
        this.createSnake();
        this.createPrey();

        $('#value-level').text(this.level);
        $(document).keydown(this.keydownHandler);
    }
    //#endregion
    //#region getPreyPosition
    Snake.prototype.getPreyPosition = function () {
        var temp = { left: 0, top: 0 };
        var position = { left: 0, top: 0 };

        while (!position.left && !position.top) {
            temp.left = Math.round(_.random(20, 470) / 10) * 10;
            temp.top = Math.round(_.random(20, 470) / 10) * 10;
            if (!this.hasCollision(temp)) {
                position.left = temp.left;
                position.top = temp.top;
            }
        }
        return position;
    };

    //#endregion
    //#region hasCollision
    Snake.prototype.hasCollision = function (coordinate) {
        var bite = _.find(this.limbs, function (limb) {
            return limb.top == coordinate.top && limb.left == coordinate.left;
        });
        return typeof bite != "undefined";
    };

    //#endregion
    //#region moveLimb
    Snake.prototype.moveLimb = function () {
        var firstLimb;
        var moveLimb = this.limbs[this.moveLimbCurrentIndex];
        var moveLimbCoordinate;

        firstLimb = _.find(this.limbs, function (limb) {
            return limb.isFirst;
        });

        moveLimbCoordinate = this.getLimbPosition(firstLimb);

        if (this.limbIsOutside(moveLimbCoordinate) || this.hasCollision(moveLimbCoordinate)) {
            this.stop();
            this.isGameOver = true;
            return;
        }

        if (this.limbCatchPrey(moveLimbCoordinate)) {
            this.prey.element.remove();
            this.createPrey();
            this.createLimb(moveLimbCoordinate);
            this.buildLevel();
        }

        moveLimb.element.css({ left: moveLimbCoordinate.left, top: moveLimbCoordinate.top });
        moveLimb.left = moveLimbCoordinate.left;
        moveLimb.top = moveLimbCoordinate.top;
        firstLimb.isFirst = false;
        moveLimb.isFirst = true;

        if (this.moveLimbCurrentIndex >= this.limbs.length - 1) {
            this.moveLimbCurrentIndex = 0;
        } else {
            this.moveLimbCurrentIndex++;
        }
    };

    //#endregion
    //#region start
    Snake.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () {
            _this.moveLimb();
        }, this.speed);
    };

    //#endregion
    //#region stop
    Snake.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Snake;
})();
//# sourceMappingURL=Snake.js.map
