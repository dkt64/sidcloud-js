<template>
  <v-app>
    <v-app-bar app color="primary" dark height="80px">
      <div class="d-none d-sm-flex align-center">
        <v-img
          alt="Samar logo"
          class="mr-1"
          contain
          src="sign.png"
          width="40"
        />
        <v-flex class="font-weight-thin headline mr-5">SIDCLOUD</v-flex>
      </div>

      <v-spacer></v-spacer>

      <v-btn @click="click('play', last_index)" class="mr-2" fab>
        <v-icon>{{ play_icon }}</v-icon>
        <!-- <v-icon>play_arrow</v-icon> -->
        <!-- <v-icon>pause</v-icon> -->
      </v-btn>
      <v-btn @click="click('jmp', last_index - 1)" class="mr-2" fab>
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn @click="click('jmp', last_index + 1)" class="mr-2" fab>
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-btn @click="click('jmp', last_index)" class="mr-2" fab>
        <v-icon>replay</v-icon>
      </v-btn>
      <v-btn @click="click('stop', last_index)" fab>
        <v-icon>stop</v-icon>
      </v-btn>
      <!-- <v-btn class="mr-2" fab small> -->
      <!-- <v-icon>volume_off</v-icon> -->
      <!-- <v-icon>volume_up</v-icon> -->
      <!-- </v-btn> -->

      <!-- <v-spacer></v-spacer>
      <div class="hidden-xs-and-down align-center">
        <div class="font-weight-thin title">{{title_playing}}</div>
      </div>-->

      <v-spacer></v-spacer>
      <v-switch
        class="ml-2 hidden-sm-and-down"
        v-model="$vuetify.theme.dark"
        label="Theme"
        style="margin-top: 22px"
      ></v-switch>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row dense>
          <v-col v-for="(card, index) in releases" :key="card.ReleaseID">
            <v-card
              @click="click('jmp', index)"
              class="mx-auto mb-5"
              min-height="420"
              width="320"
            >
              <v-img
                :src="card.ReleaseScreenShot"
                width="320"
                height="227"
              ></v-img>
              <v-progress-linear
                :value="current_time(index)"
                :indeterminate="indeterminate(index)"
                height="8"
              ></v-progress-linear>
              <v-rating
                :value="card.Rating"
                class="d-flex justify-center mt-1"
                size="27"
                length="10"
                readonly
                dense
              ></v-rating>
              <v-card-title
                v-text="card.ReleaseName.substring(0, 27)"
              ></v-card-title>
              <v-card-subtitle>
                <v-div v-for="(by, index) in card.ReleasedBy" :key="by"
                  >{{ nameWithComma(index) }}{{ by }}</v-div
                >
              </v-card-subtitle>
              <v-card-text>
                <v-div
                  class="font-italic font-weight-medium"
                  v-for="(by, index) in card.Credits"
                  :key="by"
                  >{{ nameWithComma(index) }}{{ by }}</v-div
                >
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
    <v-bottom-navigation app grow>
      <v-container fluid style="margin: 0px; padding: 0px; width: 100%">
        <v-layout wrap justify-center>
          <v-progress-linear
            :value="(timeCurrent / timeDuration) * 100.0"
            height="8"
            :indeterminate="music_loading"
          ></v-progress-linear>
          <v-btn
            class="mt-1 font-weight-thin title"
            :href="linkToCsdb"
            link
            text
            target="_blank"
          >
            {{ title_playing }}
          </v-btn>
        </v-layout>
      </v-container>
    </v-bottom-navigation>
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
    title_playing: "SIDCLOUD.NET - YOUR SID NEWSPAPER",
    audio_url: "",
    play: false,
    paused: false,
    player_type: "sidplayfp",
    last_index: 0,
    music_ended: false,
    music_loading: false,
    timeDuration: 305.0,
    timeCurrent: 0.0,
    linkToCsdb: "https://csdb.dk/",
    playedOnce: false,
  }),
  computed: {
    play_icon: function() {
      if (this.play && !this.paused) {
        return "pause";
      } else {
        return "play_arrow";
      }
    },
  },
  methods: {
    current_time: function(id) {
      if (this.play && id == this.last_index) {
        return ((this.timeCurrent / this.timeDuration) * 100.0).toString();
        // return player.duration.toString();
        // return this.timeCurrent.toString()
      } else {
        return "0";
      }
    },
    indeterminate: function(id) {
      if (id == this.last_index && this.music_loading) {
        return true;
      } else {
        return false;
      }
    },
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
        console.log("player.play()...");
        this.paused = false;
        this.play = true;
        this.playedOnce = true;

        this.linkToCsdb =
          "https://csdb.dk/release/?id=" +
          this.releases[this.last_index].ReleaseID;
      }
    },
    timeupdate() {
      // console.log("player event: timeupdate");
      this.timeCurrent = player.currentTime;
    },
    playing() {
      console.log("player event: playing");
      this.music_loading = false;
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
          this.paused = false;
          this.play = false;
          this.music_ended = true;
          break;
        // ===========================
        // jmp
        // ===========================
        case "jmp":
          // jeżeli index == 0 lub max to nic nie robimy
          if (
            (id == this.last_index && this.playedOnce && !this.music_loading) ||
            id < 0 ||
            id >= this.releases.length
          ) {
            return;
          }

          player.pause();
          player.currentTime = 0;
          this.paused = false;
          this.play = false;

          this.title_playing = this.releases[id].ReleaseName;
          this.last_index = id;
          query = "/api/v1/audio?sid_url=" + this.releases[id].DownloadLinks[0];

          this.music_loading = true;
          axios.post(query).then((response) => {
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
            this.music_ended = false;
            this.AudioUrl();
            player.play();
          } else {
            if (!this.play) {
              //
              // play
              //
              player.pause();
              player.currentTime = 0;
              this.paused = false;
              this.play = false;

              this.title_playing = this.releases[id].ReleaseName;
              this.last_index = id;
              query =
                "/api/v1/audio?sid_url=" + this.releases[id].DownloadLinks[0];

              this.music_loading = true;
              axios.post(query).then((response) => {
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
              this.musicPlay = false;
            }
          }
          break;
      }
    },
  },
  created() {
    axios
      .get("/api/v1/csdb_releases")
      .then((response) => {
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
    player.addEventListener("timeupdate", this.timeupdate);
    player.addEventListener("playing", this.playing);
    // player.addEventListener("durationchange", this.durationchange);
    // player.addEventListener("canplaythrough", this.canplaythrough);

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
    // player.addEventListener("loadedmetadata", function() {
    //   // console.log("player event: loadedmetadata");
    // });
    // player.addEventListener("loadeddata", function() {
    //   // console.log("player event: loadeddata");
    // });
  },
};
</script>
