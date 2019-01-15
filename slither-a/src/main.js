var game = new Phaser.Game(1890, 900, Phaser.AUTO, null);
game.state.add('Game', Game);
game.state.start('Game');
console.log("Game is Started");
