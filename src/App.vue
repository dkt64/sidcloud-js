<template>
  <v-app>
    <v-app-bar app color="primary" dark height="80px">
      <div class="d-none d-sm-flex align-center">
        <v-img alt="Samar logo" class="mr-1" contain src="sign.png" width="30" />
        <div class="title mr-5">SIDCLOUD</div>
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
      <v-btn @click="click('stop',last_index)" fab small>
        <v-icon>stop</v-icon>
      </v-btn>
      <!-- <v-btn class="mr-2" fab small> -->
      <!-- <v-icon>volume_off</v-icon> -->
      <!-- <v-icon>volume_up</v-icon> -->
      <!-- </v-btn> -->

      <v-spacer></v-spacer>
      <div class="hidden-xs-and-down align-center">
        <div class="subtitle">{{title_playing}}</div>
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
            <v-card @click="click('jmp',index)" class="mx-auto mb-5" max-width="384">
              <v-img :src="card.ReleaseScreenShot" width="384" height="272"></v-img>
              <v-card-title v-text="card.ReleaseName.substring(0, 35)"></v-card-title>
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

export default {
  name: "App",
  data: () => ({
    releases: null,
    title_playing: "",
    audio_url: "",
    play: false,
    player_type: "sidplayfp",
    last_index: 0
  }),
  computed: {
    play_icon: function() {
      if (this.play) {
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
      console.log("Player type: ", this.player_type);

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
    click(job, id) {
      console.log("Clicked on " + id);
      var player = document.getElementById("radio");

      if (job == "jmp") {
        if (id < 0 || id >= this.releases.length) {
          console.log("last track");
          return;
        }
      }

      if (job == "stop") {
        if (this.play) {
          player.pause();
          player.currentTime = 0.0;
          this.audio_url = "";
          this.play = false;
        }
      } else {
        if (!this.play || job == "jmp") {
          this.title_playing = this.releases[id].ReleaseName;
          this.last_index = id;

          var query =
            "/api/v1/audio?sid_url=" + this.releases[id].DownloadLinks[0];
          console.log("Query = " + query);

          player.addEventListener("waiting", function() {
            console.log("player event: waiting");
          });
          player.addEventListener("play", function() {
            console.log("player event: play");
          });
          player.addEventListener("pause", function() {
            console.log("player event: pause");
          });
          player.addEventListener("ended", function() {
            console.log("player event: ended");
          });
          player.addEventListener("loadstart", function() {
            console.log("player event: loadstart");
          });
          player.addEventListener("durationchange", function() {
            console.log("player event: durationchange");
          });
          player.addEventListener("loadedmetadata", function() {
            console.log("player event: loadedmetadata");
          });
          player.addEventListener("loadeddata", function() {
            console.log("player event: loadeddata");
          });
          // player.addEventListener("progress", function() {
          //   console.log("player event: progress");
          // });
          player.addEventListener("canplay", function() {
            console.log("player event: canplay");
            player.play();
            console.log("Playing...");
          });
          player.addEventListener("canplaythrough", function() {
            console.log("player event: canplaythrough");
          });

          player.pause();
          player.currentTime = 0.0;

          this.AudioUrl();

          axios.post(query).then(response => {
            console.log("response " + response.data);

            player.load();
            console.log("Loading...");
            this.play = true;
          });
        } else {
          player.pause();
          this.play = false;
        }
      }
    }
  },
  created() {
    this.AudioUrl();

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
  }
};
</script>
