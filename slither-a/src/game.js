var Game = {};

Game.init = function(){
  game.stage.disableVisibilityChange = true;
};

Game.preload = function() {

    //load assets
  this.game.load.image('circle','asset/star2.png');
  this.game.load.image('shadow', 'asset/white-shadow.png');
  this.game.load.image('background', 'asset/Smoke.png');

  this.game.load.image('eye-white', 'asset/eye-white.png');
  this.game.load.image('eye-black', 'asset/eye-black.png');

    this.game.load.image('food', 'asset/stars.png');
    this.game.load.image('bullet', 'asset/bullet.png');
};
//set world bounds, add a background, start P2 physics, and add a snake
Game.create = function() {
    var width = this.game.width;
    var height = this.game.height;
    /*
    setBounds(x: top left most corner of the world, y: top left most corner of the world, 
    width: new width of the game world in pixels, height: new height of the game world in pixels.)
    */
    this.game.world.setBounds(-width, -height, width*2, height*2);
  this.game.stage.backgroundColor = '#747d8c';

    //add tilesprite background
    var background = this.game.add.tileSprite(-width, -height,
        this.game.world.width, this.game.world.height, 'background');

    //initialize physics and groups
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.foodGroup = this.game.add.group();
    this.snakeHeadCollisionGroup = this.game.physics.p2.createCollisionGroup();
    this.foodCollisionGroup = this.game.physics.p2.createCollisionGroup();

    //add food randomly
    for (var i = 0 ; i < 100 ; i++) {
        this.initFood(Util.randomInt(-width, width), Util.randomInt(-height, height));
    }

    this.game.snakes = [];

    //create player
    var snake = new PlayerSnake(this.game, 'circle', 0, 0);
    console.log("Create Me!!");
    this.game.camera.follow(snake.head);

    //create bots
    //new BotSnake(this.game, 'circle', this.game.world.randomX, this.game.world.randomY);
    new BotSnake(this.game, 'circle', 400, 100);
    new BotSnake(this.game, 'circle', -400, -100);
    new BotSnake(this.game, 'circle', 600, -200);
    new BotSnake(this.game, 'circle', -600, 200);


    //initialize snake groups and collision
    for (var i = 0 ; i < this.game.snakes.length ; i++) {
        var snake = this.game.snakes[i];
        snake.head.body.setCollisionGroup(this.snakeHeadCollisionGroup);
        snake.head.body.collides([this.foodCollisionGroup]);
        //callback for when a snake is destroyed
        snake.addDestroyedCallback(this.snakeDestroyed, this);
    }
};
/**
 * Main update loop
 */
Game.update = function() {
    //update game components
    for (var i = this.game.snakes.length - 1 ; i >= 0 ; i--) {
        this.game.snakes[i].update();
    }
    for (var i = this.foodGroup.children.length - 1 ; i >= 0 ; i--) {
        var f = this.foodGroup.children[i];
        f.food.update();
    }
};
/**
 * Create a piece of food at a point
 * @param  {number} x x-coordinate
 * @param  {number} y y-coordinate
 * @return {Food}   food object created
 */
Game.initFood = function(x, y) {
    var f = new Food(this.game, x, y);
    f.sprite.body.setCollisionGroup(this.foodCollisionGroup);
    this.foodGroup.add(f.sprite);
    f.sprite.body.collides([this.snakeHeadCollisionGroup]);
    return f;
};
Game.snakeDestroyed = function(snake) {
    //place food where snake was destroyed
    for (var i = 0 ; i < snake.headPath.length;
    i += Math.round(snake.headPath.length / snake.snakeLength) * 2) {
        this.initFood(
            snake.headPath[i].x + Util.randomInt(-10,10),
            snake.headPath[i].y + Util.randomInt(-10,10)
        );
    }
};

