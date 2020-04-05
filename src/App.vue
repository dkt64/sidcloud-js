<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img alt="Samar logo" class="mr-1" contain src="sign.png" width="30" />
        <div class="title mr-5">SIDCLOUD</div>
      </div>

      <v-btn class="mr-2" fab small>
        <v-icon>play_arrow</v-icon>
        <!-- <v-icon>pause</v-icon> -->
      </v-btn>
      <v-btn class="mr-2" fab small>
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn class="mr-2" fab small>
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-btn class="mr-2" fab small>
        <v-icon>replay</v-icon>
      </v-btn>
      <v-btn class="mr-2" fab small>
        <v-icon>stop</v-icon>
      </v-btn>
      <v-btn class="mr-2" fab small>
        <v-icon>volume_off</v-icon>
        <!-- <v-icon>volume_up</v-icon> -->
      </v-btn>

      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <div class="title">{{title_playing}}</div>
      </div>

      <v-spacer></v-spacer>

      <v-switch v-model="$vuetify.theme.dark" label="Theme" style="margin-top: 22px"></v-switch>
      <v-btn href="https://csdb.dk/" target="_blank" text>
        <span>CSDB</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row dense>
          <v-col v-for="(card,index) in releases" :key="card.ReleaseID">
            <v-card @click="click(index)" class="mx-auto mb-5" max-width="384">
              <v-img :src="card.ReleaseScreenShot" width="384" height="272"></v-img>
              <v-card-title v-text="card.ReleaseName.substring(0, 35)"></v-card-title>
              <v-card-subtitle>
                <v-div
                  v-for="(by,index) in card.ReleasedBy"
                  :key="by"
                >{{nameWithComma(index)}}{{by}}</v-div>
              </v-card-subtitle>
              <v-card-text>
                <v-div class="font-italic font-weight-medium" v-for="(by,index) in card.Credits" :key="by">{{nameWithComma(index)}}{{by}}</v-div>
              </v-card-text>
            </v-card>
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
    audio_url: ""
  }),
  methods: {
    click(id) {
      console.log("Clicked on " + id);
      this.title_playing = this.releases[id].ReleaseName
    },
    nameWithComma(index) {
      if (index == 0) {
        return "";
      } else {
        return ", ";
      }
    },
  },
  created() {
    // Odczyt configa
    axios
      .get("/api/v1/csdb_releases")
      .then(response => {
        console.log("Response: ");
        console.log(response.data);

        this.releases = response.data;
      })
      .catch(function(error) {
        // eslint-disable-next-line
        console.log(error);
      });
  }
};
</script>
