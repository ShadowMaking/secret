<template>
	<div class="add-proposal-page content-box">
		<v-navTitle title="New proposal" helpUrl="docs/usage/Send"></v-navTitle >
		<div class="add-proposal-content content-page">
			<p class="proposal-des">You need to have a minimum of {{voteThreshold}} governance token in order to submit a proposal.</p>
			<div class="warnging-tip">
				<el-tag type="warning"><i class="el-icon-warning"></i>
				  <span v-if="addSubmitDisabled">{{errorTip}}, so you can't submit it temporarily.</span>
					<span>{{currentVotes}} Vote(s)</span>
					<span v-if="delegateTo">, Delegate to {{delegateTo}}</span>
				</el-tag>
			</div>
			<div class="proposal-title">Please select the module proposal to be upgraded:</div>
			<div class="module-list">
				<el-select v-model="selectModal" placeholder="Please choose" class="module-select">
					<el-option
						v-for="item in moduleList"
						:key="item.id"
						:label="item.title"
						:value="item.proxyAddress">
					</el-option>
				</el-select>
			</div>
			<div class="proposal-title">Please enter new contract address:</div>
			<el-input v-model="proposalNewContract" placeholder="Please enter"></el-input>
			<div class="proposal-title">Proposal Voting Period about <span style="font-weight: bold">{{votePeriod}}</span> days</div>
			<div class="proposal-title">Description:</div>
			<el-input type="textarea" v-model="proposalDes" :autosize="{ minRows: 6, maxRows: 8}"
				placeholder="Please enter a description of the proposal"></el-input>
			<div class="add-proposal-btn">
				<el-button type="primary" class="common-form-btn" :loading="addBtnLoading" @click="addSubmit" :disabled="addSubmitDisabled">Submit</el-button>
			</div>
		</div>
		<v-loadingPopup :show="showLoading" :showSpinner="false" />
		<v-confirmModal
			:show="showTradeConfirm"
			type="New Proposal"
			:metadata="sendMetadata"
			@close="showTradeConfirm=false"
			@reject="cancelCreate"
			@confirm="confirmCreate" />
		<v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
		<v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
	</div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers, utils } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'
import { getContractAt, getConnectedAddress, getBalanceByAddress, getDecryptPrivateKeyFromStore, isLogin, getEstimateGas, getConnectedUserAddress, getEncryptKeyByAddressFromStore, getSupportNet, addTransHistory } from '@/utils/dashBoardTools';

import GovernanceToken from "@/assets/contractJSON/GovernanceToken.json";
import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernanceTokenRouter, GovernorAlphaRouter, securityModuleRouter, walletTransactionRouter } from '@/utils/global';

import { getInfoFromStorageByKey } from '@/utils/storage';

import InputPswModal from '@/components/InputPswModal'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import resultModal from '@/components/ResultModal';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';

import { formatErrorContarct } from '@/utils/index'
import { BigNumber } from "bignumber.js";

Vue.use(Toast);
Vue.use(Dialog);

