<template>
  <div class="text-xs-center">
    <v-dialog v-model="isClick_start" persistent width="500">
      <v-card class="secondary">
        <v-card-title>
          <span class="headline">プレイヤー名を決定</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap row>
              <v-flex xs9>
                <span class="error--text">{{errorMessage}}</span>
                <v-text-field placeholder="プレイヤー名を決定" v-model="newUsername"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed center @click="() => {onClick_setUsername();}">決定</v-btn>
          <v-btn color="secondary" depressed @click="() => {onClick_start();}">
            <span class="black--text">キャンセル</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import firebase from "~/plugins/firebase";
const db = firebase.firestore();
export default {
  data: () => ({
    // form入力データ
    newUsername: "",
    errorMessage: ""
  }),
  methods: {
    // コメント追加
    onClick_setUsername() {
      if (!this.newUsername) {
        this.errorMessage = "名前を入力する必要があります";
        return;
      }
      this.onClick_start();
      this.$store.dispatch("onClick_setUsername", this.newUsername);
    },
    onClick_start() {
      this.$store.dispatch("onClick_start");
    }
  },
  computed: {
    isClick_start() {
      return this.$store.getters.isClick_start;
    }
  }
};
</script>