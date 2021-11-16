<template>
  <div class="social-recovery-page">
    <div class="recovery-setting-tip" v-show="showTip">
      <h4>Social Recovery</h4>
      <span class="tip">Social Recovery is a secret recovery mechanism,  in which you can ask your friends to save and recover your secret or private data with the cryptography of Threshold Secret Share.</span>
      <van-field name="recoveryType" label="recoveryType" class="recovery-type">
        <template #input>
          <van-radio-group v-model="recoveryType" direction="horizontal" :disabled="recoveryTypeDisabled">
            <van-radio name="mnemonic">Mnemonic</van-radio>
            <van-radio name="privateKey">privateKey</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirmRecoveryType">{{ step1ButtonTxt}}</van-button>
      </div>
    </div>
    <div v-show="showChooseFriend">
      <v-chooseFriends
        key="choose-friends"
        @childEvent="selectedFriendsCallback" />
    </div>
    <div v-show="confirmChooseFriend">
      <v-confirmFriends
        key="choose-friends"
        :source="selectedFriendsList"
        @childEvent="createRecoveryCallback" />
    </div>
    <div v-show="showStatus">
      <v-statusView
        key="status-view" />
    </div>
    <van-dialog v-model="showGoogleAuthDialog" title="Authorization" :showConfirmButton="false">
      <div class="google-auth-dialog">
        <van-icon name="cross" class="closeDialog" @click="showGoogleAuthDialog=false"  size="20" />
        <span v-show="sendEmailUserIsSign" class="tip">Authorized，click button to send Emial</span>
        <div class="btn-wrapper">
          <van-button @click="signInForGoogle" v-show="!sendEmailUserIsSign" class="btn">Authorize</van-button>
          <van-button @click="signOutForGoogle" v-show="sendEmailUserIsSign" class="btn">Revoke authorization</van-button>
          <van-button @click="sendEmail" v-show="sendEmailUserIsSign" class="btn">Send Email</van-button>
        </div>
      </div>
    </van-dialog>
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Dialog, Popup, Button, Field, RadioGroup, Radio } from 'vant';
import { installWeb3WalletMetamask } from '@/utils/web3'
import { getFromStorage, removeFromStorage } from '@/utils/storage'
import ChooseFriends from './ChooseFriends'
import ConfirmFriends from './ConfirmFriends'
import StatusView from './Status'
import '@/utils/gapi.js';
import { SecLevelEnum, generate_mnemonic, generate_key, split, combine, setCustom } from '@/utils/secretshare'
import ThirdLoginTip from '@/components/ThirdLoginTip';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Button)
Vue.use(Field)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Dialog)

