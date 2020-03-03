<template>
  <v-app>
    <v-toolbar flat fixed app dark color="primary">
      <v-btn icon ripple @click="onClick_home">
        <v-icon color="secondary">home</v-icon>
      </v-btn>
      <v-toolbar-title class="secondary--text">部屋を選択する</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="JSON.stringify(userInfo) != '{}'" icon ripple depressed color="secondary" @click="isClick_addRoomDialog = !isClick_addRoomDialog">
        <v-icon color="primary">playlist_add</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content class="secondary">
      <addRoomDialog 
        v-if="JSON.stringify(userInfo) != '{}'" 
        :userInfo="userInfo" 
        :uid="uid"
        :visible="isClick_addRoomDialog"
        :invisible="() => {isClick_addRoomDialog = !isClick_addRoomDialog}"
        />
      <v-list class="roomList secondary">
        <v-list-tile
          avatar
          v-for="room in rooms"
          :key="room.id"
          class="roomListItem grey lighten-5"
        >
          <v-list-tile-avatar>
            <v-btn icon ripple large @click="() => onClickRoom(room.id)">
              <v-icon>play_circle_outline</v-icon>
            </v-btn>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-layout wrap row style="justify-content: center; align-items: center;">
              <v-list-tile-title>ジャンル: {{room.genre}}</v-list-tile-title>
              <v-list-tile-sub-title>ホストプレイヤー: {{room.hostPlayer}}</v-list-tile-sub-title>
            </v-layout>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-content>
    <v-footer app dark flat color="primary">
      <v-flex text-xs-center>
        <span class="text-secondary">&copy; 2019 ふりーうぃふぃ</span>
      </v-flex>
    </v-footer>
  </v-app>
</template>
<script>
import firebase from "~/plugins/firebase";
import addRoomDialog from "~/components/addRoomDialog";
import statusTag from "~/plugins/status";
const db = firebase.firestore();
export default {
  data() {
    return {
      rooms: [],
      uid: "",
      userInfo: {},
      isClick_addRoomDialog: false,
    };
  },
  components: {
    addRoomDialog
  },
  methods: {
    async onClickRoom(roomID) {
      let nextPlayerNumber;
      let vm = this;
      const docRef = db.collection("rooms").doc(roomID);
      await docRef.get().then(function(doc) {
        nextPlayerNumber = doc.data().playerNumber + 1;
      });
      docRef.update({ playerNumber: nextPlayerNumber });
      if (nextPlayerNumber == 3) {
        docRef.collection("roomInfo")
          .doc("roomInfo")
          .update({ status: statusTag.ready });
      }

      docRef.collection("playersInfo")
        .doc(this.uid)
        .set({ 
          number: nextPlayerNumber,
          score: 0, 
          username: vm.userInfo.username,
          avatar: vm.userInfo.avatar
        });
      db.collection("users")
        .doc(this.uid)
        .update({ currentRoomID: roomID });
      this.$router.push({ path: `/room/${roomID}` });
    },
    onClick_home() {
      this.$router.push({ path: `/` });
    },
    getUserInfo() {
      const vm = this
      const docRef = db.collection("users").doc(this.uid);
      docRef.get().then(function(doc) {
        const docs = doc.data()
        vm.userInfo = {
          currentRoomID: docs.currentRoomID,
          username: docs.username,
          avatar: docs.avatar || null
        }
      }).then(() => {
        if (vm.userInfo.currentRoomID != "") {
          this.$router.push({ path: `/room/${vm.userInfo.currentRoomID}` });
        }
      })
    },
    getRooms() {
      const vm = this;
      db.collection("rooms").where("terminated", "==", false).where("playerNumber", "<=", 6).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(async function(change) {
          const data = change.doc.data();
          if (change.type === "added") {
            let username;
            const docRef = db.collection("users").doc(data.hostPlayer);
            await docRef.get().then(function(doc) {
              username = doc.data().username;
            });
            vm.rooms.push({
              genre: data.genre,
              id: change.doc.id,
              hostPlayer: username
            });
          } else if (change.type === "removed") {
            vm.rooms = vm.rooms.filter(room => {
              return room.id != change.doc.id;
            });
          }
        });
      });
    }
  },
  created() {
    this.getRooms();
  },
  mounted() {
    if (firebase.auth().currentUser) {
      this.uid = firebase.auth().currentUser.uid;
      this.getUserInfo()
    } else {
      const vm = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          vm.uid = user.uid;
          vm.getUserInfo()
        } else {
          vm.$router.push({ path: `/` });
        }
      });
    }
  }
};
</script>

<style>
.roomList {
  margin: 5px 10px;
}
.roomListItem {
  padding: 8px 0;
  margin-bottom: 8px;
}
</style>
