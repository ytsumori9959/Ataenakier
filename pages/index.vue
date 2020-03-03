<template>
  <v-app>
    <usernameDialog/>
    <infoDialog :visible="infoDialogVisble" :invisible="onClick_info" />
    <editProfileDialog :uid="uid" v-if="uid"/>
    <v-toolbar flat fixed app dark color="primary">
      <v-btn v-if="uid" @click="onClick_editProfileDialog">プロフィールを編集</v-btn>
      <v-spacer/>
      <v-btn depressed icon @click="() => {onClick_info();}">
        <v-icon color="secondary">info</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content class="secondary">
      <v-container fluid fill-height>
        <v-layout align-center justify-center column>
          <h1 class="display-4">Ataenakier</h1>
          <v-btn
            dark
            depressed
            large
            round
            color="primary"
            center
            @click="() => {onClick_start();}"
          >プレイする</v-btn>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app dark flat color="primary">
      <v-flex text-xs-center>
        <span class="text-secondary">&copy; 2019 ふりーうぃふぃ</span>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
import usernameDialog from "~/components/usernameDialog";
import infoDialog from "~/components/infoDialog";
import editProfileDialog from "~/components/editProfileDialog";
import firebase from "~/plugins/firebase";
const db = firebase.firestore();
export default {
  components: {
    usernameDialog,
    infoDialog,
    editProfileDialog
  },
  data() {
    return {
      uid: "",
      usernameExisted: false,
      loaded: false,
      infoDialogVisble: false,
    };
  },
  mounted() {
    const vm = this;
    if (firebase.auth().currentUser) {
      this.uid = firebase.auth().currentUser.uid;
      const docRef = db.collection("users").doc(this.uid);
      docRef.get().then(docSnapshot => {
        if (docSnapshot.exists) {
          // User is registered but not stored in firestore
          vm.usernameExisted = true;
        }
      });
    } else {
      const vm = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is registered
          vm.uid = user.uid;
          const docRef = db.collection("users").doc(user.uid);
          docRef.get().then(docSnapshot => {
            if (docSnapshot.exists) {
              // User is registered but not stored in firestore
              vm.usernameExisted = true;
            }
          });
        } else {
          vm.signIn();
        }
      });
    }
  },
  computed: {
    isClick_setUsername() {
      return this.$store.getters.isClick_setUsername;
    }
  },
  methods: {
    signIn() {
      firebase
        .auth()
        .signInAnonymously()
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
        });
    },
    onClick_start() {
      if (this.usernameExisted) {
        this.$router.push({ path: `/roomList` });
      } else {
        this.$store.dispatch("onClick_start");
      }
    },
    onClick_info() {
      this.infoDialogVisble = !this.infoDialogVisble
    },
    onClick_editProfileDialog() {
      this.$store.dispatch("onClick_editProfileDialog");
    }
  },
  watch: {
    async isClick_setUsername(val) {
      const vm = this;
      db.collection("users")
        .doc(this.uid)
        .set({
          username: vm.isClick_setUsername,
          currentRoomID: ""
        });
      this.$router.push({ path: `/roomList` });
    }
  }
};
</script>