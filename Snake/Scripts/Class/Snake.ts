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

enum Orientation {
    None,
    Horizontal,
    Vertical
}

enum Direction {
    None,
    Left,
    Top,
    Right,
    Bottom
}

interface ICoordinate {
    left: number;
    top: number;
}

class Snake {
    private timerToken: number;
    private snakeWidth: number;
    private moveLimbCurrentIndex: number;
    private limbNumber: number;
    private topDefault: number;
    private leftDefault: number;
    private sandboxLeftBorder: number;
    private sandboxTopBorder: number;
    private sandboxRightBorder: number;
    private sandboxBottomBorder: number;

    private level: number;
    private maxLevel: number;
    private speed: number;
    private speedDecrement: number;
    private minSpeed: number;
    private maxSpeed: number;
    private speedDelta: number;
    private catchedPreys: number;
    private preysPerLevel: number;
    private isGameOver: boolean;

    private sandbox: JQuery;
    private limbs: Limb[];
    private orientation: Orientation = Orientation.Horizontal;
    private direction: Direction = Direction.Right;
    private prey: Prey;

    constructor() {
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

    private defineOrientation = (event: JQueryEventObject): void => {
        var direction: Direction;

        if (this.isGameOver) {
            return;
        }

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

        this.moveLimb();
    }

    private createSnake = () => {
        var currentLeft: number = this.leftDefault;
        var currentLimb: Limb;
        var limbTemplate: string;

        for (var i = 0; i <= this.limbNumber; i++) {
            currentLimb = new Limb();
            currentLeft = currentLimb.width + currentLeft;
            limbTemplate = _.template('<div id="current-limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: this.topDefault, left: currentLeft }).toString();
            this.sandbox.append(limbTemplate);

            currentLimb.element = this.sandbox.find("#current-limb");
            currentLimb.element.removeAttr("id");
            currentLimb.isFirst = i === this.limbNumber;
            this.limbs.push(currentLimb);
        }
    }

    private createLimb = (coordinate: ICoordinate) => {
        var limbTemplate: string;
        var limb = new Limb();

        limb.left = coordinate.left;
        limb.top = coordinate.top;
        limbTemplate = _.template('<div id="current-limb" class="limb" style="top: { top }px; left: { left }px;"></div>', { top: limb.top, left: limb.left }).toString();
        this.sandbox.append(limbTemplate);
        limb.element = this.sandbox.find("#current-limb");
        limb.element.removeAttr("id");
        this.limbs.push(limb);
    }

    private createPrey = () => {
        var preyTemplate: string;
        var prey = new Prey();

        prey.left = Math.round(_.random(20, 470) / 10) * 10;
        prey.top = Math.round(_.random(20, 470) / 10) * 10;
        preyTemplate = _.template('<div id="current-prey" class="prey" style="top: { top }px; left: { left }px;"></div>', { top: prey.top, left: prey.left }).toString();
        this.sandbox.append(preyTemplate);
        prey.element = this.sandbox.find("#current-prey");
        prey.element.removeAttr("id");
        this.prey = prey;
    }

    private getLimbPosition = (firstLimb: Limb): ICoordinate => {
        var left: number = 0;
        var top: number = 0;

        if (this.orientation == Orientation.Horizontal) {
            if (this.direction == Direction.Left) {
                left = firstLimb.element.position().left - firstLimb.width;
                top = firstLimb.element.position().top;
            }
            if (this.direction == Direction.Right) {
                left = firstLimb.element.position().left + firstLimb.width;
                top = firstLimb.element.position().top;
            }
        }

        if (this.orientation == Orientation.Vertical) {
            if (this.direction == Direction.Top) {
                left = firstLimb.element.position().left;
                top = firstLimb.element.position().top - firstLimb.width;
            }
            if (this.direction == Direction.Bottom) {
                left = firstLimb.element.position().left;
                top = firstLimb.element.position().top + firstLimb.width;
            }
        }

        return {
            left: left,
            top: top
        }
    }

    private limbIsOutside = (moveLimbCoordinate: ICoordinate): boolean => {
        return moveLimbCoordinate.left < this.sandboxLeftBorder || moveLimbCoordinate.left >= this.sandboxRightBorder || moveLimbCoordinate.top < this.sandboxTopBorder || moveLimbCoordinate.top >= this.sandboxBottomBorder;
    }

    private LimbCatchPrey = (moveLimbCoordinate: ICoordinate): boolean => {
        return moveLimbCoordinate.left == this.prey.left && moveLimbCoordinate.top == this.prey.top;
    }

    private moveLimb() {        
        var firstLimb: Limb;
        var moveLimb = this.limbs[this.moveLimbCurrentIndex];
        var moveLimbCoordinate: ICoordinate;

        firstLimb = _.find(this.limbs, (limb: Limb) => {
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
    }

    private buildLevel = () => {
        this.catchedPreys++;
        if (this.catchedPreys === 5) {
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

    public start() {
        this.timerToken = setInterval(() => {
            this.moveLimb();
        }, this.speed);
    }

    public stop() {
        clearTimeout(this.timerToken);
    }

}