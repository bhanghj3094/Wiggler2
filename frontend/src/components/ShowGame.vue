<template>
  <div id="showGame">
    <p>{{ username }}</p>
    <PhaserGame />
  </div>
</template>


<script>
import PhaserGame from './PhaserGame.vue'

export default {
  name: 'showgame',
  components: { 
    'PhaserGame': PhaserGame
  }, 
  data () {
    return {
      username: this.$route.query.userName
    }
  }
}
</script>


<style scoped>
* {
  margin: 0;
  padding: 0;
}

#showGame {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
