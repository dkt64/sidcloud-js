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

      <v-spacer class="hidden-sm-and-down"></v-spacer>

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
      <v-btn @click="click('replay', last_index)" class="mr-2" fab>
        <v-icon>replay</v-icon>
      </v-btn>
      <v-btn class="hidden-sm-and-down" @click="click('stop', last_index)" fab>
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
      <!-- class="overline" -->
      <v-switch
        class="hidden-xs-and-down"
        v-model="$vuetify.theme.dark"
        :label="themeLabel"
        style="margin-top: 22px"
      ></v-switch>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row>
          <v-col v-for="(card, index) in releases" :key="card.ReleaseID">
            <v-row align="center" justify="center">
              <v-hover v-slot:default="{ hover }">
                <v-card
                  :elevation="hover ? 5 : 2"
                  :disabled="cardDisabled(index)"
                  class="card-outter"
                  min-height="450"
                  width="300"
                >
                  <v-img
                    :style="cursorOverImg(index)"
                    :elevation="hover ? 20 : 2"
                    @click="click('jmp', index)"
                    :src="card.ReleaseScreenShot"
                    width="300"
                    height="212"
                  >
                    <v-overlay v-if="hover" absolute color="#222222">
                      <v-btn @click="click('play', index)" class="mr-2" fab>
                        <v-icon v-if="playingNow[index]">pause</v-icon>
                        <v-icon v-if="!playingNow[index]">play_arrow</v-icon>
                      </v-btn>
                    </v-overlay>
                  </v-img>
                  <!-- <v-progress-linear
                    :value="(timeCurrent / timeDuration) * 100.0"
                    height="10"
                    :indeterminate="music_loading"
                  ></v-progress-linear> -->
                  <v-progress-linear
                    :value="current_time(index)"
                    :indeterminate="indeterminate(index)"
                    height="10"
                  ></v-progress-linear>
                  <v-rating
                    :value="card.Rating"
                    class="d-flex justify-center mt-1"
                    size="24"
                    length="10"
                    readonly
                    dense
                  ></v-rating>
                  <v-card-text
                    class="ml-3 mt-1 pa-0 ma-0 caption"
                    v-text="releaseDate(index)"
                  ></v-card-text>
                  <v-card-title
                    class="ml-3 mt-1 pa-0 ma-0"
                    v-text="card.ReleaseName.substring(0, 27)"
                  >
                  </v-card-title>
                  <v-card-subtitle class="ml-3 mb-2 pa-0 ma-0">
                    {{ releasedWithComma(index) }}
                  </v-card-subtitle>
                  <v-card-text
                    class="ml-3 mb-2 pa-0 ma-0 font-italic font-weight-medium"
                  >
                    {{ creditsWithComma(index) }}
                  </v-card-text>
                  <v-card-text
                    class="ml-3 pa-0 ma-0 caption"
                    v-text="card.ReleasedAt.substring(0, 40)"
                  ></v-card-text>
                  <v-card-actions class="card-actions">
                    <v-btn
                      text
                      color="deep-purple accent-4"
                      :href="linkToCsdbId(card.ReleaseID)"
                      link
                      target="_blank"
                    >
                      CSDB
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-bottom-navigation app grow>
      <v-container fluid style="margin: 0px; padding: 0px; width: 100%">
        <v-layout wrap justify-center>
          <v-progress-linear
            :value="(timeCurrent / timeDuration) * 100.0"
            height="10"
            :indeterminate="music_loading"
          ></v-progress-linear>
          <v-btn
            class="mt-1 font-weight-thin title"
            text
            block
            :href="linkToCsdb"
            link
            target="_blank"
          >
            {{ title_playing }}
          </v-btn>
          <!-- <v-icon class="mt-1" right>open_in_new</v-icon> -->
        </v-layout>
      </v-container>
    </v-bottom-navigation>
    <audio id="radio" preload="none">
      <source :src="audio_url" type="audio/wav" />
    </audio>
  </v-app>
</template>

<style scoped>
.card-outter {
  position: relative;
}
.card-actions {
  position: absolute;
  bottom: 0;
  right: 0;
}

.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
}
</style>

<script>
import axios from "axios";

var player;