export default {
	name: 'addProposal',
	data() {
		return {
			moduleList: [
			 {title: 'TransactionModule-' + walletTransactionRouter, id: 1, proxyAddress: walletTransactionRouter},
			 {title: 'SecurityModule-' + securityModuleRouter, id: 2, proxyAddress: securityModuleRouter}
			],
			selectModal: '',
			proposalNewContract: '',
			proposalDes: '',
			addBtnLoading: false,
			showLoading: false,

			GovernanceTokenRouter,
			GovernorAlphaRouter,

			overrides: {
				gasLimit: 8000000,
				gasPrice: 20000000000,//wei
			},

			currentChainInfo: null,
			sendMetadata: null,
			defaultNetWork: '',
			showTradeConfirm: false,

			showResultModal: false,
			resuletContent: 'Submitted Success',
			needResultColse: false,
			addSubmitDisabled: false,

			currentVotes: '--',
			delegateTo: '',
			votePeriod: '--',
			voteThreshold: '--',
			hasIngProposal: false,
			errorTip: '--',

			// ***************** inputPsw start ***************** //
			userPsw: '',
			publicKey: '',
			aesKey: '', // every decrypt has the same aesKey
			encryptPsw: '',
			encryptPrivateKeyPublicKey: '',
			encryptCr1: '',
			confirmPswBtnLoading: false,
			showInputPswModal: false,
			// ***************** inputPsw end ***************** //
		}
	},
	components: {
		"v-navTitle": navTitle,
		'v-inputPsw': InputPswModal,
		'v-confirmModal': ConfirmModal,
		'v-loadingPopup': LoadingPopup,
		'v-resultModal': resultModal,
	},
	
	methods: {
		async addSubmit() {
			console.log(this.selectModal)
			this.addBtnLoading = true
			const selectedConnectAddress = getConnectedAddress()
			const connectBalance = await getBalanceByAddress(selectedConnectAddress)
			if (connectBalance < 0) {
				Toast('Insufficient Funds')
				this.addBtnLoading = false
				return
			}
			if (!this.checkData()) { 
				this.addBtnLoading = false
				return 
			}
			// check privateKey whether is existed
			const privateKey = await getDecryptPrivateKeyFromStore(this)
			if (!privateKey) {
				this.showInputPswModal = true;
				return
			}
			await this.showConfirmModal()

		},
		checkData() {
			const userId = getInfoFromStorageByKey('gUID')
			if (!userId) {
				Toast('Please Login')
				return false
			}
			if (!this.selectModal) {
				Toast('Please select the module')
				return false
			}
			if (!this.proposalNewContract) {
				Toast('Please enter new contract address')
				return false
			}
			if (!utils.isAddress(this.proposalNewContract)) {
				Toast(`Invalid Address`);
				return false;
			}
			if (!this.proposalDes) {
				Toast('Please enter a description of the proposal')
				return false
			}
			return true
		},
		cancelResultModal() {
			this.showResultModal = false
		},
		confirmResultModal() {
			this.showResultModal = false
			this.$router.push({ path: '/proposalList' })
		},
		async showConfirmModal() {
			const isCanSubmit = await this.isCaSubmit()
			if (!isCanSubmit) {
				return
			}
			let thisGasPrice = this.overrides.gasPrice.toString()
			let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
			let estimatedGasFee = await getEstimateGas('gasUsed')

			this.sendMetadata = {
				from: getConnectedAddress(),
				to: this.GovernorAlphaRouter,
				gas: this.overrides.gasLimit,
				gasPrice: gasPrice,
				value: 0,
				symbolName: 'ETH',
				netInfo: this.currentChainInfo,
				DATA: '0x',
				estimatedGasFee: estimatedGasFee
			}
			this.showTradeConfirm = true
			this.addBtnLoading = false
		},
		async isCaSubmit() {
			if (!getSupportNet()) {
				this.addBtnLoading = false
				return false
			}
			const selectedConnectAddress = getConnectedAddress()
			
			const connectBalance = await getBalanceByAddress(selectedConnectAddress)
			let estimatedGasFee = await getEstimateGas('gasUsed', 5000000000)
			console.log(connectBalance)
			if (connectBalance < estimatedGasFee) {
				Toast('Insufficient Funds')
				this.addBtnLoading = false
				return false
			}

			const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
			console.log(GovernanceTokenContract)
			
			const balance = await GovernanceTokenContract.getCurrentVotes(selectedConnectAddress)
			if (balance <= 0) {
				this.addBtnLoading = false
				Toast('You have no GovernanceToken to initiate')
				return false
			}

			const isDelegates = await GovernanceTokenContract.delegates(selectedConnectAddress)
			if (isDelegates == '0x0000000000000000000000000000000000000000') {
				this.addBtnLoading = false
				Toast('You need to delegate first')
				setTimeout(() =>{
					this.$router.push({ path: '/proposalDelegate' })
				}, 2000)
				return false
			}

			const currentVotes = await GovernanceTokenContract.getCurrentVotes(selectedConnectAddress)
			const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
			const proposalThreshold = await GovernorAlphaContract.proposalThreshold()
			if (currentVotes < proposalThreshold) {
				this.addBtnLoading = false
				Toast(`You need at least ${proposalThreshold} GovernanceToken to initiate`)
				return false
			}

			return true
		},
		cancelCreate() {
			this.showTradeConfirm = false
			Toast('Cancel')
		},
		confirmCreate({ overrides }) {
			this.overrides.gasLimit = overrides.gasLimit
			this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
			this.dealDataAddContract()
		},
		async dealDataAddContract() {
			this.showLoading = true;
			const target = this.selectModal
			const value = 0
			const signature = 'setImplementation(address)'
			const description = this.proposalDes
			const calldata = ethers.utils.defaultAbiCoder.encode( 
			 ['address'],
			 [this.proposalNewContract]
			)
			
			const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
			console.log(GovernorAlphaContract)
			
			
			GovernorAlphaContract.propose(
						[target],
						[value],
						[signature],
						[calldata],
						description,
						this.overrides
			).then(async tx=> {
					console.log(tx)
					this.showLoading = false
					this.showResultModal = true
					addTransHistory(tx, 'New Propose', this)
					tx.wait().then(async res => {
						console.log('New Propose:', res)
					})
			}).catch(error => {
					console.log(error)
					this.showLoading = false
					let errorValue = formatErrorContarct(error)
					Toast(errorValue)
			})
		},
		async getIsHasProposal() {
			const selectedConnectAddress = getConnectedAddress()
			const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
			const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
			if (!GovernanceTokenContract) {return}

			const proposalList = await GovernorAlphaContract.queryFilter(
                    GovernorAlphaContract.filters.ProposalCreated(),
      )
		  for(let i=0; i<proposalList.length;i+=1) {
        if (selectedConnectAddress == proposalList[i].args.proposer.toLocaleLowerCase()) {
        	const proposalStatus = await GovernorAlphaContract.state(proposalList[i].args.id)
        	if (proposalStatus == 0 || proposalStatus == 1 || proposalStatus == 4 || proposalStatus == 5) {
        		this.hasIngProposal = true
        		this.addSubmitDisabled = true
        		this.errorTip = 'You already have an proposal'
        	}
        }
      }

			const balance = await GovernanceTokenContract.getCurrentVotes(selectedConnectAddress)
		  const proposalThreshold = await GovernorAlphaContract.proposalThreshold()
		  this.voteThreshold = await this.dealBigNumber(proposalThreshold)
		  if (balance < proposalThreshold) {
				this.addSubmitDisabled = true
				this.errorTip = 'Your current token is insufficient'
			}
		  this.currentVotes = await this.dealBigNumber(balance)
		  const isDelegates = await GovernanceTokenContract.delegates(selectedConnectAddress)
			console.log(isDelegates)
      if (isDelegates == '0x0000000000000000000000000000000000000000') {
        this.delegateTo = ''
      } else {
        this.delegateTo = isDelegates.slice(0,6) + '...' + isDelegates.slice(-4)
      }
      const votingPeriod = await GovernorAlphaContract.votingPeriod()
      this.votePeriod = Math.ceil((votingPeriod * 15)/(3600 * 24))

			// const proposalList = await GovernorAlphaContract.queryFilter(
			//               GovernorAlphaContract.filters.ProposalCreated(null, selectedConnectAddress),
			//           )
			// console.log(proposalList)
		},
		async dealBigNumber(bigValue) {
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const decimals = await GovernanceTokenContract.decimals() 
      const decimalsIsBigNumber = web3.utils.isBigNumber(decimals)||web3.utils.isHexStrict(decimals)||!_.isFinite(decimals)
      const decimalsNumber = BigNumber(10).pow((decimalsIsBigNumber?decimals.toNumber():decimals)) // .toNumber() 1000000000000000000
      const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(bigValue)))
      const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(2,1) || 0.00
      return balanceFormatString
    },
		async confirmPswOk({ show, psw }) {
			this.userPsw = psw; // password of user input for encrypt privateKey
			this.confirmPswBtnLoading = true
			const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
			if (hasError) {
				Toast('Get PublickKey Failed! Retry')
				this.confirmPswBtnLoading = false
				return
			}
			this.publicKey = publicKey;
			// console.log(`GetPublicKey result is: ${publicKey}`)
			
			// const password = ecies.crypto.randomBytes(16).toString("base64");
			const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
			const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
			// console.log('aesKey:', aesKey)
			this.aesKey = aesKey
			this.encryptPsw = encryptPsw
			this.encryptCr1 = encryptCr1
			// console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

			// to decrypt privatekey
			const userId = getInfoFromStorageByKey('gUID')
			const address = getConnectedUserAddress()
			const encryptKey = await getEncryptKeyByAddressFromStore(address, this)
			const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
			if(decryptInfo.hasError) {
				Toast('DecryptPrivateKeyByEcies failed! Retry!')
				this.confirmPswBtnLoading = false
				return
			}
			const decryptedPrivateKey = decryptInfo.data
			const privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
			privateKey && (await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey, privateKey }))

			this.confirmPswBtnLoading = false
			this.showInputPswModal = false
			await this.getIsHasProposal()
		},
		async getIsShowPwd() {
			// check privateKey whether is existed
			const privateKey = await getDecryptPrivateKeyFromStore(this)
			if (!privateKey) {
				this.showInputPswModal = true;
				return
			}
			await this.getIsHasProposal()
		},
		_handleNetworkChange({ chainInfo, from }) {
			console.log(chainInfo)
		},
		handleAccountChange(addressInfo) {
			console.log(addressInfo)
		},
		getDefaultNetWork() {
			const info = getInfoFromStorageByKey('netInfo')
			return info && info['id'] || 1
		},
	},
	async created() {
		this.defaultNetWork = this.getDefaultNetWork()
		if (!isLogin()) {
			Toast('Please Login')
			return
		}
		const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
		console.log(netInfo)
		if (netInfo) {
			this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
		} else {
			this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
		}
		this.overrides.gasPrice = await getEstimateGas('gasPrice', 5000000000)
		this.getIsShowPwd()
		// const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
		// const df = await GovernorAlphaContract.timelock()
		// console.log(web3.utils.hexToNumberString(df))
		// console.log(GovernorAlphaContract)
		// const tx = await GovernorAlphaContract.cancel(1, this.overrides)
		// console.log(tx)
	},
	async mounted() {
		this.$eventBus.$on('networkChange', this._handleNetworkChange)
		this.$eventBus.$on('changeAccout', this.handleAccountChange)
	},
}
</script>
<style lang="scss" scoped>
	@import 'index.scss';
	.el-select-dropdown__item {
		padding: 0 20px !important;
	}
</style>
