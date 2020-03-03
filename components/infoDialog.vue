<template>
  <v-dialog v-model="visible" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card class="secondary">
      <v-toolbar flat fixed app dark color="primary">
        <v-btn depressed icon @click="invisible">
          <v-icon color="secondary">close</v-icon>
        </v-btn>
        <v-toolbar-title class="secondary--text">Information</v-toolbar-title>
      </v-toolbar>
      <v-content>
        <v-container>
          <h1 class="primary--text">~Ataenakier とは~</h1>
          <p>
            &emsp; 面白いゲームです。
            <br>
            <br>&emsp;一人が答えを決めて、もう一人が質問してその答えを当てるゲームです。
          </p>
          <h1 class="primary--text">~開発者~</h1>
          <v-layout row>
            &emsp;
            <v-avatar size="150">
              <v-img
                src="https://pbs.twimg.com/profile_images/989491417285148672/CTs_Yel-_400x400.jpg"
              ></v-img>
            </v-avatar>
            <v-flex xs5 sm2 md3>
              <h2>六坂</h2>
              <h4>
                <a href="https://twitter.com/6sRyuSk" target="_blank">@6sRyuSk</a>
              </h4>
              <p>&emsp; 変人</p>
            </v-flex>
            <v-avatar size="150">
              <v-img
                src="https://pbs.twimg.com/profile_images/1126794449852387328/uK5OCGJk_400x400.jpg"
              ></v-img>
            </v-avatar>
            <v-flex xs5 sm2 md3>
              <h2>つゆ</h2>
              <h4>
                <a href="https://twitter.com/otsuyu1018" target="_blank">@otsuyu1018</a>
              </h4>
              <p>&emsp; 凡人</p>
            </v-flex>
          </v-layout>
          <p></p>
          <h1 class="primary--text">~Q&A~</h1>
          <p>
            &emsp;
            <b>昨日は寝れましたか？</b>
            <br>&emsp;&emsp; 寝るのは得意なのでたっぷり寝ました。
          </p>
          <p>
            &emsp;
            <b>暇ですか？</b>
            <br>&emsp;&emsp; 暇です。
          </p>
          <p>
            &emsp;
            <b>トイレは一日に何回行きますか？</b>
            <br>&emsp;&emsp; 食べたものによって変化します。
          </p>
          <p>
            &emsp;
            <b>朝ごはんは何ですか？</b>
            <br>&emsp;&emsp; 食べ物です。
          </p>
        </v-container>
      </v-content>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    visible: Boolean,
    invisible: Function
  }
};
</script>