export default {
  name: "App",
  data: () => ({
    releases: null,
    playingNow: [],
    title_playing: "SIDCLOUD - YOUR SID NEWSPAPER",
    audio_url: "",
    music_play: false,
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
      if (this.music_play && !this.paused) {
        return "pause";
      } else {
        return "play_arrow";
      }
    },
    themeLabel: function() {
      var out = "Theme";
      if (
        this.$vuetify.breakpoint.name == "xs" ||
        this.$vuetify.breakpoint.name == "sm"
      ) {
        out = "";
      }
      return out;
    },
  },
  methods: {
    releaseDate: function(id) {
      let y = this.releases[id].ReleaseYear.toString();
      let m = this.releases[id].ReleaseMonth.toString();
      m = m.padStart(2, "0");
      let d = this.releases[id].ReleaseDay.toString();
      d = d.padStart(2, "0");
      return y + "-" + m + "-" + d;
    },
    playTimeChange: function() {
      this.timeCurrent = player.currentTime;
    },
    // playingNow: function(id) {
    //   if (
    //     id == this.last_index &&
    //     this.playedOnce &&
    //     this.playing &&
    //     !this.paused
    //   ) {
    //     return "pause";
    //   }
    //   return "play_arrow";
    // },
    clearPlayingNow: function() {
      for (let i = 0; i < this.playingNow.length; i++) {
        this.playingNow[i] = false;
      }
    },
    setPlayingNow: function(id) {
      this.clearPlayingNow();
      this.playingNow[id] = true;
    },
    linkToCsdbId: function(id) {
      var outstring = "";
      outstring = "https://csdb.dk/release/?id=" + id;
      return outstring;
    },
    cardDisabled: function(id) {
      if (this.releases[id].WAVCached) {
        return false;
      }
      return true;
    },
    cursorOverImg: function(id) {
      if (this.releases[id].WAVCached) {
        return "cursor: pointer";
      }
      return "";
    },
    current_time: function(id) {
      if (this.music_play && id == this.last_index) {
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
    releasedWithComma(index) {
      let out = "";
      if (this.releases[index].ReleasedBy != null) {
        for (let i = 0; i < this.releases[index].ReleasedBy.length; i++) {
          if (i != 0) {
            out += "," + this.releases[index].ReleasedBy[i];
          } else {
            out += this.releases[index].ReleasedBy[i];
          }
        }
      }
      return out;
    },
    creditsWithComma(index) {
      let out = "";
      if (this.releases[index].Credits != null) {
        for (let i = 0; i < this.releases[index].Credits.length; i++) {
          if (i != 0) {
            out += ", " + this.releases[index].Credits[i];
          } else {
            out += this.releases[index].Credits[i];
          }
        }
      }
      return out;
    },
    AudioUrl() {
      // eslint-disable-next-line
      // console.log("Player type: ", this.player_type);

      if (
        axios.defaults.baseURL == null ||
        axios.defaults.baseURL === undefined
      ) {
        this.audio_url =
          "/api/v1/audio/" + this.releases[this.last_index].ReleaseID;
      } else {
        this.audio_url =
          axios.defaults.baseURL +
          "/api/v1/audio/" +
          this.releases[this.last_index].ReleaseID;
      }
    },
    ended() {
      console.log("player event: ended");
      // Teraz przeskakujemy do nastepnej
      // to jest stary kod kiey robiłem restart
      //
      // player.pause();
      // player.currentTime = 0.0;
      // this.audio_url = "";
      // this.paused = false;
      // this.music_play = false;
      this.clearPlayingNow();
      this.music_ended = true;
      this.click("jmp", this.last_index + 1);
    },
    canplay() {
      console.log("player event: canplay");
    },
    timeupdate() {
      // console.log("player event: timeupdate");
      this.timeCurrent = player.currentTime;
    },
    playing() {
      console.log("player event: playing");
      this.setPlayingNow(this.last_index);
      this.paused = false;
      this.music_play = true;
      this.playedOnce = true;
      this.music_loading = false;
    },
    canplaythrough() {
      console.log("player event: canplaythrough");
    },
    play() {
      console.log("player event: play");
    },
    pause() {
      console.log("player event: pause");
    },
    loadedmetadata() {
      console.log("player event: loadedmetadata");
      // if (!this.music_ended) {
      //   player.play();
      //   console.log("player.play()...");
      //   this.paused = false;
      //   this.music_play = true;
      //   this.playedOnce = true;
      // }
    },
    loadeddata() {
      console.log("player event: loadeddata");
    },
    waiting() {
      console.log("player event: waiting");
    },
    audioprocess() {
      console.log("player event: audioprocess");
    },
    complete() {
      console.log("player event: complete");
    },
    emptied() {
      console.log("player event: emptied");
    },
    ratechange() {
      console.log("player event: ratechange");
    },
    seeked() {
      console.log("player event: seeked");
    },
    seeking() {
      console.log("player event: seeking");
    },
    stalled() {
      console.log("player event: stalled");
    },
    suspend() {
      console.log("player event: suspend");
    },
    volumechange() {
      console.log("player event: volumechange");
    },
    keydown(event) {
      switch (event.code) {
        case "MediaPlayPause":
          console.log("window event: keydown");
          console.log(event.code);
          this.click("play", this.last_index);
          break;
        case "MediaTrackNext":
          this.click("jmp", this.last_index + 1);
          break;
        case "MediaTrackPrevious":
          console.log("window event: keydown");
          console.log(event.code);
          this.click("jmp", this.last_index - 1);
          break;
      }
    },
    click(job, id) {
      // console.log("Clicked on " + id);

      // var query;
      switch (job) {
        // ===========================
        // stop
        // ===========================
        case "stop":
          this.clearPlayingNow();
          this.audio_url = "";
          player.load();
          this.paused = false;
          this.music_play = false;
          this.music_ended = true;
          break;
        // ===========================
        // jmp
        // ===========================
        case "jmp":
        case "replay":
          // jeżeli index == 0 lub max to nic nie robimy
          if (
            (id == this.last_index &&
              job == "jmp" &&
              this.playedOnce &&
              !this.music_loading) ||
            id < 0 ||
            id >= this.releases.length
          ) {
            return;
          }

          // sprawdzamy czy mamy utwór cached
          //
          if (!this.releases[id].WAVCached) {
            return;
          }

          this.clearPlayingNow();
          player.pause();
          player.currentTime = 0;
          this.paused = false;
          this.music_play = false;

          if (
            this.$vuetify.breakpoint.name == "xs" ||
            this.$vuetify.breakpoint.name == "sm"
          ) {
            if (this.releases[id].ReleaseName.length > 27) {
              this.title_playing =
                this.releases[id].ReleaseName.substring(0, 27) + " ...";
            } else {
              this.title_playing = this.releases[id].ReleaseName;
            }
          } else {
            this.title_playing = this.releases[id].ReleaseName;
          }

          this.last_index = id;
          this.music_loading = true;
          this.linkToCsdb =
            "https://csdb.dk/release/?id=" +
            this.releases[this.last_index].ReleaseID;
          this.AudioUrl();
          player.load();
          console.log("Loading...");
          player.play();
          this.music_ended = false;
          break;
        // ===========================
        // music_play / pause
        // ===========================
        case "play":
          if (this.paused) {
            this.paused = false;
            this.music_ended = false;
            player.play();
          } else {
            if (!this.music_play) {
              //
              // music_play
              //
              this.clearPlayingNow();
              player.pause();
              player.currentTime = 0;
              this.paused = false;
              this.music_play = false;

              if (
                this.$vuetify.breakpoint.name == "xs" ||
                this.$vuetify.breakpoint.name == "sm"
              ) {
                if (this.releases[id].ReleaseName.length > 27) {
                  this.title_playing =
                    this.releases[id].ReleaseName.substring(0, 27) + " ...";
                } else {
                  this.title_playing = this.releases[id].ReleaseName;
                }
              } else {
                this.title_playing = this.releases[id].ReleaseName;
              }

              this.last_index = id;
              this.AudioUrl();
              this.music_loading = true;
              this.linkToCsdb =
                "https://csdb.dk/release/?id=" +
                this.releases[this.last_index].ReleaseID;
              player.load();
              console.log("Loading...");
              player.play();
              this.music_ended = false;
            } else {
              //
              // pause
              //
              this.clearPlayingNow();
              player.pause();
              this.paused = true;
              this.music_play = false;
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

        // Tworzymy tablicę tej samej długości ze stanem muzyczki
        this.playingNow = new Array(this.releases.length).fill(false);
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  mounted() {
    player = document.getElementById("radio");

    player.addEventListener("ended", this.ended);
    player.addEventListener("canplay", this.canplay);
    // player.addEventListener("timeupdate", this.timeupdate); // spowalnia stronę
    player.addEventListener("playing", this.playing);

    // Niepotrzebne - tylko do debuggingu
    player.addEventListener("canplaythrough", this.canplaythrough);
    player.addEventListener("play", this.play);
    player.addEventListener("pause", this.pause);
    player.addEventListener("loadedmetadata", this.loadedmetadata);
    player.addEventListener("loadeddata", this.loadeddata);
    player.addEventListener("waiting", this.waiting);

    player.addEventListener("audioprocess", this.audioprocess);
    player.addEventListener("complete", this.complete);
    player.addEventListener("emptied", this.emptied);
    player.addEventListener("ratechange", this.ratechange);
    player.addEventListener("seeked", this.seeked);
    player.addEventListener("seeking", this.seeking);
    player.addEventListener("stalled", this.stalled);
    player.addEventListener("suspend", this.suspend);
    player.addEventListener("volumechange", this.volumechange);

    window.addEventListener("keydown", this.keydown);

    setInterval(this.playTimeChange, 500);

    // Cykliczne
    // player.addEventListener("durationchange", this.durationchange);
  },
};
</script>
