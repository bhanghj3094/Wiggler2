/**
 * Player of the core snake for controls
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 */
PlayerSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.cursors = game.input.keyboard.createCursorKeys();

    //handle the space key so that the player's snake can speed up
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.spaceKeyDown, this);
    spaceKey.onUp.add(this.spaceKeyUp, this);

    var ctrlKey = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    ctrlKey.onDown.add(this.ctrlKeyDown, this);
    ctrlKey.onUp.add(this.ctrlKeyUp, this);

    this.addDestroyedCallback(function() {
        spaceKey.onDown.remove(this.spaceKeyDown, this);
        spaceKey.onUp.remove(this.spaceKeyUp, this);
    }, this);

    this.addDestroyedCallback(function() {
        ctrlKey.onDown.remove(this.ctrlKeyDown, this);
        ctrlKey.onUp.remove(this.ctrlKeyUp, this);
    }, this);

}

PlayerSnake.prototype = Object.create(Snake.prototype);
PlayerSnake.prototype.constructor = PlayerSnake;

//make this snake light up and speed up when the space key is down
PlayerSnake.prototype.spaceKeyDown = function() {
    this.speed = this.fastSpeed;
    this.shadow.isLightingUp = true;
}
//make the snake slow down when the space key is up again
PlayerSnake.prototype.spaceKeyUp = function() {
    this.speed = this.slowSpeed;
    this.shadow.isLightingUp = false;
}

PlayerSnake.prototype.ctrlKeyUp = function() {
    //this.launching_pad.alpha = 0;
}

PlayerSnake.prototype.ctrlKeyDown = function() {
    //bullet 발사 추가
    var headX = this.launching_pad.body.x;
    var headY = this.launching_pad.body.y;
    var headX1 = this.head.body.x;
    var headY1 = this.head.body.y;
    var shoot = this.game.add.sprite(headX, headY, 'bullet');
    this.game.physics.p2.enable(shoot, this.debug);
    shoot.body.collideWorldBounds = false;

    shoot.body.setCollisionGroup(this.collisionGroup);
    shoot.body.collides([]);
    this.sectionGroup.add(shoot);
    //this.sections.push(shoot);

    this.game.physics.p2.gravity.y = 0;
    this.game.physics.p2.gravity.x = 0;
    shoot.tint = 0x00BFFF;

    var angle = Math.atan2(headY-headY1, headX-headX1);
    console.log(angle*180/Math.PI);
    var force = 1000;
    console.log(force*Math.cos(angle));
    console.log(force*Math.sin(angle));
    shoot.body.moveRight(force*Math.cos(angle));
    shoot.body.moveDown(force*Math.sin(angle));
}
/**
 * Add functionality to the original snake update method so that the player
 * can control where this snake goes
 */
PlayerSnake.prototype.tempUpdate = PlayerSnake.prototype.update;
PlayerSnake.prototype.update = function() {
    //find the angle that the head needs to rotate
    //through in order to face the mouse
    var mousePosX = this.game.input.activePointer.worldX;
    var mousePosY = this.game.input.activePointer.worldY;
    var headX = this.head.body.x;
    var headY = this.head.body.y;
    var angle = (180*Math.atan2(mousePosX-headX,mousePosY-headY)/Math.PI);
    if (angle > 0) {
        angle = 180-angle;
    }
    else {
        angle = -180-angle;
    }
    var dif = this.head.body.angle - angle;
    this.head.body.setZeroRotation();
    //allow arrow keys to be used
    if (this.cursors.left.isDown) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }
    else if (this.cursors.right.isDown) {
        this.head.body.rotateRight(this.rotationSpeed);
    }
    //decide whether rotating left or right will angle the head towards
    //the mouse faster, if arrow keys are not used
    else if (dif < 0 && dif > -180 || dif > 180) {
        this.head.body.rotateRight(this.rotationSpeed);
    }
    else if (dif > 0 && dif < 180 || dif < -180) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }

    //call the original snake update method
    this.tempUpdate();
}
