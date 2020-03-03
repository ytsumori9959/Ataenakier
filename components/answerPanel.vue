<template>
  <v-container>
    <h3>質問への解答を選んでください</h3>
    <v-layout row>
      <v-layout>
        <div v-if="answer == 'yes'">
          <v-btn depressed round @click="onClick_cancel()" color="primary">
            <span class="text-secondary">はい</span>
          </v-btn>
        </div>
        <div v-else>
          <v-btn depressed round outline @click="onClick('yes')" color="primary">はい</v-btn>
        </div>
        <div v-if="answer == 'no'">
          <v-btn depressed round @click="onClick_cancel()" color="primary">
            <span class="text-secondary">いいえ</span>
          </v-btn>
        </div>
        <div v-else>
          <v-btn depressed round outline @click="onClick('no')" color="primary">いいえ</v-btn>
        </div>
        <div v-if="answer == 'maybe'">
          <v-btn depressed round @click="onClick_cancel()" color="primary">
            <span class="text-secondary">多分</span>
          </v-btn>
        </div>
        <div v-else>
          <v-btn depressed round outline @click="onClick('maybe')" color="primary">多分</v-btn>
        </div>
        <v-text-field label="補足" v-model="additionalAnswer"/>
        <v-btn depressed round color="primary" @click="() => {onClick_send()}">
          <span class="text-secondary">送信</span>
        </v-btn>
      </v-layout>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      answer: "",
      additionalAnswer: ""
    };
  },
  methods: {
    onClick(answerInput) {
      this.answer = answerInput;
    },
    onClick_cancel() {
      this.answer = "";
    },
    onClick_send() {
      if (this.answer) {
        let answerValue;
        switch (this.answer) {
          case "yes":
            answerValue = "はい。" + this.additionalAnswer;
            break;
          case "no":
            answerValue = "いいえ。" + this.additionalAnswer;
            break;
          default:
            answerValue = "多分(どちらとも言えない)。" + this.additionalAnswer;
            break;
        }
        this.$store.dispatch("setAnswerValue", answerValue);
      }
    }
  }
};
</script>
