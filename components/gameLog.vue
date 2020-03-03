<template>
  <div style="height: 100%">
    <v-list style="height: 100%" class="scroll-y secondary log-container">
      <template v-for="item in logs" style="height:140px">
        <div :key="item.id">
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{item.message}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
        </div>
      </template>
    </v-list>
  </div>
</template>

<script>
import firebase from "~/plugins/firebase";
import phaseTag from "~/plugins/phase";
const db = firebase.firestore();
export default {
  components: {},
  methods: {
    getGameLogs() {
      const vm = this;
      const collectionRef = db.collection("rooms").doc(this.$route.params.id).collection("logs")
      collectionRef.orderBy("createdAt", "asc").onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
              vm.scrollEnd();
              const doc = change.doc.data();
              let createdMessage;
              let username
              switch (doc.phase) {
                case phaseTag.gameStarted:

                  createdMessage = "ゲームスタート！！";
                  vm.pushToLog("ゲームスタート！！", change.doc.id)
                  break;
                case phaseTag.targetDecided:

                  username = vm.getPlayerName(doc.uid)
                  console.log(username)
                  createdMessage = username + "がお題を決めました。"
                  vm.pushToLog(createdMessage, change.doc.id)
                  createdMessage = "ラウンドスタート！！"
                  vm.pushToLog(createdMessage, change.doc.id + "start")
                  break;
                case phaseTag.questioned:

                  username = vm.getPlayerName(doc.uid)
                  createdMessage = username + "が質問しました: " + doc.message;
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.answered:

                  username = vm.getPlayerName(doc.uid)
                  createdMessage = username + "が質問に答えました: " + doc.message;
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.guessed:

                  username = vm.getPlayerName(doc.uid)
                  if (doc.isCorrect) {
                    createdMessage = username + "が予想しました: " + doc.message + "(当たり)";
                  } else {
                    createdMessage = username + "が予想しました: " + doc.message + "(はずれ)";
                  }
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.roundEnded:

                  createdMessage = "ラウンドが終了しました！";
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.answer:

                  createdMessage = "答え: " + doc.message;
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.gameEnded:

                  createdMessage = "ゲームが終了しました！";
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                case phaseTag.nextMaster:

                  username = vm.getPlayerName(doc.uid)
                  createdMessage = "次のマスター: " + username;
                  vm.pushToLog(createdMessage, change.doc.id)
                  break;
                default:
                  break;
              }
              vm.scrollEnd();
            }
          });
        });
    },
    getPlayerName(uid) {
      console.log(this.playersInfo)
      const info = this.playersInfo.filter(item => {
        console.log(item.uid, uid)
        return item.uid == uid
      })
      return info[0].displayName || "名無し"
    },
    pushToLog(message, id) {
      this.logs.push({ message, id });
    },
    scrollEnd() {
      this.$nextTick(() => {
        const container = this.$el.querySelector(".log-container");
        container.scrollTop = container.scrollHeight;
      });
    }
  },
  data() {
    return {
      logs: [],
    };
  },
  mounted() {
    window.addEventListener('resize', this.scrollEnd)
    this.getGameLogs()
  },
  watch: {
    logs() {
      this.scrollEnd();
    }
  },
  props: {
    playersInfo: Array
  }
};
</script>