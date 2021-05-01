<template>
  <v-app>
    <v-app-bar app color="primary" dark height="80px">
      <div class="d-none d-sm-flex align-center">
        <v-btn icon href="/">
          <v-img alt="Samar logo" contain src="sign.png" width="40" />
        </v-btn>
        <v-flex class="font-weight-thin headline ml-1 mr-5">SIDCLOUD</v-flex>
      </div>

      <v-spacer class="hidden-sm-and-down"></v-spacer>

      <v-btn @click="click('play_top', last_index)" class="mr-2" fab>
        <v-icon>{{ play_icon }}</v-icon>
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

      <v-spacer></v-spacer>
      <v-switch
        class="hidden-xs-and-down"
        :label="themeLabel"
        style="margin-top: 22px"
        v-model="darkTheme"
      ></v-switch>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col v-for="(card, index) in releases" :key="card.ReleaseID">
            <v-row class="my-1" align="center" justify="center">
              <v-hover v-slot:default="{ hover }">
                <v-card
                  :elevation="hover ? 5 : 2"
                  :disabled="cardDisabled(index)"
                  v-bind:id="'cnr' + card.ReleaseID.toString()"
                  class="card-outter"
                  min-height="450"
                  width="300"
                >
                  <v-img
                    :style="cursorOverImg(index)"
                    :elevation="hover ? 20 : 2"
                    :src="card.ReleaseScreenShot"
                    @click="click('play', index)"
                    width="300"
                    height="212"
                  >
                    <v-overlay v-if="hover" absolute color="#222222">
                      <v-btn class="mr-2" fab>
                        <v-icon v-if="playingNow[index]">pause</v-icon>
                        <v-icon v-if="!playingNow[index]">play_arrow</v-icon>
                      </v-btn>
                    </v-overlay>
                  </v-img>
                  <v-progress-linear
                    :value="current_time(index)"
                    :indeterminate="indeterminate(index)"
                    :active="index == last_index"
                    height="10"
                  ></v-progress-linear>
                  <v-rating
                    :value="card.Rating"
                    class="d-flex justify-center mt-1"
                    size="24"
                    length="10"
                    readonly
                    dense
                    half-increments
                  ></v-rating>
                  <v-card-text
                    class="mx-3 mt-1 pa-0 ma-0 caption"
                    v-text="releaseDate(index)"
                  ></v-card-text>
                  <v-card-title
                    class="mx-3 mt-1 pa-0 ma-0"
                    v-text="releaseName(index)"
                  >
                  </v-card-title>
                  <v-card-subtitle class="mx-3 mb-2 pa-0 ma-0">
                    {{ releasedWithComma(index) }}
                  </v-card-subtitle>
                  <v-card-text
                    class="mx-3 mb-2 pa-0 ma-0 font-italic font-weight-medium"
                  >
                    {{ creditsWithComma(index) }}
                  </v-card-text>
                  <v-card-text
                    class="mx-3 pa-0 ma-0 caption"
                    v-text="card.ReleasedAt.substring(0, 40)"
                  ></v-card-text>
                  <v-card-actions class="card-actions">
                    <v-btn
                      text
                      color="deep-purple accent-4"
                      :href="linkToSidcloudId(card.ReleaseID)"
                      link
                      target="_blank"
                    >
                      Link
                      <v-icon small>launch</v-icon>
                    </v-btn>
                    <v-btn
                      text
                      color="deep-purple accent-4"
                      :href="linkToCsdbId(card.ReleaseID)"
                      link
                      target="_blank"
                    >
                      CSDB
                      <v-icon small>launch</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-bottom-navigation app grow>
      <v-container fluid style="margin: 0px; padding: 0px; width: 100%">
        <v-layout wrap justify-center>
          <!-- v-model="newTimeCurrent" -->
          <v-progress-linear
            :value="(timeCurrent / timeDuration) * 100.0"
            :buffer-value="timeBuffered"
            :stream="music_play"
            height="10"
            :indeterminate="music_loading"
            @click="sliderClick($event)"
          ></v-progress-linear>
          <v-btn
            class="mt-1 font-weight-thin title"
            text
            block
            link
            @click="
              $vuetify.goTo(
                '#cnr' + releases[last_index].ReleaseID.toString(),
                gotoOptions
              )
            "
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

