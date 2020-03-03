<template>
  <div>
    <v-list-tile avatar>
      <v-list-tile-avatar>
        <img :src="playerInfo.avatar || 'https://cdn.discordapp.com/emojis/581012910189314048.png'">
      </v-list-tile-avatar>

      <v-list-tile-content>
        <div>
          {{playerInfo.displayName}} &nbsp;score:&nbsp;{{playerInfo.score}}
          <v-icon color="yellow darken-3" v-if="isMaster">fas fa-crown</v-icon>
        </div>
      </v-list-tile-content>
    </v-list-tile>
    <v-divider></v-divider>
  </div>
</template>
<script>
import '@fortawesome/fontawesome-free/css/all.css'
export default {
  props: {
    playerInfo: Object,
    isMaster: Boolean
  }
};
</script>