export default {
  name: "SocailRecovery",
  components: {
    'v-chooseFriends': ChooseFriends,
    'v-confirmFriends': ConfirmFriends,
    'v-statusView': StatusView,
    'v-thirdlogintip': ThirdLoginTip,
  },
  data() {
    return {
      showTip: true,
      showChooseFriend: false,
      confirmChooseFriend: false,
      recoveryType: 'mnemonic', // mnemonic || privateKey
      recoveryTypeDisabled: false,
      step1ButtonTxt: 'Confirm',
      showStatus: false,
      selectedFriendsList: [],
      recoveryNumber: 1,
      secretWords: '',
      sendEmailUserIsSign: false, // send email need user sign
      showGoogleAuthDialog: false,
      sendEmailUserID: '',
      showThirdLoginTip: false,
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
    thirdUserId() {
     return getFromStorage('gUID')
    },
  },
  watch: {
    $route(to, from) {
      if (this.$route.query.type) {
        console.log(this.$route.query.type, to, from)
        // this.activeCreateWalletType = this.$route.query.type
      }
    }
  },
  methods: {
    confirmRecoveryType() {
      if (!this.thirdUserId) {
        this.showThirdLoginTip = true
        console.log('need login')
        return
      }
      const mnemonic = getFromStorage('mnemonic')
      const privateKey = getFromStorage('privateKey')
      const disabled = !mnemonic && !privateKey || this.recoveryType === 'mnemonic' && !mnemonic || this.recoveryType === 'privateKey' && !privateKey
      if (disabled) {
        console.log('can not detect mnemonic or priavteKey')
        Toast('No Data For Recovery')
        return
      }
      this.showTip = false
      this.showChooseFriend = true
    },
    async selectedFriendsCallback(friendsLists) {
      console.log(friendsLists, this.recoveryType)
      this.selectedFriendsList = _.cloneDeep(friendsLists)
      this.showChooseFriend = false
      this.confirmChooseFriend = true
    },
    async createRecoveryCallback(number) {
      const userId = getFromStorage('gUID')
      if (!userId) {
        Toast('error')
        return
      }
      let secretWords
      if (this.recoveryType === 'mnemonic') {
        secretWords = getFromStorage('mnemonic')
      }
      if (this.recoveryType === 'privateKey') {
        secretWords = getFromStorage('privateKey')
      }
      if (secretWords) {
        setCustom([this.selectedFriendsList.length, number])
        this.recoveryNumber = number;
        this.showGoogleAuthDialog = true;
        this.secretWords = secretWords;
        // this.confirmChooseFriend = false
        // this.showStatus = true
        const curretSettingData = await this.$store.dispatch('UpdateBackupSettingDataForStorage', { updateType: 'get' });
        if (curretSettingData && curretSettingData.id) {
          console.log('already saved')
          return
        }

        const backUpSeetingData = getFromStorage('settingdata') && window.JSON.parse(getFromStorage('settingdata'))
        const recoverData = {
          fromUserID: userId,
          // recoveryNum: this.recoveryNumber,
          totalSharedNum: this.selectedFriendsList.length,
          threshold: this.recoveryNumber,
          selectedFriendsList: this.selectedFriendsList.map(i=>({ user_id:i.id, email:i.email, name:i.name })),
        }
        backUpSeetingData && (recoverData['name'] = backUpSeetingData.name)
        backUpSeetingData && (recoverData['desc'] = backUpSeetingData.desc)

        const storeRes = await this.$store.dispatch('SaveRecoveryData', {...recoverData});
        const { hasError, data, error } = storeRes // TODO
        if (!hasError && data) {
          const backupId = data.id
          if (curretSettingData) {
            await this.$store.dispatch('UpdateBackupSettingDataForStorage', { updateType: 'store', settingData: {id: backupId, ...curretSettingData} });
          }
        }
        return
      }
      Toast('No Data For Recovery')
    },
    handleClientLoad() {
      gapi.load('client:auth2', this.initAPIClient);
    },
    initAPIClient() {
      // const CLIENT_ID = '1012137303359-sr6326jclcoqula7jsgm0mdnqtchler6.apps.googleusercontent.com'
      // const API_KEY = 'AIzaSyDWkzw9skjMLPeChqJ39G9uuBKQflBQgDY'
      // const CLIENT_ID = '413535929013-jeeg5o86nj3ev06r0bf6uadg6bupqvrd.apps.googleusercontent.com'
      // const API_KEY = 'AIzaSyDAYetFv4tYpCFfL704j0ocaNaK_w69drY'
      const CLIENT_ID = '1057982242505-d3i7c1vf2p92uue02df3dg3pfme5cutu.apps.googleusercontent.com'
      const API_KEY = 'AIzaSyCnBtPAHR72R4hgkXqxIU77anOAOrMXJxU'
      // Array of API discovery doc URLs for APIs used by the quickstart
      const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"]
      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly ' + 'https://www.googleapis.com/auth/gmail.send'
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then( ()=> {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

        // Handle the initial sign-in state.
        this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // var authorizeButton = document.getElementById('authorize_button');
        // var signoutButton = document.getElementById('signout_button');
        // authorizeButton.onclick = this.handleAuthClick;
        // signoutButton.onclick = this.handleSignoutClick;
      }, (error) => {
        // this.appendPre(JSON.stringify(error, null, 2));
      });
    },
    updateSigninStatus(isSignedIn) {
      this.sendEmailUserIsSign = isSignedIn
      console.log('isSignedIn', isSignedIn)
      if (isSignedIn) {
        this.sendEmailUserID = gapi.auth2.getAuthInstance().currentUser.get().getId()
        console.log('isSignedIn',isSignedIn, this.sendEmailUserID)
      }
    },
    signInForGoogle() {
      gapi.auth2.getAuthInstance().signIn();
    },
    signOutForGoogle(event) {
      gapi.auth2.getAuthInstance().signOut();
    },
    async sendEmail(){
      const list = this.selectedFriendsList
      const numRange = [list.length, this.recoveryNumber]
      const secretWords = this.secretWords;
      const splis = split(secretWords, 'CUSTOM')
      console.log('splis', splis)

      const userName = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName()
      const userEmail = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail()
      const backupSeetingData = await this.$store.dispatch('UpdateBackupSettingDataForStorage', { updateType:'get' })
      const backupName = backupSeetingData && backupSeetingData.name
      const mesList = []
      list.forEach((i,index)=>{
        const headers_obj = {
          'To': i.email,
          'Subject': `EigenSecretSplit For ${backupName}`,
          'bodyText': 'text/html'
        };
        const message = splis[index];
        let email = '';
        for(var header in headers_obj){
          email += header += ": "+headers_obj[header]+"\r\n";
        }
        // email += "\r\n" + message;
        // email += "\r\nHello,\r\n"+`这是一封来自您的好友${userName}发送重要邮件.内容为：${message}.\r\n请您务必妥善保管好该内容.`;
        const formatStr = `
        Dear EigenSecret user:\r\n
        We received a request to back up your friend ${userEmail} secret share through your email address. 
        Please keep the following secret share in a safe place so that your friend can recover the secret:\r\n
        ${message}\r\n
        Please do not forward or provide this secret share to anyone, and please do not delete this email, 
        in case of causing trouble for your friend to recover the secret.
        `
        const formatStr1 = `
        <div style="border: 1px solid #dfdfdf">
        <div style="width: 80%;height: 100px;background-color:blue;color: #fff;line-height: 100px;text-align:center">welcome!</div>
        Dear EigenSecret user:\r\n
        We received a request to back up your friend ${userEmail} secret share through your email address. 
        Please keep the following secret share in a safe place so that your friend can recover the secret:\r\n
        ${message}\r\n
        Please do not forward or provide this secret share to anyone, and please do not delete this email, 
        in case of causing trouble for your friend to recover the secret.
        </div>
        `
        if (this.$route.query.email = 'test') {
          email += "\r\n" + formatStr1;
        } else {
          email += "\r\n" + formatStr;
        }
        // email += "\r\n" + formatStr;
        mesList.push(email)
        console.log('email', email)
      })
      console.log('mesList', mesList)
      const prom = []
      mesList.forEach(mi=>{
        prom.push(this.sendItem(mi))
      })
      Promise.all(prom)
      .then(res=>{
        console.log(res)
        this.confirmChooseFriend = false
        this.showGoogleAuthDialog = false
        this.showStatus = true

        this.signOutForGoogle() // destroy authorization
        this.addViewNum()
        removeFromStorage(['mnemonic', 'privateKey', 'settingdata'])
      })
      .catch(err=>{
        console.log(err)
        Toast('Failed')
      })
      
    },
    async addViewNum() {
      await this.$store.dispatch('addViewNum', { 
        userId: getFromStorage('gUID'), 
        kind: 'secretShare' 
      })
    },
    sendItem(message){
      console.log('message', message) // TODO
      const userID = this.sendEmailUserID
      return new Promise(function (resolve, reject) {
        const sendRequest = gapi.client.gmail.users.messages.send({
          'userId': userID,
          'resource': {
            'raw': window.btoa(message).replace(/\+/g, '-').replace(/\//g, '_')
          }
        });
        sendRequest.execute((a,b,c)=>{
          if (a.code) {
            reject(a,b,c)
          } else {
            resolve(a,b,c);
          }
        })
      })
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    }
  },
  destroyed() {
    this.signOutForGoogle()
  },
  mounted() {
    if (this.$route.query && this.$route.query.type) {
      this.recoveryTypeDisabled = true
      this.step1ButtonTxt = 'Next'
      this.recoveryType = this.$route.query.type === 'pk' ? 'privateKey' : 'mnemonic'
    }
    this.handleClientLoad()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>