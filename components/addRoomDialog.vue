<template>
  <v-layout row justify-center>
    <v-dialog v-model="visible" persistent width="500">
      <v-card class="secondary">
        <v-card-title>
          <span class="headline">新しい部屋を作成</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 class="secondary">
                <span class="error--text">{{errorMessage}}</span>
                <v-select
                  v-model="genre"
                  :rules="[() => !!genre || 'ジャンルを選択してください']"
                  :items="genres"
                  placeholder="ジャンル"
                  required
                  attach
                  color="secondary"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed @click="() => {invisible(); addRoom();}">
            <span class="text-secondary">追加</span>
          </v-btn>
          <v-btn color="secondary" depressed @click="invisible">
            <span class="black--text">キャンセル</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import firebase from "~/plugins/firebase";
import statusTag from "~/plugins/status";
const db = firebase.firestore();
export default {
  name: "addRoom",
  data: () => ({
    // form入力データ
    genre: "",
    genres: ["人物", "ゲーム", "アニメ", "音楽", "なんでも"],
    errorMessage: ""
  }),
  methods: {
    // コメント追加
    async addRoom() {
      if (!this.genre) {
        return;
      }
      const vm = this;
      if (this.genre == "") return;
      // コメントをFirestoreへ登録
      db.collection("rooms")
        .add({
          genre: this.genre,
          hostPlayer: this.uid,
          playerNumber: 1,
          terminated: false
        })
        .then(function(docRef) {
          db.collection("rooms")
            .doc(docRef.id)
            .collection("roomInfo")
            .doc("roomInfo")
            .set({
              answer: "",
              master: "",
              asker: "",
              status: statusTag.wait,
              guessedNumber: 0,
              currentMaster: 1,
              currentAsker: 2
            });
          
          db.collection("rooms")
            .doc(docRef.id)
            .collection("playersInfo")
            .doc(vm.uid)
            .set({
              number: 1,
              score: 0,
              username: vm.userInfo.username,
              avatar: vm.userInfo.avatar
            });
          vm.$router.push({ path: `/room/${docRef.id}` });
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
      this.clear();
    },
    // Formの初期化
    clear() {
      this.genre = "";
    }
  },
  props: {
    uid: String,
    userInfo: Object,
    visible: Boolean,
    invisible: Function,
  }
};
</script>