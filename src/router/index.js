import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home/index';

const Deposit = () => import('../views/Deposit/index')
const Send = () => import('../views/Send/index')
const Withdraw = () => import('../views/Withdraw/index')
const ThirdLogin = () => import('../views/ThirdLogin/index')
const Backup = () => import('../views/Backup/index')
const SocailSendEmail = () => import('../views/SocailSendEmail/index')
const AddFriends = () => import('../views/SocailSendEmail/AddFriends')
const SocailRecovery = () => import('../views/SocailRecovery/index')
const Introduction = () => import('../views/Introduction/index')

// cache origin push method
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

// rewrite push method
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch((err) => {
    if (VueRouter.isNavigationFailure(err)) {
      return err
    }
    
    return Promise.reject(err)
  })
}

VueRouter.prototype.replace = function (location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject)
  }
  return originalReplace.call(this, location).catch((err) => {
    if (VueRouter.isNavigationFailure(err)) {
      return err
    }
    return Promise.reject(err)
  })
}

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'tlogin',
    meta: {
      title: "thirdLogin",
      hideHeader: true,
    },
    component: ThirdLogin,
  },
  {
    path: '/home',
    /* name: 'home',
    component: Home, */
    name: 'introduction',
    component: Introduction,
  },
  {
    path: '/introduction',
    /* name: 'introduction',
    component: Introduction, */
    name: 'home',
    component: Home,
  },
  {
    path: '/deposit',
    name: 'deposit',
    meta: {
      title: "deposit"
    },
    component: Deposit,
    // component: () => import(/* webpackChunkName: "deposit" */ '../views/Deposit/index'),
  },
  {
    path: '/send',
    name: 'send',
    meta: {
      title: "send"
    },
    component: Send,
    // component: () => import(/* webpackChunkName: "send" */ '../views/Send/index'),
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    meta: {
      title: "withdraw"
    },
    component: Withdraw,
    // route level code-splitting
    // this generates a separate chunk (withdraw.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "withdraw" */ '../views/Withdraw/index'),
  },
  {
    path: '/backup',
    name: 'backup',
    meta: {
      title: "backup",
    },
    component: Backup,
  },
  {
    path: '/ssendemail',
    name: 'ssendemail',
    meta: {
      title: "ssendemail",
    },
    component: SocailSendEmail,
  },
  {
    path: '/srecovery',
    name: 'srecovery',
    meta: {
      title: "srecovery",
    },
    component: SocailRecovery,
  },
  {
    path: '/addfriends',
    name: 'addfriends',
    meta: {
      title: "addfriends",
    },
    component: AddFriends,
  },
];

const router = new VueRouter({
  mode: 'history', // 'hash'
  base: process.env.BASE_URL,
  routes,
});

export default router;