<style scoped>
.card-outter {
  position: relative;
  margin-left: 10px;
  margin-right: 10px;
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
    timeDuration: 300.0,
    timeCurrent: 0.0,
    timeBuffered: 0.0,
    newTimeCurrent: 0.0,
    linkToCsdb: "https://csdb.dk/",
    playedOnce: false,
    darkTheme: false,
    path_id: 0,
  }),
  watch: {
    darkTheme: function(newValue) {
      localStorage.setItem("darkTheme", newValue);
      // console.log("Saving darkTheme = " + newValue);
      this.$vuetify.theme.dark = newValue;
    },
  },
  computed: {
    gotoOptions() {
      return {
        duration: 300,
        offset: 20,
        easing: "easeInOutCubic",
      };
    },
    play_icon: function() {
      if (this.music_play && !this.paused) {
        return "pause";
      } else {
        return "play_arrow";
      }
    },
    themeLabel: function() {
      var out = "Dark";
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
    sliderClick: function() {
    // sliderClick: function(event) {
    //   let el = document.querySelector(".progress-linear__bar"),
	// 	mousePos = event.offsetX,
	// 	elWidth = el.clientWidth,
	// 	percents = (mousePos / elWidth) * 100;
	// 	player.currentTime = percents;
    },
    toggleTheme: function() {
      if (this.themeDark) {
        this.$vuetify.theme.dark = false;
        this.themeDark = false;
      } else {
        this.$vuetify.theme.dark = true;
        this.themeDark = true;
      }

      localStorage.setItem("themeDark", this.themeDark);
    },
    releaseName: function(id) {
      if (this.releases[id].ReleaseName.length < 25) {
        return this.releases[id].ReleaseName;
      } else {
        return this.releases[id].ReleaseName.substring(0, 25) + "...";
      }
    },
    releaseDate: function(id) {
      let y = this.releases[id].ReleaseYear.toString();
      let m = this.releases[id].ReleaseMonth.toString();
      m = m.padStart(2, "0");
      let d = this.releases[id].ReleaseDay.toString();
      d = d.padStart(2, "0");

      if (this.releases[id].ReleaseMonth == 0) {
        m = "??";
      }

      if (this.releases[id].ReleaseDay == 0) {
        d = "??";
      }

      if (this.releases[id].ReleaseYear == 0) {
        y = "????";
      }

      return this.releases[id].ReleaseType + " / " + y + "-" + m + "-" + d;
    },
    playTimeChange: function() {
      this.timeCurrent = player.currentTime;

      if (player.seekable.length > 0) {
        this.timeBuffered = player.seekable.end(player.seekable.length - 1);
        // console.log(this.timeBuffered);
      }
    },
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
    linkToSidcloudId: function(id) {
      var outstring = "";
      outstring = "https://sidcloud.net/?id=" + id;
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
      if (id == this.last_index) {
        return ((this.timeCurrent / this.timeDuration) * 100.0).toString();
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
            out += ", " + this.releases[index].ReleasedBy[i];
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
      this.clearPlayingNow();
      this.music_ended = true;
      this.click("jmp", this.last_index + 1);
    },
    canplay() {
      console.log("player event: canplay");
    },
    timeupdate() {
      console.log("player event: timeupdate");
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
    durationchange() {
      console.log("player event: durationchange");

      console.log("durationchange: readed " + player.duration);

      if (player.duration > 300.0) {
        this.timeDuration = 300.0;
        console.log("durationchange: changed to " + this.timeDuration);
      } else {
        this.timeDuration = player.duration;
      }
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
          console.log("job: stop");
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
          console.log("job: jmp");
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
          // if (!this.releases[id].WAVCached) {
          //   return;
          // }
          if (id > this.last_index) {
            while (!this.releases[id].WAVCached) {
              if (id < 80) {
                id++;
              } else {
                return;
              }
            }
          } else if (id < this.last_index) { 
            while (!this.releases[id].WAVCached) {
              if (id > 0) {
                id--;
              } else {
                return;
              }
            }
          }


          this.clearPlayingNow();
          player.pause();
          this.timeCurrent = 0;
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
        case "play_top":
        case "play":
          console.log("job: play");
          if (this.paused && id == this.last_index) {
            this.paused = false;
            this.music_ended = false;
            player.play();
          } else {
            if (!this.music_play || id != this.last_index) {
              //
              // music_play
              //
              this.clearPlayingNow();
              player.pause();
              this.timeCurrent = 0;
              player.currentTime = 0;
              this.paused = false;
              this.music_play = false;

              // ID
              if (this.path_id > 0 && job == "play_top") {
                // console.log("Path id = " + this.path_id);
                for (var i = 0; i < this.releases.length; i++) {
                  if (this.releases[i].ReleaseID == this.path_id) {
                    // console.log("Found rel");
                    this.last_index = i;
                    id = i;
                    this.path_id = 0;
                    this.$vuetify.goTo(
                      "#cnr" +
                        this.releases[this.last_index].ReleaseID.toString(),
                      this.gotoOptions
                    );
                    break;
                  }
                }
              } else {
                this.last_index = id;
              }

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

			let id = this.$route.query.id

			if (id != null) {
				if (id > 0) {
					
					console.log("Params: ", id);

					axios
					.get("/api/v1/csdb_release/" + id)
					.then((response) => {
						console.log("Response: ");
						console.log(response.data);

						this.releases = response.data;

						// Tworzymy tablicę tej samej długości ze stanem muzyczki
						this.playingNow = new Array(this.releases.length).fill(false);

						// Odczytujemy ID z URl
						var pathIDStr = window.location.pathname;
						pathIDStr = pathIDStr.replace(/\D/g, "");
						// console.log("URL param " + pathIDStr);
						this.path_id = parseInt(pathIDStr, 10);
					})
					.catch(function(error) {
						console.log(error);
					});
				} else {
					axios
					.get("/api/v1/csdb_releases")
					.then((response) => {
						console.log("Response: ");
						console.log(response.data);

						this.releases = response.data;

						// Tworzymy tablicę tej samej długości ze stanem muzyczki
						this.playingNow = new Array(this.releases.length).fill(false);

						// Odczytujemy ID z URl
						var pathIDStr = window.location.pathname;
						pathIDStr = pathIDStr.replace(/\D/g, "");
						// console.log("URL param " + pathIDStr);
						this.path_id = parseInt(pathIDStr, 10);
					})
					.catch(function(error) {
						console.log(error);
					});

				}
			} else {
				axios
				.get("/api/v1/csdb_releases")
				.then((response) => {
					console.log("Response: ");
					console.log(response.data);

					this.releases = response.data;

					// Tworzymy tablicę tej samej długości ze stanem muzyczki
					this.playingNow = new Array(this.releases.length).fill(false);

					// Odczytujemy ID z URl
					var pathIDStr = window.location.pathname;
					pathIDStr = pathIDStr.replace(/\D/g, "");
					// console.log("URL param " + pathIDStr);
					this.path_id = parseInt(pathIDStr, 10);
				})
				.catch(function(error) {
					console.log(error);
				});
			}
  },
  mounted() {
    this.darkTheme = localStorage.getItem("darkTheme") == "true";

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
    // player.addEventListener("suspend", this.suspend); // wyłączyłem bo dużo się tego pojawia
    player.addEventListener("volumechange", this.volumechange);

    player.addEventListener("durationchange", this.durationchange);

    // Obsługa klawiszy multimedialnych
    window.addEventListener("keydown", this.keydown);

    setInterval(this.playTimeChange, 1000);
  },
};
</script>
