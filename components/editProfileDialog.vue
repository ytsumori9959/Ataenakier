<template>
  <v-dialog v-model="isClick_editProfileDialog" persistent width="500">
    <v-card class="secondary">
      <v-card-title>
        <span class="headline">edit profile</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 class="secondary">
              <v-text-field v-model="name" label="username"></v-text-field>
              <v-text-field v-model="imageUrl" label="imageURL"></v-text-field>
              <input type="file" accept="image/*" ref="file" @change="upload">
              <span class="primary--text">{{Message}}</span>
              <v-list-tile-avatar>
                <img v-bind:src="imageUrl || 'https://cdn.discordapp.com/emojis/581012910189314048.png'">
              </v-list-tile-avatar>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="`${uploading ? 'error' : 'primary'}`" :disabled="uploading" depressed @click="editProfile">
          <span class="text-secondary">追加</span>
        </v-btn>
        <v-btn color="secondary" depressed @click="editProfileCancel">
          <span class="black--text">キャンセル</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import firebase from "~/plugins/firebase";
const db = firebase.firestore();
export default {
  props: {
    uid: String
  },
  computed: {
    isClick_editProfileDialog() {
      return this.$store.state.isClick_editProfileDialog
    }
  },
  data() {
    return {
      name: "",
      imageUrl: "",
      Message: "",
      uploading: false,
    }
  },
  mounted() {
    const vm = this
    db.collection("users").doc(this.uid).get().then((val)=>{
      const data = val.data()
      vm.name = data.username
      vm.imageUrl = data.avatar
    })
  },
  methods: {
    editProfile() {
      this.$store.dispatch("onClick_editProfileDialog")
      this.setUsername()
      this.setUserImage()
    },
    setUsername() {
      if(!this.name) {
        return
      }
      const vm = this
      db.collection("users")
        .doc(this.uid)
        .update({
          username: vm.name,
        })
    },
    setUserImage() {
      if(!this.imageUrl) {
        return
      }
      const vm = this
      db.collection("users")
        .doc(this.uid)
        .update({
          avatar: vm.imageUrl,
        })
    },
    editProfileCancel() {
      this.$store.dispatch("onClick_editProfileDialog")
    },
    upload() {
      this.Message = "アップロード中です"
      this.uploading = true
      const storageRef = firebase.storage().ref()
      const userImagesRef = storageRef.child(`userIMG/${this.uid}-${event.target.files[0].name}`)
      const vm = this
      userImagesRef.put(event.target.files[0]).then(async function(snapshot) {
        console.log(snapshot.ref.location.path);
        vm.imageUrl = await userImagesRef.getDownloadURL()
        vm.Message = "アップロードが完了しました"
        vm.uploading = false
      });
    }
  }
}
</script>

