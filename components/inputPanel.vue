<template>
  <v-container>
    <div v-if="status == 2">
      <v-layout row>
        <v-text-field label="答えを決めてください" v-model="inputText"></v-text-field>
        <v-btn center round color="primary" @click="() => {onClick_newInput(); clear()}">
          <span class="text-secondary">決定</span>
        </v-btn>
      </v-layout>
    </div>
    <div v-else-if="status == 3">
      <v-layout row>
        <v-text-field label="質問を決めてください" v-model="inputText"></v-text-field>
        <v-btn center round color="primary" @click="() => {onClick_newInput(); clear()}">
          <span class="text-secondary">送信</span>
        </v-btn>
      </v-layout>
    </div>
    <div v-else-if="status == 5">
      <v-layout row>
        <v-text-field label="答えを予想してください" v-model="inputText"></v-text-field>
        <v-btn center round color="primary" @click="() => {onClick_newInput(); clear()}">
          <span class="text-secondary">予想</span>
        </v-btn>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      inputText: ""
    };
  },
  methods: {
    onClick_newInput() {
      this.$store.dispatch("onClick_newInput", this.inputText);
    },
    clear() {
      this.inputText = "";
    },
    setStatus() {
      this.$store.dispatch("set_status", 4);
    }
  },
  computed: {
    status: function() {
      return this.$store.getters.status;
    }
  }
};
</script>