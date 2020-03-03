<template>
  <v-app>
    <v-toolbar flat fixed app dark color="primary" style="height:8vh">
      <v-spacer></v-spacer>
      <v-btn
        ripple
        round
        depressed
        color="secondary"
        @click="() => {onClick_exit()}"
        style="height:70%"
      >
        <span class="primary--text">ゲームから退室</span>
        <v-icon color="primary">exit_to_app</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content class="secondary" style="height: 88vh">
      <v-layout row wrap reverse style="height: 86%">
        <v-flex xs12 md3>
          <div class="matchInfo">
            <h4>ジャンル: {{genre}}</h4>
            <div v-if="master==uid">
              <h4>お題: {{answer}}</h4>
            </div>
            <h4>ラウンド: {{ currentMaster }}/{{ playerNumber }}</h4>
          </div>
          <v-divider></v-divider>
          <v-list two-line class="secondary">
            <template v-for="item in playersInfo">
              <playerPanel :key="item.uid" :playerInfo="item" :isMaster="currentMaster == item.number"/>
            </template>
          </v-list>
        </v-flex>

        <v-flex xs12 md9 style="height: 100%">
          <gameLog class="gameLog" :playersInfo="playersInfo" v-if="playersInfo.length == playerNumber && playerNumber >= 3"/>
        </v-flex>
      </v-layout>
      <v-divider/>
      <div style="height: 14%" class="panels">
        <div v-if="panel == 'answer'" class="panel">
          <answerPanel/>
        </div>
        <div v-else-if="panel == 'input'" class="panel">
          <inputPanel/>
        </div>
        <div v-else-if="panel == 'ready'" class="panel">
          <v-btn ripple round depressed color="primary" @click="() => {onClick_ready()}">
            <span class="text-secondary">ゲーム開始</span>
          </v-btn>
        </div>
        <div v-else>
          <waitPanel class="panel"/>
        </div>
      </div>

      <!-- <v-divider vertical/> -->
    </v-content>
    <v-footer app dark flat color="primary" style="height:4vh">
      <v-flex text-xs-center>
        <span class="text-secondary">&copy; 2019 ふりーうぃふぃ</span>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
import gameLog from "~/components/gameLog";
import answerPanel from "~/components/answerPanel";
import inputPanel from "~/components/inputPanel";
import waitPanel from "~/components/waitPanel";
import playerPanel from "~/components/playerPanel";
import resultDialog from "~/components/resultDialog";

import firebase from "~/plugins/firebase";
import statusTag from "~/plugins/status";
import phaseTag from "~/plugins/phase";

