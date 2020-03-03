<template>
  <div>
    <div v-if="status == 1">ホストプレイヤーがゲームを開始するのを待っています。</div>
    <div v-else-if="status == 2">他プレイヤーが答えを決めています。</div>
    <div v-else-if="status == 3">他プレイヤーが質問を考えています。</div>
    <div v-else-if="status == 4">他プレイヤーが質問への解答を考えています。</div>
    <div v-else-if="status == 5">他プレイヤーが答えを予想しています</div>
    <div v-else-if="status == 6">
      <v-btn ripple round depressed color="primary" @click="() => {onClick_exit()}">
        <span class="text-secondary">退室</span>
      </v-btn>
    </div>
    <div v-else>対戦相手の入室を待っています。</div>
  </div>
</template>
<script>
import statusTag from "~/plugins/status";
export default {
  methods: {
    onClick_exit() {
      this.$store.dispatch("onClick_exit");
    }
  },
  computed: {
    status: function() {
      return this.$store.getters.status;
    }
  }
};
</script>