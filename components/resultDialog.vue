<template>
  <v-dialog v-model="gameOver" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card class="secondary">
      <v-toolbar flat fixed app dark color="primary">
        <v-spacer/>
        <v-btn ripple round depressed color="secondary" @click="() => {onClick_exit()}">
          <span class="primary--text">ゲームから退室</span>
          <v-icon color="primary">exit_to_app</v-icon>
        </v-btn>
        <v-toolbar-title class="secondary--text">ゲーム結果</v-toolbar-title>
      </v-toolbar>
      <v-content>
        <v-container>
          <v-list class="secondary">
            <template v-for="player in players">
              <v-list-tile-avatar :key="player.avatar">
                <img
                  :src="item.avatar || 'https://cdn.discordapp.com/emojis/581012910189314048.png'"
                >
              </v-list-tile-avatar>
              <v-list-tile-content :key="player.name">
                <v-list-tile-title>{{player.rank}}, {{player.name}}</v-list-tile-title>
                <v-list-tile-sub-title>{{player.score}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </template>
          </v-list>
          <h1>※デザイン、まだ完成してないからテキトーなのは許せい。</h1>
        </v-container>
      </v-content>
    </v-card>
  </v-dialog>
</template>
<script>
import firebase from "~/plugins/firebase";
const db = firebase.firestore();
export default {
  data() {
    return {
      players: []
    };
  },
  methods: {
    onClick_exit() {
      this.$store.dispatch("onClick_exit");
    }
  },
  mounted() {
    const vm = this;
    let rank = 1;
    db.collection("rooms")
      .doc(this.$route.params.id)
      .collection("playersInfo")
      .orderBy("score", "desc")
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          vm.doc
            .data()
            .info.get()
            .then(function(playerInfo) {
              let username = playerInfo.data().username;
              let avatarImg = playerInfo.data().avatar;
              vm.players.push({
                name: username,
                avatar: avatarImg,
                standing: rank,
                score: doc.data().score
              });
              rank++;
            });
        });
      });
  },
  computed: {
    gameOver() {
      return this.$store.getters.gameOver;
    }
  }
};
</script>