const db = firebase.firestore();
export default {
  components: {
    gameLog,
    answerPanel,
    inputPanel,
    waitPanel,
    playerPanel,
    resultDialog
  },
  data() {
    return {
      status: statusTag.wait,
      panel: "",
      answer: "",
      uid: "",
      genre: "",
      hostPlayer: "",
      master: "",
      asker: "",
      guessedNumber: 0,
      playerNumber: 0,
      currentMaster: 0,
      playersInfo: [],
      currentAsker: 0
    };
  },
  mounted() {
    db.settings({ timestampsInSnapshots: true });
    if (firebase.auth().currentUser) {
      this.uid = firebase.auth().currentUser.uid;
    } else {
      const vm = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          vm.uid = user.uid;
        } else {
          vm.$router.push({ path: `/` });
        }
        db.collection("users")
          .doc(vm.uid)
          .update({ currentRoomID: vm.$route.params.id });
      });
    }
    this.getRoomData();
  },
  methods: {
    getRoomData() {
      const vm = this;
      // Get room info
      const docRef = db.collection("rooms").doc(this.$route.params.id);
      docRef.get().then(function(doc) {
        vm.genre = doc.data().genre;
        vm.hostPlayer = doc.data().hostPlayer;
      });
      docRef.onSnapshot(function(doc) {
        vm.playerNumber = doc.data().playerNumber;
      });
      docRef
        .collection("roomInfo")
        .doc("roomInfo")
        .onSnapshot(function(doc) {
          const docs = doc.data()
          vm.status = docs.status;
          vm.master = docs.master;
          vm.asker = docs.asker;
          vm.guessedNumber = docs.guessedNumber;
          vm.currentMaster = docs.currentMaster;
          vm.currentAsker = docs.currentAsker;
          if (docs.answer) {
            vm.answer = docs.answer;
          }
        });
      // Get players' info in the room
      docRef.collection("playersInfo").onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          const doc = change.doc.data();
          if (change.type === "added") {
            vm.playersInfo.push({
              uid: change.doc.id,
              score: doc.score,
              number: doc.number,
              displayName: doc.username,
              avatar: doc.avatar
            })
          }
          if (change.type === "modified") {
            let index = vm.playersInfo.findIndex(
              item => item.uid == change.doc.id
            );
            vm.playersInfo[index].score = doc.score;
          }
        });
      });
    },
    // Figure out appropriate panel for the player
    findRightPanel(status) {
      this.$store.dispatch("set_status", status);
      // If status is OVER
      if (this.status == statusTag.over) {
        this.$store.dispatch("gameOver");
        db.collection("users")
          .doc(this.uid)
          .update({ currentRoomID: "" });
      }
      // If status is READY
      if (status == statusTag.ready && this.hostPlayer == this.uid) {
        let nextAsker = "";
        const vm = this;
        db.collection("rooms")
          .doc(this.$route.params.id)
          .collection("playersInfo")
          .where("number", "==", this.currentAsker)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              nextAsker = doc.id;
            });
          })
          .then(function() {
            db.collection("rooms")
              .doc(vm.$route.params.id)
              .collection("roomInfo")
              .doc("roomInfo")
              .update({ master: vm.uid, asker: nextAsker });
          });
        return "ready";
      }
      // If the player is a master
      if (this.master == this.uid) {
        switch (status) {
          case statusTag.decide:
            return "input";
          case statusTag.answer:
            return "answer";
          default:
            return "wait";
        }
      } else {
        switch (status) {
          case statusTag.ask:
            if (this.asker == this.uid) {
              return "input";
            }
            return "wait";
          case statusTag.guess:
            return "input";
          default:
            return "wait";
        }
      }
    },
    // Find next status based on current status
    getNextStatus(currentStatus) {
      if (currentStatus == 5) {
        return 3;
      } else {
        return currentStatus + 1;
      }
    },
    // Send an activity to db
    sendGameLog(message, uid, phase, bool = false) {
      const now = firebase.firestore.FieldValue.serverTimestamp();
      db.collection("rooms")
        .doc(this.$route.params.id)
        .collection("logs")
        .add({
          message: message,
          createdAt: now,
          uid: uid,
          phase: phase,
          isCorrect: bool
        });
    },
    checkAnswer(guess) {
      return this.answer == guess;
    },
    onClick_exit() {
      this.$store.dispatch("onClick_exit");
    },
    onClick_ready() {
      this.sendGameLog("", "", phaseTag.gameStarted);
      this.$store.dispatch("set_status", statusTag.decide);
    }
  },
  computed: {
    isClick_newInput() {
      return this.$store.getters.isClick_newInput;
    },
    answerValue() {
      return this.$store.getters.answerValue;
    },
    storeStatus() {
      return this.$store.getters.status;
    },
    isClick_exit() {
      return this.$store.getters.isClick_exit;
    }
  },
  watch: {
    status(val) {
      this.panel = this.findRightPanel(val);
    },
    guessedNumber(val) {
      // if all challengers guessed and you are master
      if (val == this.playerNumber - 1 && this.master == this.uid) {
        let guesses = [];
        let isTargetHitted = false;
        let scoredPlayerNum = 1;
        let scoredPlayers = [{ uid: this.uid }];
        const vm = this;
        db.collection("rooms")
          .doc(vm.$route.params.id)
          .collection("guesses")
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              guesses.push({
                uid: doc.id,
                guess: doc.data().guess,
                isCorrect: doc.data().isCorrect
              });
            });
          })
          .then(function() {
            // Check each guess from challengers
            guesses.forEach(function(element) {
              if (element.isCorrect) {
                vm.sendGameLog(
                  element.guess,
                  element.uid,
                  phaseTag.guessed,
                  true
                );
                isTargetHitted = true;
                scoredPlayerNum++;
                scoredPlayers.push({ uid: element.uid });
              } else {
                vm.sendGameLog(
                  element.guess,
                  element.uid,
                  phaseTag.guessed,
                  false
                );
              }
              db.collection("rooms")
                .doc(vm.$route.params.id)
                .collection("guesses")
                .doc(element.uid)
                .delete();
            });
            // If someone guessed correctly
            if (isTargetHitted) {
              // Update scores
              let score = 100 / scoredPlayerNum;
              let currentScore;
              scoredPlayers.forEach(function(element) {
                db.collection("rooms")
                  .doc(vm.$route.params.id)
                  .collection("playersInfo")
                  .doc(element.uid)
                  .get()
                  .then(function(doc) {
                    currentScore = doc.data().score;
                  })
                  .then(function() {
                    db.collection("rooms")
                      .doc(vm.$route.params.id)
                      .collection("playersInfo")
                      .doc(element.uid)
                      .update({ score: Math.round(score + currentScore) });
                  });
              });
              // Round ends
              vm.sendGameLog(vm.answer, "", phaseTag.answer);
              // If all rounds are done
              if (vm.currentMaster == vm.playerNumber) {
                vm.sendGameLog("", "", phaseTag.gameEnded);
                db.collection("rooms")
                  .doc(vm.$route.params.id)
                  .collection("roomInfo")
                  .doc("roomInfo")
                  .update({ status: statusTag.over });
                db.collection("users")
                  .doc(vm.uid)
                  .update({ currentRoomID: "" });
                return;
              }
              // If there are more rounds remaining
              let nextMaster;
              const nextMasterNum = vm.currentMaster + 1;
              db.collection("rooms")
                .doc(vm.$route.params.id)
                .collection("playersInfo")
                .where("number", "==", nextMasterNum)
                .get()
                .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    nextMaster = doc.id;
                  });
                })
                .then(function() {
                  vm.sendGameLog("", nextMaster, phaseTag.nextMaster);
                  let nextAsker = vm.asker;
                  let nextAskerNum = vm.currentAsker;
                  // Make sure next asker is not next master
                  if (nextAsker == nextMaster) {
                    nextAskerNum = vm.currentAsker + 1;
                    while (
                      nextAskerNum == nextMasterNum ||
                      nextAskerNum > vm.playerNumber
                    ) {
                      if (nextAskerNum > vm.playerNumber) {
                        nextAskerNum = 1;
                      } else {
                        nextAskerNum = nextAskerNum + 1;
                      }
                    }
                    db.collection("rooms")
                      .doc(vm.$route.params.id)
                      .collection("playersInfo")
                      .where("number", "==", nextAskerNum)
                      .get()
                      .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                          nextAsker = doc.id;
                        });
                      })
                      .then(function() {
                        db.collection("rooms")
                          .doc(vm.$route.params.id)
                          .collection("roomInfo")
                          .doc("roomInfo")
                          .update({
                            status: statusTag.decide,
                            guessedNumber: 0,
                            master: nextMaster,
                            currentMaster: nextMasterNum,
                            answer: "",
                            asker: nextAsker,
                            currentAsker: nextAskerNum
                          });
                        db.collection("users")
                          .doc(vm.uid)
                          .update({ currentRoomID: "" });
                        return;
                      });
                  }
                  db.collection("rooms")
                    .doc(vm.$route.params.id)
                    .collection("roomInfo")
                    .doc("roomInfo")
                    .update({
                      status: statusTag.decide,
                      guessedNumber: 0,
                      master: nextMaster,
                      currentMaster: nextMasterNum,
                      answer: "",
                      asker: nextAsker,
                      currentAsker: nextAskerNum
                    });
                  db.collection("users")
                    .doc(vm.uid)
                    .update({ currentRoomID: "" });
                  return;
                });
            } else {
              db.collection("rooms")
                .doc(vm.$route.params.id)
                .collection("roomInfo")
                .doc("roomInfo")
                .update({
                  status: vm.getNextStatus(vm.status),
                  guessedNumber: 0
                });
            }
          });
      }
    },
    async isClick_newInput(val) {
      if (val != "") {
        if (this.status == statusTag.guess) {
          let guessNum;
          const vm = this;
          db.collection("rooms")
            .doc(this.$route.params.id)
            .collection("guesses")
            .doc(this.uid)
            .set({ guess: val, isCorrect: this.checkAnswer(val) });
          db.collection("rooms")
            .doc(this.$route.params.id)
            .collection("roomInfo")
            .doc("roomInfo")
            .get()
            .then(function(doc) {
              guessNum = doc.data().guessedNumber;
            })
            .then(function() {
              db.collection("rooms")
                .doc(vm.$route.params.id)
                .collection("roomInfo")
                .doc("roomInfo")
                .update({ guessedNumber: guessNum + 1 });
            });
          this.panel = "wait";
          return;
        } else if (this.status == statusTag.ask) {
          let nextAsker;
          let nextAskerNum = this.currentAsker + 1;
          while (
            nextAskerNum == this.currentMaster ||
            nextAskerNum > this.playerNumber
          ) {
            if (nextAskerNum > this.playerNumber) {
              nextAskerNum = 1;
            } else {
              nextAskerNum = nextAskerNum + 1;
            }
          }
          const vm = this;
          db.collection("rooms")
            .doc(this.$route.params.id)
            .collection("playersInfo")
            .where("number", "==", nextAskerNum)
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                nextAsker = doc.id;
              });
            })
            .then(function() {
              db.collection("rooms")
                .doc(vm.$route.params.id)
                .collection("roomInfo")
                .doc("roomInfo")
                .update({
                  status: vm.getNextStatus(vm.status),
                  asker: nextAsker,
                  currentAsker: nextAskerNum
                });
            });
          await this.sendGameLog(val, this.uid, phaseTag.questioned);
          this.$store.dispatch("onClick_newInput", "");
          return;
        } else {
          db.collection("rooms")
            .doc(this.$route.params.id)
            .collection("roomInfo")
            .doc("roomInfo")
            .update({ answer: val });
          await this.sendGameLog("", this.uid, phaseTag.targetDecided);
        }
        this.$store.dispatch("onClick_newInput", "");
        db.collection("rooms")
          .doc(this.$route.params.id)
          .collection("roomInfo")
          .doc("roomInfo")
          .update({ status: this.getNextStatus(this.status) });
      }
    },
    answerValue(val) {
      if (val != "") {
        this.sendGameLog(val, this.uid, phaseTag.answered);
        this.$store.dispatch("setAnswerValue", "");
        db.collection("rooms")
          .doc(this.$route.params.id)
          .collection("roomInfo")
          .doc("roomInfo")
          .update({ status: this.getNextStatus(this.status) });
      }
    },
    storeStatus(val) {
      db.collection("rooms")
        .doc(this.$route.params.id)
        .collection("roomInfo")
        .doc("roomInfo")
        .update({ status: val });
    },
    isClick_exit(val) {
      db.collection("rooms")
        .doc(this.$route.params.id)
        .update({ terminated: true });
      db.collection("rooms")
        .doc(this.$route.params.id)
        .collection("roomInfo")
        .doc("roomInfo")
        .update({ status: statusTag.over });
      db.collection("users")
        .doc(this.uid)
        .update({ currentRoomID: "" });
      this.$router.push({ path: `/roomList` });
    }
  }
};
</script>

<style>
.matchInfo {
  padding: 10px;
}
.matchInfo > h4 {
  margin-bottom: 5px;
}

.panel {
  padding: 8px;
  height: 100%;
}
</style>
