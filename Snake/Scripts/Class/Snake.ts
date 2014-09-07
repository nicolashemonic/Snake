class Snake {

    //#region properties

    // constant values
    private defaultTopPosition: number = 250;
    private defaultLeftPosition: number = 0;
    private defaultLimbNumber: number = 5;
    private minSpeed: number = 40;
    private maxSpeed: number = 15;
    private speedDecrement: number = 1;
    private preysPerLevel: number = 5;
    private sandboxLeftBorderPosition: number = 0;
    private sandboxTopBorderPosition: number = 0;
    private sandboxRightBorderPosition: number = 500;
    private sandboxBottomBorderPosition: number = 500;
    private sandbox: JQuery = $("#sandbox");
    private maxLevel: number = (this.minSpeed - this.maxSpeed) / this.speedDecrement;

    // current values
    private speed: number = this.minSpeed;
    private isGameOver: boolean = false;
    private catchedPreys: number = 0;
    private level: number = 1;
    private moveLimbCurrentIndex: number = 0;
    private limbs: Limb[] = [];
    private timerToken: number;
    private orientation: Orientation = Orientation.Horizontal;
    private direction: Direction = Direction.Right;
    private prey: Prey;
    private previousKeydown: number = 0;

    //#endregion

    //#region constructor

    constructor() {
        this.createSnake();
        this.createPrey();

        $('#value-level').text(this.level);
        $(document).keydown(this.keydownHandler);
    }

    //#endregion

    //#region keydownHandler

    private keydownHandler = (event: JQueryEventObject): void => {
        var direction: Direction;

        if (this.previousKeydown == event.which || this.isGameOver) {
            return;
        }
        this.previousKeydown = event.which;

        switch (event.which) {
            case 37:
                direction = Direction.Left;
                break;
            case 38:
                direction = Direction.Top;
                break;
            case 39:
                direction = Direction.Right;
                break;
            case 40:
                direction = Direction.Bottom;
                break;
        }

        this.defineOrientationDirection(direction);
        this.moveLimb();
    }

    //#endregion

    //#region defineOrientation

    private defineOrientationDirection = (direction: Direction): void => {
        if (this.orientation == Orientation.Vertical && (direction == Direction.Left || direction == Direction.Right)) {
            this.orientation = Orientation.Horizontal;
            if (direction == Direction.Left) {
                this.direction = Direction.Left;
            }
            if (direction == Direction.Right) {
                this.direction = Direction.Right;
            }
        }
        if (this.orientation == Orientation.Horizontal && (direction == Direction.Top || direction == Direction.Bottom)) {
            this.orientation = Orientation.Vertical;
            if (direction == Direction.Top) {
                this.direction = Direction.Top;
            }
            if (direction == Direction.Bottom) {
                this.direction = Direction.Bottom;
            }
        }
    }

    //#endregion

    //#region createSnake

    private createSnake = () => {
        var currentLeft: number = this.defaultLeftPosition;
        var currentLimb: Limb;
        var limbTemplate: string;

        for (var i = 0; i <= this.defaultLimbNumber; i++) {
            currentLimb = new Limb();
            currentLeft = currentLimb.width + currentLeft;
            limbTemplate = _.template('<div id="limb" class="limb" style="top: { top }px; left: { left }px;"></div>',
                { top: this.defaultTopPosition, left: currentLeft }).toString();
            this.sandbox.append(limbTemplate);
            currentLimb.element = this.sandbox.find("#limb");
            currentLimb.element.removeAttr("id");
            currentLimb.isFirst = i === this.defaultLimbNumber;
            currentLimb.left = currentLeft;
            currentLimb.top = this.defaultTopPosition;
            this.limbs.push(currentLimb);
        }
    }

    //#endregion

    //#region createLimb

    private createLimb = (coordinate: ICoordinate) => {
        var limbTemplate: string;
        var limb = new Limb();

        limb.left = coordinate.left;
        limb.top = coordinate.top;
        limbTemplate = _.template('<div id="limb" class="limb" style="top: { top }px; left: { left }px;"></div>',
            { top: limb.top, left: limb.left }).toString();
        this.sandbox.append(limbTemplate);
        limb.element = this.sandbox.find("#limb");
        limb.element.removeAttr("id");
        this.limbs.push(limb);
    }

    //#endregion

    //#region getPreyPosition

    private getPreyPosition(): ICoordinate {
        var temp: ICoordinate = { left: 0, top: 0 };
        var position: ICoordinate = { left: 0, top: 0 };

        while (!position.left && !position.top) {
            temp.left = Math.round(_.random(20, 470) / 10) * 10;
            temp.top = Math.round(_.random(20, 470) / 10) * 10;
            if (!this.hasCollision(temp)) {
                position.left = temp.left;
                position.top = temp.top;
            }
        }
        return position;
    }

    //#endregion

    //#region createPrey

    private createPrey = () => {
        var preyTemplate: string;
        var prey = new Prey();
        var position = this.getPreyPosition();

        prey.left = position.left;
        prey.top = position.top;
        preyTemplate = _.template('<div id="prey" class="prey" style="top: { top }px; left: { left }px;"></div>',
            { top: prey.top, left: prey.left }).toString();
        this.sandbox.append(preyTemplate);
        prey.element = this.sandbox.find("#prey");
        prey.element.removeAttr("id");
        this.prey = prey;
    }

    //#endregion

    //#region getLimbPosition

    private getLimbPosition = (firstLimb: Limb): ICoordinate => {
        var left: number = 0;
        var top: number = 0;

        if (this.orientation == Orientation.Horizontal) {
            if (this.direction == Direction.Left) {
                left = firstLimb.left - firstLimb.width;
                top = firstLimb.top;
            }
            if (this.direction == Direction.Right) {
                left = firstLimb.left + firstLimb.width;
                top = firstLimb.top;
            }
        }

        if (this.orientation == Orientation.Vertical) {
            if (this.direction == Direction.Top) {
                left = firstLimb.left;
                top = firstLimb.top - firstLimb.width;
            }
            if (this.direction == Direction.Bottom) {
                left = firstLimb.left;
                top = firstLimb.top + firstLimb.width;
            }
        }

        return {
            left: left,
            top: top
        }
    }

    //#endregion

    //#region limbIsOutside

    private limbIsOutside = (moveLimbCoordinate: ICoordinate): boolean => {
        return moveLimbCoordinate.left < this.sandboxLeftBorderPosition ||
            moveLimbCoordinate.left >= this.sandboxRightBorderPosition ||
            moveLimbCoordinate.top < this.sandboxTopBorderPosition ||
            moveLimbCoordinate.top >= this.sandboxBottomBorderPosition;
    }

    //#endregion

    //#region limbCatchPrey

    private limbCatchPrey = (moveLimbCoordinate: ICoordinate): boolean => {
        return moveLimbCoordinate.left == this.prey.left && moveLimbCoordinate.top == this.prey.top;
    }

    //#endregion

    //#region hasCollision

    private hasCollision(coordinate: ICoordinate) {
        var bite = _.find(this.limbs, (limb: Limb) => {
            return limb.top == coordinate.top && limb.left == coordinate.left;
        });
        return typeof bite != "undefined";
    }

    //#endregion

    //#region moveLimb

    private moveLimb() {        
        var firstLimb: Limb;
        var moveLimb = this.limbs[this.moveLimbCurrentIndex];
        var moveLimbCoordinate: ICoordinate;

        firstLimb = _.find(this.limbs, (limb: Limb) => {
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
    }

    //#endregion

    //#region buildLevel

    private buildLevel = () => {
        this.catchedPreys++;
        if (this.catchedPreys === this.preysPerLevel) {
            this.catchedPreys = 0;
            this.level++;
            $('#value-level').text(this.level);

            if (this.level == this.maxLevel) {
                this.stop();
                alert('Bravo vous avez atteint le niveau maximum !');
                return;
            }

            this.speed = this.speed - this.speedDecrement;
            this.stop();
            this.start();
        }
    }

    //#endregion

    //#region start

    public start() {
        this.timerToken = setInterval(() => {
            this.moveLimb();
        }, this.speed);
    }

    //#endregion

    //#region stop

    public stop() {
        clearTimeout(this.timerToken);
    }

    //#endregion

}