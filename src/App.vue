<template>
  <v-app>
    <v-app-bar app color="primary" dark height="100px">
      <div class="d-none d-sm-flex align-center">
        <v-img alt="Samar logo" class="mr-1" contain src="sign.png" width="40" />
        <v-flex class="font-weight-thin headline mr-5">SIDCLOUD</v-flex>
      </div>

      <v-btn @click="click('play',last_index)" class="mr-1" fab small>
        <v-icon>{{play_icon}}</v-icon>
        <!-- <v-icon>play_arrow</v-icon> -->
        <!-- <v-icon>pause</v-icon> -->
      </v-btn>
      <v-btn @click="click('jmp',last_index-1)" class="mr-1" fab small>
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn @click="click('jmp',last_index+1)" class="mr-1" fab small>
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-btn @click="click('jmp',last_index)" class="mr-1" fab small>
        <v-icon>replay</v-icon>
      </v-btn>
      <v-btn @click="click('stop',last_index)" class="mr-2" fab small>
        <v-icon>stop</v-icon>
      </v-btn>
      <!-- <v-btn class="mr-2" fab small> -->
      <!-- <v-icon>volume_off</v-icon> -->
      <!-- <v-icon>volume_up</v-icon> -->
      <!-- </v-btn> -->

      <v-spacer></v-spacer>
      <div class="hidden-xs-and-down align-center">
        <div class="font-weight-thin headline">{{title_playing}}</div>
      </div>

      <v-spacer></v-spacer>
      <v-switch
        class="hidden-sm-and-down"
        v-model="$vuetify.theme.dark"
        label="Theme"
        style="margin-top: 22px"
      ></v-switch>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row dense>
          <v-col v-for="(card,index) in releases" :key="card.ReleaseID">
            <v-card @click="click('jmp',index)" class="mx-auto mb-5" min-height="360" width="300">
              <v-img :src="card.ReleaseScreenShot" width="300" height="212"></v-img>
              <v-card-title v-text="card.ReleaseName.substring(0, 27)"></v-card-title>
              <v-card-subtitle>
                <v-div
                  v-for="(by,index) in card.ReleasedBy"
                  :key="by"
                >{{nameWithComma(index)}}{{by}}</v-div>
              </v-card-subtitle>
              <v-card-text>
                <v-div
                  class="font-italic font-weight-medium"
                  v-for="(by,index) in card.Credits"
                  :key="by"
                >{{nameWithComma(index)}}{{by}}</v-div>
              </v-card-text>
            </v-card>
            <!-- <v-btn href="https://csdb.dk/release/?id=" target="_blank" text> -->
            <!-- <span class="mr-2">CSDb</span> -->
            <!-- <v-icon>link</v-icon> -->
            <!-- </v-btn> -->
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <audio id="radio" preload="none">
      <source :src="audio_url" type="audio/wav" />
    </audio>
  </v-app>
</template>

<script>
import axios from "axios";

var player = document.getElementById("radio");

export default {
  name: "App",
  data: () => ({
    releases: null,
    title_playing: "",
    audio_url: "",
    play: false,
    paused: false,
    player_type: "sidplayfp",
    last_index: 0,
    music_ended: false
  }),
  computed: {
    play_icon: function() {
      if (this.play && !this.paused) {
        return "pause";
      } else {
        return "play_arrow";
      }
    }
  },
  methods: {
    nameWithComma(index) {
      if (index == 0) {
        return "";
      } else {
        return ", ";
      }
    },
    AudioUrl() {
      // eslint-disable-next-line
      // console.log("Player type: ", this.player_type);

      if (
        axios.defaults.baseURL == null ||
        axios.defaults.baseURL === undefined
      ) {
        this.audio_url = "/api/v1/audio/" + this.player_type;
      } else {
        this.audio_url =
          axios.defaults.baseURL + "/api/v1/audio/" + this.player_type;
      }
    },
    ended() {
      console.log("player event: ended");
      // player.pause();
      // player.currentTime = 0.0;
      // this.audio_url = "";
      // this.paused = false;
      // this.play = false;
      this.music_ended = true;
      this.click("jmp", this.last_index + 1);
    },
    canplay() {
      console.log("player event: canplay");
      if (!this.music_ended) {
        player.play();
        console.log("Playing...");
        this.paused = false;
        this.play = true;
      }
    },
    click(job, id) {
      // console.log("Clicked on " + id);

      var query;
      switch (job) {
        // ===========================
        // stop
        // ===========================
        case "stop":
          player.pause();
          player.currentTime = 0;
          // this.audio_url = "";
          this.paused = false;
          this.play = false;
          break;
        // ===========================
        // jmp
        // ===========================
        case "jmp":
          // jeżeli index == 0 lub max to nic nie robimy
          if (id < 0 || id >= this.releases.length) {
            return;
          }

          player.pause();
          player.currentTime = 0;
          // this.audio_url = "";
          this.paused = false;
          this.play = false;

          this.title_playing = this.releases[id].ReleaseName;
          this.last_index = id;
          query = "/api/v1/audio?sid_url=" + this.releases[id].DownloadLinks[0];

          axios.post(query).then(response => {
            console.log(response.data);
            this.AudioUrl();
            player.load();
            console.log("Loading...");
            this.music_ended = false;
          });
          break;
        // ===========================
        // play / pause
        // ===========================
        case "play":
          if (this.paused) {
            this.paused = false;
            this.AudioUrl();
            player.play();
          } else {
            if (!this.play) {
              //
              // play
              //

              player.pause();
              player.currentTime = 0;
              // this.audio_url = "";
              this.paused = false;
              this.play = false;

              this.title_playing = this.releases[id].ReleaseName;
              this.last_index = id;
              query =
                "/api/v1/audio?sid_url=" + this.releases[id].DownloadLinks[0];

              axios.post(query).then(response => {
                console.log(response.data);
                this.AudioUrl();
                player.load();
                console.log("Loading...");
                this.music_ended = false;
              });
            } else {
              //
              // pause
              //
              player.pause();
              this.paused = true;
            }
          }
          break;
      }
    }
  },
  created() {
    axios
      .get("/api/v1/csdb_releases")
      .then(response => {
        console.log("Response: ");
        console.log(response.data);

        this.releases = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });

    this.AudioUrl();
  },
  mounted() {
    player = document.getElementById("radio");
    player.addEventListener("ended", this.ended);
    player.addEventListener("canplay", this.canplay);

    // TODO Dodać licznik czasu poprzez zdarzenie durationchange (?)

    // player.addEventListener("waiting", function() {
    //   // console.log("player event: waiting");
    // });
    // player.addEventListener("play", function() {
    //   // console.log("player event: play");
    // });
    // player.addEventListener("pause", function() {
    //   // console.log("player event: pause");
    // });
    // player.addEventListener("loadstart", function() {
    //   // console.log("player event: loadstart");
    // });
    // player.addEventListener("durationchange", function() {
    //   // console.log("player event: durationchange");
    // });
    // player.addEventListener("loadedmetadata", function() {
    //   // console.log("player event: loadedmetadata");
    // });
    // player.addEventListener("loadeddata", function() {
    //   // console.log("player event: loadeddata");
    // });
    // player.addEventListener("progress", function() {
    //   console.log("player event: progress");
    // });
    // player.addEventListener("canplaythrough", function() {
    //   // console.log("player event: canplaythrough");
    // });
  }
};
</script>
