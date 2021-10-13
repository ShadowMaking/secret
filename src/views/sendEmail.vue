<template>
  <div>
    <p>Gmail API Quickstart</p>
    <!--Add buttons to initiate auth sequence and sign out-->
    <button id="authorize_button" style="display: none;" @click="handleAuthClick">Authorize</button>
    <button id="signout_button" style="display: none;" @click="handleSignoutClick">Sign Out</button>

    <pre id="content" style="white-space: pre-wrap;"></pre>
  </div>
</template>
<script>
import '@/utils/gapi.js';
var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
export default {
  name:'Test',
  data(){
    return {
      // Client ID and API key from the Developer Console
      CLIENT_ID:  '1012137303359-sr6326jclcoqula7jsgm0mdnqtchler6.apps.googleusercontent.com',
      API_KEY: 'AIzaSyDWkzw9skjMLPeChqJ39G9uuBKQflBQgDY',
      // Array of API discovery doc URLs for APIs used by the quickstart
      DISCOVERY_DOCS : ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      SCOPES: 'https://www.googleapis.com/auth/gmail.readonly',
    }
  },
  methods: {
    /**
     *  On load, called to load the auth2 library and API client library.
     */
    handleClientLoad() {
      gapi.load('client:auth2', this.initClient);
    },
    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    initClient() {
      gapi.client.init({
        apiKey: this.API_KEY,
        clientId: this.CLIENT_ID,
        discoveryDocs: this.DISCOVERY_DOCS,
        scope: this.SCOPES
      // }).then(function () {
      }).then( ()=> {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

        // Handle the initial sign-in state.
        this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = this.handleAuthClick;
        signoutButton.onclick = this.handleSignoutClick;
      // }, function(error) {
      }, (error) => {
        this.appendPre(JSON.stringify(error, null, 2));
      });
    },
    updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        this.listLabels();
      } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
      }
    },

    /**
     *  Sign in the user upon button click.
     */
    handleAuthClick(event) {
      gapi.auth2.getAuthInstance().signIn();
    },

    /**
     *  Sign out the user upon button click.
     */
    handleSignoutClick(event) {
      gapi.auth2.getAuthInstance().signOut();
    },

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    appendPre(message) {
      var pre = document.getElementById('content');
      var textContent = document.createTextNode(message + '\n');
      pre.appendChild(textContent);
    },

    /**
     * Print all Labels in the authorized user's inbox. If no labels
     * are found an appropriate message is printed.
     */
    listLabels() {
      gapi.client.gmail.users.labels.list({
        'userId': 'me'
      // }).then(function(response) {
      }).then((response) => {
        var labels = response.result.labels;
        this.appendPre('Labels:');

        if (labels && labels.length > 0) {
          for (i = 0; i < labels.length; i++) {
            var label = labels[i];
            this.appendPre(label.name)
          }
        } else {
          this.appendPre('No Labels found.');
        }
      });
    },
  },
  mounted() {
    this.handleClientLoad()
  },
  
}
</script>
