import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey } from '@/utils/storage';
import { DEFAULT_NETLIST } from '@/utils/global';
import _ from 'lodash'

const auth = {
  state: {
    connectNet: '',
  },

  mutations: {
    SET_LINK_NET: (state, netKey) => {
      state.connectNet = netKey;
    },
  },

  actions: {
    // 获取已连接的RPC网络, 没有则默认连接以太坊主网
    getConnectNet({ commit }) {
      return new Promise(resolve => {
        const net = getFromStorage('connectNet');
        const defaultNetInfo = DEFAULT_NETLIST[0];
        let netInfoKey = defaultNetInfo['key']; // 只存储key值，在global中的DEFAULT_NETLIST去过滤
        if (net) {
          netInfoKey = window.JSON.parse(net);
        }
        commit('SET_LINK_NET', netInfoKey)
        saveToStorage({'connectNet': window.JSON.stringify(netInfoKey)})
        resolve(netInfoKey);
      })
    },
    // 更新连接的RPC网络
    updateConnectNet({commit}, netKey) {
      return new Promise(resolve => {
        commit('SET_LINK_NET', netKey)
        removeFromStorage(['netInfo']);
        saveToStorage({'connectNet': window.JSON.stringify(netKey)})
        resolve();
      })
    },
    // 更新网络List
    updateNetList({commit}, netInfo) {
      return new Promise(resolve => {
        const netList = getInfoFromStorageByKey('netList')||[];
        netList.push(netInfo);
        saveToStorage({'netList': window.JSON.stringify(netList)})
        resolve(netList);
      })
    },
    // 获取自定义网络list
    getCustomNetList({commit}) {
      return new Promise(resolve => {
        const netList = getInfoFromStorageByKey('netList')||[];
        resolve(netList);
      })
    },
    // 获取全部网络list
    getAllNetList({commit}) {
      return new Promise(resolve => {
        const netList = getInfoFromStorageByKey('netList')||[];
        const pairNetList = getInfoFromStorageByKey('netPairList')||[];
        const allList = [].concat(DEFAULT_NETLIST, pairNetList, netList);
        resolve(allList);
      })
    },
    // 存储网络配对信息
    saveNetPairList({commit}, paiNetInfo) {
      return new Promise((resolve, reject) => {
        const pairNetList = getInfoFromStorageByKey('netPairList')||[];
        // 判断是否重复
        const target = _.find(pairNetList, {key: paiNetInfo['key']});
        if (!target) {
          const allList = [].concat(pairNetList, [paiNetInfo]);
          saveToStorage({'netPairList': window.JSON.stringify(allList)})
          resolve(allList);
        } else {
          reject('该网络配对已存在')
        }
      })
    },
    // 获取网络配对List
    getNetPairList({commit}) {
      return new Promise(resolve => {
        const netList = getInfoFromStorageByKey('netPairList')||[];
        const allList = [].concat(netList);
        resolve(allList);
      })
    },
  }
}

export default auth
