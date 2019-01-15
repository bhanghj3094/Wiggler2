<template>
  <div id='gameScreen'></div>
</template>

<script>
import 'pixi'
import 'p2'
import Phaser from 'phaser'


export default{
  name: 'phaser-game',
  props: {
    width: Number,
    height: Number
  },
  create () {
  },
  mounted () {
    let self = this
    if (this.game == null) {
      this.game = new Phaser.Game(1000, 700, Phaser.AUTO, this.$el, {
        preload: function preload () {
          self.preload(this)
        },
        create: function create () {
          self.create(this)
        },
        update: function update () {
          self.update(this)
        }
      })
    }
  },
  methods: {
    preload () {
      //load assets
      this.game.load.image('circle','@/Phaser/asset/circle.png');
    	this.game.load.image('shadow', '@/Phaser/asset/white-shadow.png');
    	this.game.load.image('background', '../Phaser/asset/tile.png');

    	this.game.load.image('eye-white', '../Phaser/asset/eye-white.png');
    	this.game.load.image('eye-black', '../Phaser/asset/eye-black.png');

      this.game.load.image('food', '../Phaser/asset/food.png');
      this.game.load.image('bullet', '../Phaser/asset/hex.png');
    },
    create () {
      // this.game.state.add('Game', Game);
      // this.game.state.start('Game');
    },
    update () {
    }
  },
  destroyed () {
    this.game.destroy()
  },
  data () {
    return {
      game: null
    }
  }
}
</script>

<style>
  #gameScreen {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* #gameScreen canvas {
    display: block;
    margin: 0 auto;
  } */
</style>