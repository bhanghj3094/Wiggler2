<template>
  <div id="homePage">
    <div id="main">
      <h1 id="title">{{ title }}</h1>
      <div id="rules">
        <p>{{ rule1 }}</p>
        <p>{{ rule2 }}</p>
        <p>{{ rule3 }}</p>
      </div>
      <div class="skin">
        <carousel id="skin" :per-page="3" :navigation-enabled="true">
          <slide v-on:click="changeskin(1)" id="slide">
            <p>Star</p>
            <img src='./star2.png' v-on:click="changeskin(1)"/>
          </slide>
          <slide v-on:click="changeskin(2)" id="slide">
            <p>Heart</p> 
            <img src='./snakebody.png' v-on:click="changeskin(2)"/>
          </slide>
          <slide v-on:click="changeskin(3)" id="slide">
            <p>Circle</p>
            <img src='./circle.png' v-on:click="changeskin(3)"/>
          </slide>
          <!-- <slide v-on:click="changeskin(4)" id="slide">
            <p>no Image Yet</p> -->
            <!-- <img src='./aa.png' v-on:click="changeskin(4)"/> -->
          <!-- </slide> -->
        </carousel>
        <div id="choice">
          <p>Your Choice:</p>
          <p>{{ skinNum }}</p>
        </div> 
      </div>
      <input id="nicknameInput" type="text" v-model="myName"
          v-bind:placeholder="name">            <!-- ref="nameInput" --> <!-- v-on:keyup.enter.prevent="gameRender()" -->
      <v-btn id="readyButton" color="#ea7420" round=true
            v-on:mouseenter="textChange()"
            v-on:mouseleave="textReChange()">
            <a style="text-decoration:none" :href="'http://143.248.36.116:9000/game?name='+myName+'&skin='+skinNum">{{ ready }}</a></v-btn>
      <div id="github">
        <a v-bind:href="git_repo">
          {{ git_repo }}
        </a>
      </div>
    </div>
    <div id="background"></div>
  </div>
</template>

<script>
import {Carousel, Slide} from 'vue-carousel'

export default {
  data () {
    return {
      title: 'wiggler',
      rule1: 'Pick up foods to begin',
      rule2: 'Careful, keep your heads up!',
      rule3: 'Shoot and run!',
      skin: 'choose your skin',
      skinNum: 0,
      name: 'Enter your name',
      myName: '',
      ready: 'Ready to wiggle?',
      // codes
      git_repo: 'https://github.com/bhanghj3094/MyWeb.git'
    }
  }, 
  methods: { // if run, all of the methods functions are called at once(?) but not really applying all results
    toast: function() {
      return 'Welcome!'
    },
    textChange: function() {
      this.ready = 'Oh, Yes~'
    },
    textReChange: function() {
      this.ready = 'Ready to wiggle?'
    },
    gameRender: function() {
      // render real game
      const userName = this.$refs.nameInput.value // list of all references in our page
      const router = this.$router
      router.push({ path: '/api/showGame', query: { userName: userName }})
    }, 
    changeskin: function(num) {
      this.skinNum = num
    }
  },
  components: {
    Carousel,
    Slide
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#background {
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  min-height: 870px;
  background-image: url('../assets/Background/EggPattern.jpg');
  background-size: cover;
  z-index: -1;
  opacity: 0.8;
}

#title {
  margin-top: 90px;
  text-align: center;
  font-size: 90px;
  font-family: 'Pacifico', cursive;
}

#rules {
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
  font-family: 'Hind Guntur', sans-serif;
}

#skin {
  margin-bottom: 15px;
  width: 500px;
  height: 200px;
  /* border: 1px solid black; */
  text-align: center;

  display: flex;
  align-items: center;
  justify-content: center;
}

#slide {
  font-weight: bold;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.VueCarousel-wrapper {
  height: 100px !important;
  overflow: visible !important;
}

.skin {
  width: 700px;
  height: 200px;
  /* border: 1px solid black; */

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#choice {
  font-size: 15px;
  font-weight: bold;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

#nicknameInput {
  margin-top: 10px;
  margin-bottom: 15px;
  width: 280px;
  height: 35px;
  text-align: center;
  background-color: beige;

  border-radius: 3px;
}

#readybutton{
  width: 150px;
  height: 20px;
}

#github {
  margin-top: 110px;
  font-weight: bold;
}
</style>
